const complementosPositivos = [
  "embarcarão em jornadas emocionantes pelos planos do amor 🌍",
  "viverão aventuras que desafiam o tempo e o espaço ⏳✨",
  "criarão memórias que brilharão como estrelas no céu noturno 🌟",
  "serão luz um na vida do outro, iluminando caminhos secretos 🔆",
  "trocarão energias que só os corações mais raros conhecem 💖",
  "dançarão na tempestade com paixão incontrolável 🌪️💃",
  "formarão uma conexão tão forte que nem os astros poderão separar 🔗",
  "viverão momentos doces como o néctar dos deuses 🍯",
  "serão a harmonia perfeita entre fogo e água 🔥💧",
  "criarão uma história que será cantada pelas eras 📜",
];

const complementosNeutros = [
  "navegarão águas misteriosas, sem mapa ou bússola 🧭",
  "explorarão territórios incertos, com corações abertos 💫",
  "terão encontros que podem ser tempestades ou calmarias 🌦️",
  "se envolverão em mistérios que só o tempo revelará ⏳",
  "caminharão numa linha tênue entre o acaso e o destino 🎲",
  "trocarão olhares carregados de enigmas e segredos 🔮",
  "será uma dança lenta entre aproximação e distância 🩰",
  "viverão um jogo onde as regras mudam a cada passo 🎭",
  "serão como duas estrelas que se cruzam sem saber por quanto tempo ✨",
  "estão destinados a surpreender, seja para bem ou para o desafio 🌓",
];

const complementosNegativos = [
  "enfrentarão tempestades que testarão até os mais fortes 🌀",
  "se perderão em labirintos onde nem mesmo a luz alcança 🌑",
  "viverão dramas que farão o cosmos suspirar de exaustão 😰",
  "cairão em encantamentos confusos sem manual de saída 🧩",
  "terão encontros que acenderão fogueiras perigosas 🔥",
  "serão como cometas que brilham rápido e se apagam na escuridão ☄️",
  "vivenciarão conflitos que ecoarão por eras esquecidas 📣",
  "sentirão ciúmes tão intensos que farão os ventos mudarem de rumo 🌬️",
  "será uma história onde o caos reina soberano 👑",
  "viverão um feitiço instável que ninguém poderá controlar 🪄",
];

const finaisPositivos = [
  "Tem tudo para ser épico!",
  "O universo sorri para eles.",
  "Essa história vai iluminar o chat!",
  "Será uma lenda que ecoará no tempo.",
  "Os astros conspiram a favor.",
  "Prevejo um final cheio de magia e luz.",
];

const finaisNeutros = [
  "O destino os manterá em suspense.",
  "Só o tempo revelará o desfecho.",
  "Uma surpresa os aguarda na próxima esquina.",
  "Entre o amor e o mistério, caminham sem rumo certo.",
  "Serão lembrados pelo que vierem a construir.",
];

const finaisNegativos = [
  "Preparem-se para o caos que se avizinha.",
  "Nem mesmo as estrelas conseguem decifrar este destino.",
  "Aviso: emoções fortes à frente.",
  "O fogo pode queimar mais do que iluminar.",
  "Um espetáculo dramático está prestes a começar.",
];

function getFinalPorChance(chance) {
  if (chance >= 70) {
    return finaisPositivos[Math.floor(Math.random() * finaisPositivos.length)];
  } else if (chance >= 40) {
    return finaisNeutros[Math.floor(Math.random() * finaisNeutros.length)];
  } else {
    return finaisNegativos[Math.floor(Math.random() * finaisNegativos.length)];
  }
}

function gerarFrase(user1, user2) {
  const chance = Math.floor(Math.random() * 101); // 0 a 100

  let complemento;
  if (chance >= 70) {
    complemento = complementosPositivos[Math.floor(Math.random() * complementosPositivos.length)];
  } else if (chance >= 40) {
    complemento = complementosNeutros[Math.floor(Math.random() * complementosNeutros.length)];
  } else {
    complemento = complementosNegativos[Math.floor(Math.random() * complementosNegativos.length)];
  }

  const final = getFinalPorChance(chance);

  const aberturas = [
    "🧙‍♀️ Calem-se, mortais... Eu, a grande Maga Patalójika, tive uma visão!",
    "🔮 Sob o brilho do cristal encantado, vejo com clareza:",
    "📿 Os astros sussurraram ao meu ouvido com mistérios antigos:",
    "✨ Em meio às runas e fumaça do incenso, percebo com nitidez:",
    "🔮 Pela névoa das eras, revelo o seguinte presságio:",
  ];
  const abertura = aberturas[Math.floor(Math.random() * aberturas.length)];

  return `${abertura} Vejo que ${user1} e ${user2} ${complemento}. ${final}`;
}

const semPar = [
  "As energias estão instáveis… o véu mantém tudo oculto ✨",
  "Os véus do acaso estão turvos… nada se revela 🔮",
  "As forças estão em desalinho… tudo permanece oculto 🔮",
  "O véu permanece fechado… o universo guarda seus segredos 🔮",
  "As energias não estão claras… tudo permanece na penumbra ✨",
  "O acaso não respondeu… nada surge do além 🔮",
  "O fluxo do destino está suspenso… tudo permanece velado ✨",
  "As forças sutis se dispersaram… nenhum sinal emerge 🔮",
  "O oráculo silencia… o vazio domina ✨",
  "As estrelas ocultam seus sinais… nada se move 🔮",
  "O plano invisível está instável… tudo permanece encoberto ✨",
  "O véu etéreo não se abriu… silêncio sobre tudo 🔮",
  "As energias aguardam realinhamento… nada rompe o véu ✨",
  "As energias estão instáveis… o véu permanece fechado ✨",
  "Os véus do acaso estão turvos… nada se revela 🔮",
  "O destino hesita… os sinais permanecem ocultos ✨",
  "Nada se manifesta… o fluxo das energias está bloqueado ✨",
  "O acaso se esconde… nenhum segredo se revela 🔮",
  "O fluxo do destino está instável… tudo permanece encoberto ✨",
  "As forças sutis se dispersaram… nada atravessa o véu 🔮",
  "O oráculo permanece calado… o desconhecido domina ✨",
  "As estrelas se ocultam… nada surge no horizonte 🔮",
  "O plano invisível treme… os sinais estão bloqueados ✨",
  "As energias aguardam realinhamento… nenhuma revelação surge ✨"
];

const { delayResponse } = require('../utils/delayResponse');
const DELAY = 30; 
async function executarOraculum(client, channel, username, usuariosAtivos) {

  const disponiveis = Array.from(usuariosAtivos).filter(user =>
    user.toLowerCase() !== username.toLowerCase()
    && user.toLowerCase() !== client.getUsername().toLowerCase()
  );

  if (disponiveis.length === 0) {
    let semMatch = semPar[Math.floor(Math.random() * semPar.length)];
    delayResponse(client, channel, `@${username}, ${semMatch}`, DELAY);
    return;
  }

  const match = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  const frase = gerarFrase(username, match);
  delayResponse(client, channel, frase, DELAY);
}

module.exports = { executarOraculum };
