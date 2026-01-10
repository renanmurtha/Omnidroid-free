const { getAccessToken } = require('../auth/tokenStore');
const { CLIENT_ID, CHANNEL_NAME } = process.env;

const clientId = CLIENT_ID;
const channelName = CHANNEL_NAME;

async function getLiveUptime() {
    const url = `https://api.twitch.tv/helix/streams?user_login=${channelName}`;
    const accessToken = getAccessToken()?.replace('oauth:', '').trim();
    try {
        const response = await fetch(url, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // 1. Tratamento: Erro de Autenticação ou API fora do ar (Status 401, 404, 500)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro API (${response.status}): ${errorData.message}`);
        }

        const { data } = await response.json();

        // 2. Tratamento: Canal Offline (data vem vazio)
        if (!data || data.length === 0) {
             console.log(`[Tempo de Live]: offline`);
            return "offline";
        }

        // 3. Cálculo do tempo real (Sem Math)
        const startedAt = data[0].started_at;
        const diff = Date.now() - new Date(startedAt).getTime();
        const duracao = new Date(diff);

        const dias = duracao.getUTCDate() - 1;
        const horas = String(duracao.getUTCHours()).padStart(2, '0');
        const minutos = String(duracao.getUTCMinutes()).padStart(2, '0');
        const segundos = String(duracao.getUTCSeconds()).padStart(2, '0');

        // Retorno formatado conforme a duração real
        return dias > 0
            ? `${dias}d ${horas}:${minutos}:${segundos}`
            : `${horas}:${minutos}:${segundos}`;

    } catch (error) {
        // 4. Tratamento: Erros de rede, JSON inválido ou falha de conexão
        console.log(`[Tempo de Live ERROR]: ${error.message}`);
        return "error";
    }
}

module.exports = { getLiveUptime };
