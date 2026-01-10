//index.js
const dotenv = require('dotenv');
const result = dotenv.config();
const fs = require('fs');
const { getUserIdFromUsername } = require('./bot/moderation');

if (result.error) {
    throw result.error;
}

// Lista de variáveis obrigatórias
const requiredEnvVars = [
    'CLIENT_ID',
    'CLIENT_SECRET',
    'CHANNEL_NAME',
    'REDIRECT_URI',
    'NOTION_KEY', 
    'NOTION_PAGE_REACT_ID',
    'NOTION_PAGE_MARCADOS_ID',
    'NOTION_PAGE_ANOTACAOES_ID'
];
// Verifica se todas as variáveis obrigatórias estão definidas
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

const { initAuth, getBroadcasterId } = require('./auth/oauth');
const { initTwitchBot } = require('./bot/twitch');
const { iniciarMonitoramento } = require('./utils/checkStream');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';


process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Rejeição de promessa não tratada:', reason);
});

(async () => {
    await initAuth();

    try {
        const broadcasterId = await getBroadcasterId();
        console.log(`✅ BROADCASTER_ID atualizado com sucesso.`);
        setEnvVariable('BROADCASTER_ID', broadcasterId);
    } catch (error) {
        console.error('❌ Erro ao obter BROADCASTER_ID:', error);
        return;
    }

    try {
        const userId = await getUserIdFromUsername(process.env.BOT_NAME);
        console.log(`✅ BOT_ID atualizado com sucesso.`);
        setEnvVariable('BOT_ID', userId);
    } catch (error) {
        console.error('❌ Erro ao obter BOT_ID:', error);
        return;
    }

    if (isDev) {
        console.log('🚧 Modo desenvolvimento: iniciando bot sem checagem.');
        initTwitchBot();
    } else {
        iniciarMonitoramento(30);
    }
})();

// Função para atualizar ou adicionar uma variável no arquivo .env
function setEnvVariable(key, value) {
    const envFilePath = './.env';

    // Lê o conteúdo do arquivo .env
    let envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf8') : '';

    // Verifica se a variável já existe no arquivo .env
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
        // Se a variável existe, substitui o valor
        envContent = envContent.replace(regex, `${key}=${value}`);
        console.log(`A variável ${key} foi atualizada`);
    } else {
        // Se a variável não existe, adiciona ela no final do arquivo
        envContent += `\n${key}=${value}`;
        console.log(`A variável ${key} foi adicionada`);
    }

    // Sobrescreve o arquivo .env com o novo conteúdo
    fs.writeFileSync(envFilePath, envContent, 'utf8');
}