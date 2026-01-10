const fetch = require('node-fetch');
const { getAccessToken } = require('../auth/tokenStore');
const { initTwitchBot, stopTwitchBot } = require('../bot/twitch');
const { CLIENT_ID, CHANNEL_NAME } = process.env;

let botIniciado = false;
let intervaloAtual;

const clientId = CLIENT_ID;
const userLogin = CHANNEL_NAME;

async function checkStream() {
    try {
        const accessToken = getAccessToken()?.replace('oauth:', '').trim();
        if (!accessToken) {
            console.error('Token de acesso não disponível');
            return false;
        }
        const url = `https://api.twitch.tv/helix/streams?user_login=${userLogin}`;
        const res = await fetch(url, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!res.ok) {
            console.error(`Erro na API Twitch: ${res.status} ${res.statusText}`);
            return false;
        }
        const data = await res.json();
        return data.data && data.data.length > 0;
    } catch (err) {
        console.error('Erro ao verificar stream:', err);
        return false;
    }
}

async function verificarStatusDaLive() {
    try {
        console.log('⌛ Verificando status da live...');
        const online = await checkStream();

        if (online && !botIniciado) {
            console.log('✅ Live online. Iniciando bot...');
            initTwitchBot();
            botIniciado = true;

        } else if (!online && botIniciado) {
            console.log('❌ Live offline. Parando bot...');
            stopTwitchBot();
            botIniciado = false;

        } else if (!online) {
            console.log('🕒 Live ainda offline. Aguardando próximo ciclo...');
        }
    } catch (error) {
        console.error('Erro ao verificar o status da live:', error);
    }
}

function iniciarMonitoramento(intervaloMinutos = 3) {
    const intervaloMs = intervaloMinutos * 60 * 1000;
    console.log(`🔁 Iniciando verificação a cada ${intervaloMinutos} minuto(s)...`);
    intervaloAtual = setInterval(verificarStatusDaLive, intervaloMs);
    verificarStatusDaLive();
}

module.exports = { iniciarMonitoramento };