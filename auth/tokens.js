
//utils\tokens.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const ENV_PATH = path.resolve('.env');
dotenv.config();

/**
 * Atualiza ou insere tokens de acesso no .env
 * - Garante que OAUTH_TOKEN e REFRESH_TOKEN existam corretamente
 * - Remove prefixo `oauth:` do token
 * - Substitui corretamente se as variáveis existirem
 */
function updateEnvToken(accessToken, refreshToken) {
    dotenv.config();

    let envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';

    const lines = envFile.split('\n');
    const updated = new Set();
    const newLines = lines.map(line => {
        if (line.startsWith('OAUTH_TOKEN=')) {
            updated.add('OAUTH_TOKEN');
            return `OAUTH_TOKEN=oauth:${accessToken}`;
        }
        if (line.startsWith('REFRESH_TOKEN=')) {
            updated.add('REFRESH_TOKEN');
            return `REFRESH_TOKEN=${refreshToken}`;
        }
        return line;
    });

    if (!updated.has('OAUTH_TOKEN')) {
        newLines.push(`OAUTH_TOKEN=oauth:${accessToken}`);
    }

    if (!updated.has('REFRESH_TOKEN')) {
        newLines.push(`REFRESH_TOKEN=${refreshToken}`);
    }

    fs.writeFileSync('.env', newLines.join('\n'));
    console.log("✅ Tokens atualizados no arquivo .env");

    // *** Atualiza o process.env com os novos tokens na memória ***
    dotenv.config();
}


function saveTokens(accessToken, refreshToken) {
    console.log('✅ Salvando tokens...');
    updateEnvToken(accessToken, refreshToken);
}

module.exports = {
    saveTokens,
    updateEnvToken
};
