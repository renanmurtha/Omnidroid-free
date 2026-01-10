// moderation.js
const axios = require('axios');
const { getAccessToken } = require('../auth/tokenStore'); // Importa getAccessToken
const { CLIENT_ID, BROADCASTER_ID } = process.env;

// Função para pegar o id do usuário a partir do nome de usuário
async function getUserIdFromUsername(username) {
    try {
        const oauthToken = getAccessToken();
        const clientId = CLIENT_ID?.trim();

        const response = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                'Authorization': `Bearer ${oauthToken?.replace('oauth:', '')?.trim()}`,
                'Client-Id': clientId
            },
            params: { login: username }
        });

        const userId = response.data.data[0]?.id;

        if (!userId) {
            console.log('❌ Usuário não encontrado!');
            return null;
        }

        return userId;
    } catch (error) {
        console.error('Erro ao obter userId:', error.response?.data || error.message || error);
        return null;
    }
}

// Função para verificar se o usuário segue o canal
async function checkIfUserFollows(username) {
    try {
        const broadcasterId = BROADCASTER_ID?.trim();
        const oauthToken = getAccessToken()?.replace('oauth:', '')?.trim();
        const clientId = CLIENT_ID?.trim();;

        const userId = await getUserIdFromUsername(username);

        if (!userId) {
            return false;
        }

        const response = await axios.get('https://api.twitch.tv/helix/channels/followers', {
            headers: {
                'Authorization': `Bearer ${oauthToken}`,
                'Client-Id': clientId
            },
            params: {
                user_id: userId,
                broadcaster_id: broadcasterId
            }
        });

        if (response.data.data && response.data.data.length > 0) {
            console.log(`${username} é um seguidor!`);
            return true;
        } else {
            console.log(`${username} não é um seguidor.`);
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar o seguidor:', error.response?.data || error.message || error);
        return false;
    }
}
module.exports = {
    checkIfUserFollows,
    getUserIdFromUsername    
};