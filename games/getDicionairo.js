const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const fs = require('fs');

const URL = 'https://www.ime.usp.br/~pf/dicios/br-utf8.txt';

const envPath = path.join(__dirname, '..', '.env'); // Subir uma pasta
dotenv.config({ path: envPath });

const { TEMRMO_TAMANHO_DA_PALAVRA } = process.env;

console.log('Valor de TEMRMO_TAMANHO_DA_PALAVRA:', TEMRMO_TAMANHO_DA_PALAVRA); // Verificação

const NOME_ARQUIVO = 'palavras.json';
https.get(URL, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    let palavras = data
      .split('\n')
      .map(p => p.trim().toLowerCase())
      .filter(p => /^[a-záéíóúãõâêîôûç]+$/i.test(p));

    if (typeof TEMRMO_TAMANHO_DA_PALAVRA === 'string') {
      // Garantir que TEMRMO_TAMANHO_DA_PALAVRA é um número
      const tamanhoPalavraInt = parseInt(TEMRMO_TAMANHO_DA_PALAVRA);
      if (!isNaN(tamanhoPalavraInt)) {
        palavras = palavras.filter(p => p.length === tamanhoPalavraInt);
      } else {
        console.log('Valor de TEMRMO_TAMANHO_DA_PALAVRA não é um número válido.');
      }
    }

    const resultado = palavras.map(p => ({ palavra: p }));

    fs.writeFileSync(NOME_ARQUIVO, JSON.stringify(resultado, null, 2), 'utf-8');
    console.log(`✅ JSON gerado com ${palavras.length} palavras.`);
  });

}).on('error', (err) => {
  console.error('Erro ao baixar:', err.message);
});
