// handles.js
const axios = require('axios');
const { getAccessToken } = require('../auth/tokenStore'); // Importa getAccessToken
const { delayResponse } = require('../utils/delayResponse');
const { sanitizeUsername } = require('../utils/sanitize');
const { CLIENT_ID, BROADCASTER_ID, BOT_ID } = process.env;

const DELAY = 3000; // 3 segundos

// Função utilitária para verificar permissões
function hasPermission(tags, channelName) {
    return tags.mod || tags.username.toLowerCase() === channelName.toLowerCase();
}

async function shoutout(client, channel, targetUsername) {
    const user = targetUsername.replace(/^@/, '').toLowerCase();
    const accessToken = getAccessToken().replace('oauth:', '').trim();

    const clientId = CLIENT_ID;
    const broadcasterId = BROADCASTER_ID;
    const moderatorId = BOT_ID;

    try {
        // Buscar ID do usuário alvo
        const userRes = await axios.get(`https://api.twitch.tv/helix/users?login=${user}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Client-ID': clientId,
            },
        });

        if (!userRes.data.data.length) {
            delayResponse(client, channel, `❌ Usuário "${user}" não encontrado.`, DELAY);
            return;
        }

        const targetUserId = userRes.data.data[0].id;

        // Enviar shoutout via API da Twitch (body)
        await axios.post(
            'https://api.twitch.tv/helix/chat/shoutouts',
            {
                from_broadcaster_id: broadcasterId,
                to_broadcaster_id: targetUserId,
                moderator_id: moderatorId,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Client-ID': clientId,
                },
            }
        );

        delayResponse(client, channel, `📣 Passem lá no canal do(a) ${user}! Sigam em: https://twitch.tv/${user} 💜`, DELAY);
        console.log(`✅ Shoutout enviado para ${user}`);

    } catch (err) {
        const reason = err.response?.data?.message || err.message;

        if (reason.includes('Missing scope: moderator:manage:shoutouts')) {
            // delayResponse(client, channel, `❌ O bot não tem permissão para shoutouts (falta scope).`, DELAY);
            console.warn(`⚠️ Escopo ausente para shoutout (API): ${reason}`);
            return;
        }
        // delayResponse(client, channel, `❌ Erro ao enviar shoutout: ${reason}`, DELAY);
        console.error(`❌ Erro ao enviar shoutout para ${user}: ${reason}`);
    }
}

function handleShoutoutCommand(client, channel, tags, args, channelName) {
    if (!args[1]) {
        delayResponse(client, channel, `@${tags.username}, use: !shoutout <canal>`, DELAY);
        return;
    }

    const target = sanitizeUsername(args[1]);

    if (hasPermission(tags, channelName)) {
        shoutout(client, channel, target);
    } else {
        delayResponse(client, channel, '❌ Sem permissão para shoutout.', DELAY);
    }
}

module.exports = {
    handleShoutoutCommand,
    shoutout,
};