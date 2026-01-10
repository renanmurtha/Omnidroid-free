// forcaGame.js

// Função para remover acentos de uma string
function removerAcentos(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos da string
}

const { TEMRMO_TAMANHO_DA_PALAVRA, TEMRMO_MAX_ERROS } = process.env;
class ForcaGame {
  constructor(palavra, dica = `📖 Palavra com ${TEMRMO_TAMANHO_DA_PALAVRA} letras. 📖`) {
    this.palavra = palavra.toUpperCase();  // Palavra toda maiúscula
    this.palavraSemAcento = removerAcentos(this.palavra); // Palavra sem acentos
    this.dica = dica;
    this.letrasCertas = new Set();  // Letras que o jogador acertou
    this.letrasErradas = new Set(); // Letras que o jogador errou
    this.usuariosEliminados = new Set(); // Usuários eliminados
    this.errosPorUsuario = {}; // Contador de erros por usuário
    this.filaUsuariosComErro = []; // Ordem dos usuários com erro
    this.status = 'em_jogo'; // Status do jogo
    this.maxErros = parseInt(TEMRMO_MAX_ERROS); // Limite de erros
  }

  // Função estática para iniciar o jogo
  static iniciarJogo(pegarPalavraAleatoria) {
    const palavra = pegarPalavraAleatoria(); // Pega a palavra aleatória
    const novoJogo = new ForcaGame(palavra, `📖 Palavra com ${TEMRMO_TAMANHO_DA_PALAVRA} letras. 📖`);
    console.log(`🟢 Novo jogo iniciado com a palavra: ${palavra}`);
    return novoJogo;
  }

  // Função estática para parar o jogo
  static pararJogo(jogoAtivo) {
    if (!jogoAtivo) {
      console.log('⚠️ Nenhum jogo ativo.');
      return null;
    }
    console.log('🔴 Jogo da forca encerrado.');
    return null;
  }

  // Função para obter a palavra escondida
  getPalavraEscondida() {
    return this.palavra
      .split('')
      .map((l) => {
        const letraSemAcento = removerAcentos(l); // Normaliza para evitar acentos
        return this.letrasCertas.has(letraSemAcento) ? l : '_'; // Verifica se a letra foi acertada
      })
      .join(' ');
  }

  // Função para verificar se um usuário foi eliminado
  verificarEliminacao(usuario) {
    const tentativas = this.errosPorUsuario[usuario] || 0;
    if (tentativas >= this.maxErros) {
      this.usuariosEliminados.add(usuario);
      return true;  // Eliminado
    }
    return false;  // Não eliminado
  }

  // Função para verificar se o jogo terminou
  verificarFimDeJogo() {
    const jogadoresRestantes = this.filaUsuariosComErro.filter(u => !this.usuariosEliminados.has(u));
    if (jogadoresRestantes.length === 0) {
      this.status = 'derrota';
      return true;
    }
    return false;
  }

  // Função para tentar uma letra
  tentarLetra(letra, usuario) {
    if (!usuario) return `⚠️ Usuário não informado.`;
    const userTag = `@${usuario}`;

    // Verifica se o jogo não está em andamento
    if (this.status !== 'em_jogo') {
      return `⚠️ ${userTag}, o jogo já terminou! Palavra: ${this.palavra}`;
    }

    // Verifica se o usuário já foi eliminado
    if (this.usuariosEliminados.has(usuario)) {
      return `🚫 ${userTag}, você está eliminado e não pode mais jogar nesta rodada.`;
    }

    // Adiciona o usuário à fila de participantes se não estiver
    if (!this.filaUsuariosComErro.includes(usuario)) {
      this.filaUsuariosComErro.push(usuario);
    }

    // Normaliza a letra para maiúsculas
    letra = letra.toUpperCase();
    const letraNormalizada = removerAcentos(letra);

    // Verifica se a letra já foi tentada
    if (this.letrasCertas.has(letraNormalizada) || this.letrasErradas.has(letraNormalizada)) {
      return `⚠️ ${userTag}, a letra "${letra}" já foi tentada.`;
    }

    // Verifica se a letra é correta
    if (this.palavraSemAcento.includes(letraNormalizada)) {
      this.letrasCertas.add(letraNormalizada);

      const todas = new Set(this.palavraSemAcento.split(''));
      if ([...todas].every((l) => this.letrasCertas.has(l))) {
        this.status = 'vitoria';
        return `🎉 Parabéns, ${userTag}! Palavra completa: ${this.palavra}`;
      }

      return `✅ ${userTag}, letra "${letra}" correta! Palavra: ${this.getPalavraEscondida()}`;
    } else {
      // Conta o erro do usuário
      if (!this.errosPorUsuario[usuario]) {
        this.errosPorUsuario[usuario] = 0;
      }
      this.errosPorUsuario[usuario] += 1;
      this.letrasErradas.add(letraNormalizada);

      // Verifica se o usuário foi eliminado após o erro
      const eliminado = this.verificarEliminacao(usuario);
      if (eliminado) {
        const fim = this.verificarFimDeJogo();
        if (fim) {
          return `💀 ${userTag}, foi o último eliminado. Fim de jogo! 📖 A palavra era: ${this.palavra}`;
        }
        return `❌ ${userTag}, letra "${letra}" incorreta! Erros: ${this.errosPorUsuario[usuario]}/${this.maxErros}. Você foi eliminado. Palavra: ${this.getPalavraEscondida()}`;
      }

      return `❌ ${userTag}, letra "${letra}" incorreta! Erros: ${this.errosPorUsuario[usuario]}/${this.maxErros}. Palavra: ${this.getPalavraEscondida()}`;
    }
  }

  // Função para chutar a palavra inteira
  chutarPalavra(chute, usuario) {
    if (!usuario) return `⚠️ Usuário não informado.`;

    const userTag = `@${usuario}`;

    // Verifica se o usuário já foi eliminado
    if (this.usuariosEliminados.has(usuario)) {
      return `🚫 ${userTag}, você está eliminado e não pode mais jogar nesta rodada.`;
    }

    // Verifica se o jogo não está em andamento
    if (this.status !== 'em_jogo') {
      return `⚠️ ${userTag}, o jogo já terminou! Palavra: ${this.palavra}`;
    }

    // Adiciona o usuário à fila de participantes se não estiver
    if (!this.filaUsuariosComErro.includes(usuario)) {
      this.filaUsuariosComErro.push(usuario);
    }

    // Normaliza o chute para maiúsculas
    chute = chute.toUpperCase();
    console.log(`❗ ${userTag} tentou chutar a palavra: "${chute}"`);

    if (removerAcentos(chute) === this.palavraSemAcento) {
      this.status = 'vitoria';
      return `🎉 ${userTag} acertou a palavra inteira! Parabéns! A palavra era: ${this.palavra}`;
    } else {
      // Elimina o jogador ao errar o chute
      this.usuariosEliminados.add(usuario);
      const fim = this.verificarFimDeJogo();
      if (fim) {
        return `💀 ${userTag}, foi o último eliminado. Fim de jogo! 📖 A palavra era: ${this.palavra}`;
      }

      return `❌ ${userTag} errou o chute e está eliminado desta rodada! Palavra: ${this.getPalavraEscondida()}`;
    }
  }

  // Função para dar a dica
  getDica() {
    return `💡 Dica: ${this.dica}`;
  }

  // Função para obter o status atual do jogo
  getStatus() {
    return `ℹ️ Status do jogo: ${this.status === 'em_jogo' ? 'Em andamento' : this.status === 'vitoria' ? 'Vitória' : 'Derrota'}`;
  }
}

module.exports = ForcaGame;
