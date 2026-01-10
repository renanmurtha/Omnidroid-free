// biscoitoSorte.js
const { delayResponse } = require('../utils/delayResponse');
const { frases } = require('../games/biscoitoFrases');


const fila = [];
let processando = false;

const pegarFrase = () => frases[Math.floor(Math.random() * frases.length)];

function solicitarBiscoito(client, channel, usuario) {
  fila.push({ client, channel, usuario });

  if (!processando) {
    processando = true;
    processarFila();
  }
}

async function processarFila() {
  while (fila.length > 0) {
    const DELAY = Math.floor(Math.random() * 5 + 1) * 1000;
    const { client, channel, usuario } = fila.shift();
    const mensagem = `🥠 ${usuario} abriu o biscoito da sorte e leu: "${pegarFrase()}"`;

    delayResponse(client, channel, mensagem, DELAY);

    await new Promise((resolve) => setTimeout(resolve, DELAY));
  }
  processando = false;
}

module.exports = {
  solicitarBiscoito
};
