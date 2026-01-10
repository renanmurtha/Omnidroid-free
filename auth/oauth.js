// auth/oauth.js
const axios = require('axios');
const express = require('express');
const open = require('open').default;
const { saveTokens, updateEnvToken } = require('./tokens');
const { setAccessToken, getAccessToken } = require('./tokenStore');
const { formatDateTime, formatDuration } = require('../utils/time');

let { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, CHANNEL_NAME } = process.env;
REDIRECT_URI = REDIRECT_URI || 'http://localhost:8080/';

const AUTH_SCOPE = 'moderator:manage:shoutouts chat:read chat:edit channel:moderate moderator:manage:banned_users channel:manage:broadcast moderator:manage:announcements user:read:follows moderator:read:followers user:manage:whispers user:read:whispers';

let refreshTimeout = null;

function scheduleTokenRefresh(expiresIn) {
    if (refreshTimeout) clearTimeout(refreshTimeout);

    // Calcula o tempo restante até a expiração do token
    const refreshInMs = (expiresIn - 600) * 1000; // 10 minutos antes da expiração

    const now = new Date();
    const formattedDateTime = formatDateTime(now);

    // Exibe a data e hora formatadas e o tempo restante até a expiração do token
    console.log(`⏳  [ ${formattedDateTime} ]: Token válido por ${formatDuration(expiresIn)}. Próxima renovação agendada em ${formatDuration(refreshInMs / 1000)}.`);

    // console.log(`DEBUG: expiresIn = ${expiresIn} segundos`);

    // Agenda a renovação do token
    refreshTimeout = setTimeout(() => {
        refreshAccessToken().catch(err => {
            console.error('❌ Erro ao tentar renovar token automaticamente:', err);
        });
    }, refreshInMs);
}


async function getTokensFromAuth() {
    const app = express();

    return new Promise((resolve, reject) => {
        const server = app.listen(8080, () => {
            const authURL = `https://id.twitch.tv/oauth2/authorize` +
                `?response_type=code&client_id=${CLIENT_ID}` +
                `&redirect_uri=${REDIRECT_URI}` +
                `&scope=${AUTH_SCOPE.replace(/ /g, '+')}`;

            console.log('🔑 Aguardando autorização no navegador...');
            open(authURL).catch(err => {
                console.error('❌ Falha ao abrir o navegador:', err);
                server.close();
                reject(err);
            });
        });

        server.on('error', (err) => {
            console.error('❌ Erro no servidor Express:', err);
            server.close();
            reject(err);
        });

        app.get('/', async (req, res) => {
            try {
                const code = req.query.code;
                if (!code) throw new Error('Código ausente na URL');

                const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
                    params: {
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        code,
                        grant_type: 'authorization_code',
                        redirect_uri: REDIRECT_URI,
                    },
                });

                const { access_token, refresh_token, expires_in } = response.data;

                saveTokens(access_token, refresh_token);
                updateEnvToken(access_token, refresh_token);
                setAccessToken(access_token);
                scheduleTokenRefresh(expires_in);

                res.send('✅ Autorizado com sucesso. Pode fechar essa aba.');
                resolve({ access_token, refresh_token });
            } catch (err) {
                console.error('❌ Erro ao trocar código por token:', err.response?.data || err);
                res.status(400).send('❌ Erro ao autenticar com o Twitch.');
                reject(err);
            } finally {
                server.close();
            }
        });

        app.use((err, req, res, next) => {
            console.error('❌ Erro inesperado:', err);
            res.status(500).send('❌ Erro interno no servidor de autenticação.');
            server.close();
            reject(err);
        });
    });
}

async function refreshAccessToken() {
    const refreshToken = REFRESH_TOKEN;

    if (!refreshToken) {
        console.warn('🔄 Nenhum refresh token encontrado. Solicitando autorização...');
        return await getTokensFromAuth();
    }

    try {
        const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            },
        });

        const { access_token: newAccess, refresh_token: newRefresh = refreshToken, expires_in } = res.data;

        updateEnvToken(newAccess, newRefresh);
        setAccessToken(newAccess);
        scheduleTokenRefresh(expires_in);

        console.log('✅ Token renovado com sucesso.');
    } catch (err) {
        console.error('❌ Erro ao renovar token:', err.response?.data || err);
        return await getTokensFromAuth();
    }
}

async function getBroadcasterId() {
    try {
        const username = CHANNEL_NAME.toLowerCase();
        const accessToken = getAccessToken();

        if (!accessToken) throw new Error('Access token não disponível para getBroadcasterId');

        const url = `https://api.twitch.tv/helix/users?login=${username}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Client-ID': CLIENT_ID,
        };

        const response = await axios.get(url, { headers });
        const data = response.data;

        if (!data.data.length) {
            console.warn(`🚨 Usuário '${username}' não encontrado.`);
            return null;
        }

        return data.data[0].id;
    } catch (error) {
        console.error('❌ Erro ao buscar Broadcaster ID:', error.response?.data || error);
        return null;
    }
}

async function initAuth() {
    try {
        await refreshAccessToken();
    } catch (error) {
        console.error('❌ Erro na inicialização da autenticação:', error);
    }
}

module.exports = {
    initAuth,
    getBroadcasterId,
    getTokensFromAuth,
};
