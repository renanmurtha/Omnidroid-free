const fs = require('fs');
const path = require('path');

const ARQUIVO_JSON = path.join(__dirname, 'palavras.json');

function pegarPalavraAleatoria() {
  const data = fs.readFileSync(ARQUIVO_JSON, 'utf-8');
  const palavras = JSON.parse(data);
  const idx = Math.floor(Math.random() * palavras.length);
  return palavras[idx].palavra;
}

module.exports = { pegarPalavraAleatoria };
