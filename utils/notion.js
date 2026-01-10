// utils/notion.js
/**
 * Salva uma anotação no Notion.
 * @param {string} texto - O conteúdo da anotação.
 * @param {string} tipo - A categoria (ex: pocketcasts, estudo, etc).
 * @param {string} userName - Identificador único do usuário (obrigatório se tipo === "react")
 */

const fila = [];
let processando = false;

// ===== CONTROLE POR USUÁRIO PARA "react" =====
const reactUsuarios = {};
const { LIMITE_REACT_DEFAULT, REACT_DAILY_LIMIT } = process.env;

let LIMITE_REACT = Number(REACT_DAILY_LIMIT) || Number(LIMITE_REACT_DEFAULT);

const BLOQUEIO_24H = 24 * 60 * 60 * 1000;
// ============================================


function podeUsarReact(userName) {
  if (!reactUsuarios[userName]) {
    reactUsuarios[userName] = {
      count: 0,
      bloqueadoAte: null,
      ultimoEnvio: null
    };
  }

  const agora = Date.now();
  const usuario = reactUsuarios[userName];

  if (usuario.bloqueadoAte && agora < usuario.bloqueadoAte) {
    return false;
  }

  // Bloqueio expirou → reset
  if (usuario.bloqueadoAte && agora >= usuario.bloqueadoAte) {
    usuario.count = 0;
    usuario.bloqueadoAte = null;
  }
  // 🔴 Intervalo mínimo entre envios (exemplo: 60 segundos) 
  const INTERVALO_ENVIO = 70 * 1000;
  if (usuario.ultimoEnvio && (agora - usuario.ultimoEnvio) < INTERVALO_ENVIO) {
    return "intervalo";
  }
  return true;
}

function registrarSucessoReact(userName) {

  const usuario = reactUsuarios[userName];
  const agora = Date.now();
  usuario.count++;
  console.log(`[Notion log]: Usuario: ${userName} - Limite: ${usuario.count}`);
  usuario.ultimoEnvio = agora;
  if (usuario.count >= LIMITE_REACT) {
    usuario.bloqueadoAte = agora + BLOQUEIO_24H;
  }
}

// ============================================

async function salvarAnotacaoCompleta(tipo = "Geral", texto, userName) {
  if (texto == null || (typeof texto === "string" && texto.trim() === "")) {
    console.warn("[Notion log]: Texto inválido: vazio ou nulo");
    return "erro";
  }

  // ===== CHECAGEM ANTES (SEM CONTAR) =====
  if (tipo === "react") {
    if (!userName) {
      console.warn("[Notion log - React] ⚠️ userName não informado.");
      return "erro";
    }

    const status = podeUsarReact(userName);

    if (status === false) {
      console.warn(`[Notion log - React] ⛔ Usuário ${userName} bloqueado.`);
      return "bloqueado";
    }

    if (status === "intervalo") {
      console.warn(`[Notion log - React] ⏳ Usuário ${userName} precisa aguardar intervalo mínimo.`);
      return "intervalo";
    }
  }
  // =======================================

  let resolver;
  const promessa = new Promise((resolve) => {
    resolver = resolve;
  });

  // 👇 guardamos userName no item da fila
  fila.push({ tipo, texto, userName, _resolver: resolver });

  if (!processando) {
    processarFilaUnica();
  }

  return promessa;
}

async function processarFilaUnica() {
  processando = true;

  while (fila.length > 0) {
    const item = fila[0];
    try {
      const sucesso = await enviarParaNotion(item.tipo, item.texto, item.userName);

      if (sucesso) {
        // ✅ SÓ AQUI conta para react
        if (item.tipo === "react") {
          registrarSucessoReact(item.userName);
        }

        try { item._resolver(true); } catch { }
        fila.shift();
      } else {
        // retry automático, não resolve ainda
        await new Promise(res => setTimeout(res, 5000));
      }
    } catch (err) {
      // erro inesperado ao salvar
      try { item._resolver("erro"); } catch { }
      fila.shift();
    }
  }

  processando = false;
}

async function enviarParaNotion(tipo, texto, userName) {
  const { NOTION_KEY, NOTION_PAGE_REACT_ID, NOTION_PAGE_MARCADOS_ID, NOTION_PAGE_ANOTACAOES_ID } = process.env;

  if (!NOTION_KEY || (!NOTION_PAGE_REACT_ID || !NOTION_PAGE_MARCADOS_ID || !NOTION_PAGE_ANOTACAOES_ID)) {
    console.warn("[Notion] - ⚠️ Variáveis de ambiente do Notion não configuradas.");
    return false;
  }
  let database_id = "";
  let checkboxName = "";
  let colunaAnotacao = "Anotação";
  switch (tipo) {
    case "react":
      checkboxName = "Visualizado";
      colunaAnotacao = "URL";
      database_id = NOTION_PAGE_REACT_ID;
      break;
    case "marcação":
      checkboxName = "Visualizado";
      database_id = NOTION_PAGE_MARCADOS_ID;
      break;
    default:
      checkboxName = "Visualizado";
      database_id = NOTION_PAGE_ANOTACAOES_ID;
      break;
  }

  const str = tipo;
  const novoTipo = str[0].toUpperCase() + str.slice(1).toLowerCase();
  const headers = {
    Authorization: `Bearer ${NOTION_KEY}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

  try {
    // 1️⃣ Pega o database atual
    let db = await fetch(`https://api.notion.com/v1/databases/${database_id}`, { headers })
      .then(r => r.json());

    // 2️⃣ Detecta o título automaticamente
    const colTitulo = Object.keys(db.properties).find(k => db.properties[k].type === 'title');

    // 3️⃣ Lista de colunas que queremos garantir
    const colunasNecessarias = {
      [colunaAnotacao]: (colunaAnotacao === "URL") ? { url: {} } : { rich_text: {} },
      "Tipo": { select: { options: [{ name: novoTipo }] } },
      "Usuário": { rich_text: {} },
      [checkboxName]: { checkbox: {} }
    };

    // 4️⃣ Cria colunas que não existem
    let colunasCriadas = false;
    for (const coluna in colunasNecessarias) {
      if (!db.properties[coluna]) {
        await fetch(`https://api.notion.com/v1/databases/${database_id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            properties: {
              [coluna]: colunasNecessarias[coluna]
            }
          })
        });
        colunasCriadas = true;
      }
    }

    // 5️⃣ Se criou alguma coluna, atualiza o db e espera 1s
    if (colunasCriadas) {
      await new Promise(r => setTimeout(r, 1000));
      db = await fetch(`https://api.notion.com/v1/databases/${database_id}`, { headers })
        .then(r => r.json());
    }

    // 6️⃣ Cria a página
    const agora = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: database_id },
        properties: {
          [colTitulo]: { title: [{ text: { content: agora } }] },
          [colunaAnotacao]: (colunaAnotacao === "URL" && texto)
            ? { url: texto }
            : { rich_text: [{ text: { content: texto } }] },
          "Tipo": { select: { name: novoTipo } },
          "Usuário": { rich_text: [{ text: { content: userName || "Desconhecido" } }] },
          [checkboxName]: { checkbox: false }
        }
      })
    });

    if (res.ok) {
      console.log(`[Notion] - ✅ Sucesso: [${tipo}] salvo no Notion às ${agora} por ${userName}`);
      return true;
    } else {
      const erro = await res.json();
      console.error("[Notion] - ❌ Erro na API do Notion:", erro);
      return false;
    }

  } catch (err) {
    console.error("[Notion] - ❌ Falha na execução:", err.message);
    return false;
  }
}


module.exports = { salvarAnotacaoCompleta };
