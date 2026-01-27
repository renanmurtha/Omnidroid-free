// twitch.js
require('dotenv').config();
const tmi = require('tmi.js');
const ignoredBots = require('../utils/ignoredBots');
const { initAllDatabases } = require('./data/sql/databaseManager');

const { executarOraculum } = require('../games/oraculum');
const { solicitarBiscoito } = require('../games/biscoitoSorte');
const { sendWelcome } = require('../utils/sendWelcome');
const { getLatLng } = require('../utils/maps');
const { sanitizeCity } = require('../utils/sanitize');
const { handleBirthdayOnJoin, handleUserBirthdayCommand } = require('./handleBirthday');
const { delayResponse } = require('../utils/delayResponse');
const { salvarAnotacaoCompleta } = require('../utils/notion');
const { getLiveUptime } = require('../utils/twitchLiveTime');
const { normalizeAndValidateUrl } = require('../utils/validUrl');

// Importa TODAS as funções e auxiliares necessárias dos handles
const {
    shoutout,
} = require('./handles');

const {
    handleCheckStreamer,
    handleAddStreamer,
    handleRemoveStreamer,
    resetGreetedToday
} = require('./handleRaid');

const { getAccessToken } = require('../auth/tokenStore');
const ForcaGame = require('../games/forcaGame');
const { pegarPalavraAleatoria } = require('../games/getPalavra');
const { cooldownMarcar, cooldownAnotar, cooldownReact } = require('../utils/cooldown');

/* TERMO */
// Variável global para armazenar o jogo atual
let jogoAtivo = null;
let palavra = pegarPalavraAleatoria();
palavra = palavra.toUpperCase();

const { BOT_NAME, CHANNEL_NAME, TEMRMO_TAMANHO_DA_PALAVRA
    , TEMRMO_MAX_ERROS, NOTION_KEY, NOTION_PAGE_REACT_ID, NOTION_PAGE_MARCADOS_ID
    , NOTION_PAGE_ANOTACAOES_ID
} = process.env;

const botName = BOT_NAME.toLowerCase();
const channelName = CHANNEL_NAME.toLowerCase();

const DELAY = 1000;

// Inicializa o Bot da Twitch
let client;
function initTwitchBot() {

    // Conecta ao banco de dados e inicializa
    initAllDatabases();

    //fullAccessToken atualiza o token de acesso
    const fullAccessToken = getAccessToken();

    const clientOptions = {
        identity: {
            username: botName,
            password: fullAccessToken
        },
        channels: [channelName]
    };

    client = new tmi.Client(clientOptions);

    client.connect()
        .catch(err => console.error('Erro ao conectar bot:', err));

    client.on('connected', async () => {
        console.log(`🤖 ${botName} conectado à Twitch.`);
        delayResponse(client, channelName, `🤖 Online!`, 500);;
    });

    client.on('subscription', (channel, username) => {
        delayResponse(client, channel, `🎉 Obrigado pelo sub, ${username}!`, DELAY);
    });

    client.on('resub', (channel, username, months) => {
        const textoMeses = months === 1 ? `1 mês` : `${months} meses`;
        delayResponse(client, channel, `🎉 ${username} renovou a sub, obrigado por apoiar por ${textoMeses}!`, DELAY);
    });

    client.on('subgift', (channel, username, _, recipient) => {
        delayResponse(client, channel, `🎁 ${username} deu um presente de sub para ${recipient}! Obrigado!`, DELAY);
    });

    client.on('raided', (channel, username, viewers) => {
        if (!ignoredBots.has(username)) {
            handleCheckStreamer(client, channel, username, 'raided');
        } else {
            console.log(`[LOG Raid] Bot ignorado entrou: ${username}`);
        }
    });

    client.on('follow', (channel, username) => {
        delayResponse(client, channel, `🎉 Obrigado pelo follow, ${username}!`, DELAY);
    });

    // Evento de entrada no chat
    const usuariosAtivos = new Set();
    usuariosAtivos.add(channelName.toLowerCase());

    client.on('join', (channel, username, self) => {
        if (!self && !ignoredBots.has(username.toLowerCase())) {
            // Adiciona o usuário à lista de ativos
            sendWelcome(client, channel, username, usuariosAtivos);
            // Verifica aniversário
            handleBirthdayOnJoin(client, channel, username);
            // Checa se é streamer cadastrado
            handleCheckStreamer(client, channel, username, 'join');
        } else {
            console.log(`[LOG Join] Bot ignorado entrou: ${username}`);
        }
    });

    // Evento de saída do chat
    client.on('part', (channel, username, self) => {
        if (self) return;
        usuariosAtivos.delete(username.toLowerCase());
        console.log(`${username} saiu do canal ${channel}`);
    });

    // Comandos do Bot
    client.on('message', async (channel, tags, message, self) => {
        if (self) return;

        const args = message.trim().split(' ');
        const command = args[0]?.toLowerCase(); // ? evita erro se args[0] for undefined
        // Ignora mensagens que não são comandos
        if (!command || (command[0] !== '!' && command[0] !== '$')) return;
        
        const isBroadcaster = tags.badges?.broadcaster === '1';
        const isMod = tags.badges?.moderator === '1';

        switch (command) {
            case '!previsao':
                await executarOraculum(client, channel, tags.username.toLowerCase(), usuariosAtivos);
                break;
            case '!sorte':
                solicitarBiscoito(client, channel, tags.username);
                break;
            case '!aniversario':
            case '!birthday':
                let update = false;
                const birthday = args[1] ? args[1] : '';
                let username = tags.username.toLowerCase();
                const nameUpdate = args[2] ? args[2].toLowerCase() : '';

                // Somente o dono do canal pode atualizar
                if (username === channelName) {
                    if (nameUpdate) {
                        update = true;
                        username = nameUpdate;
                    }
                }
                await handleUserBirthdayCommand(client, channel, username, birthday, update);
                break;
            case '!termo':
                const termoCommand = args[1] ? args[1].toLowerCase() : '';
                const termoUsername = tags.username.toLowerCase();
                switch (termoCommand) {
                    case 'iniciar':
                        if (isBroadcaster || isMod) {
                            jogoAtivo = ForcaGame.iniciarJogo(pegarPalavraAleatoria);
                            delayResponse(client, channel, `🟢 Jogo iniciado! Boa sorte a todos!`, 500);
                            delayResponse(client, channel, `📖 Dicas: Palavra com ${TEMRMO_TAMANHO_DA_PALAVRA} letras. 📖`, 500);
                            delayResponse(client, channel, `📜 Regras: 👤 Chutou a palavra ❌ errou, 💀 eliminado; ✅ acertou 🏆 ganhou! ${TEMRMO_MAX_ERROS} erros no chute da letra, 💥 ELIMINADO!`, 500);
                        } else {
                            delayResponse(client, channel, `@${termoUsername}, apenas o dono do canal pode iniciar o jogo.`, 500);
                        }
                        break;

                    case 'parar':
                        if (isBroadcaster || isMod) {
                            if (jogoAtivo) {
                                jogoAtivo = ForcaGame.pararJogo(jogoAtivo);
                                delayResponse(client, channel, `🔴 Jogo encerrado pelo dono do canal.`, 500);
                            } else {
                                delayResponse(client, channel, `⚠️ Nenhum jogo está ativo no momento.`, 500);
                            }
                        } else {
                            delayResponse(client, channel, `@${termoUsername}, apenas o dono do canal pode encerrar o jogo.`, 500);
                        }
                        break;
                    case 'letra':
                        if (!jogoAtivo) {
                            delayResponse(client, channel, `⚠️ Nenhum jogo ativo. Use !termo iniciar`, 500);
                            break;
                        }
                        const letra = args[2] ? args[2].toLowerCase() : '';

                        // Valida se a letra tem exatamente 1 caractere
                        if (letra.length !== 1) {
                            const res = `⚠️ ${termoUsername} Você precisa fornecer exatamente 1 letra.`;
                            delayResponse(client, channel, res, 500);
                            return
                        }
                        const respostaChute = jogoAtivo.tentarLetra(letra, termoUsername);
                        delayResponse(client, channel, respostaChute, 500);
                        break;

                    case 'chute':
                    case 'palavra':
                        if (!jogoAtivo) {
                            delayResponse(client, channel, `⚠️ Nenhum jogo ativo. Use !termo iniciar`, 500);
                            break;
                        }
                        const palpite = args.slice(2).join(' ').toUpperCase();
                        // Valida se a letra tem exatamente 1 caractere
                        if (palpite.length !== parseInt(TEMRMO_TAMANHO_DA_PALAVRA)) {
                            const res = `⚠️ ${termoUsername} Você precisa fornecer uma palavra com ${TEMRMO_TAMANHO_DA_PALAVRA} letras.`;
                            delayResponse(client, channel, res, 500);
                            return
                        }
                        const respostaPalavra = jogoAtivo.chutarPalavra(palpite, termoUsername);
                        delayResponse(client, channel, respostaPalavra, 500);
                        break;
                    default:
                        delayResponse(client, channel, `Uso: !termo <iniciar|parar|letra <letra>|palavra <palavra>>`, DELAY);
                        break;
                }
                break;
            case '!clima':
                let city = args.slice(1).join(' ').toLowerCase();
                const mapsUsername = tags.username.toLowerCase();
                let msg = '';
                if (!city) {
                    delayResponse(client, channel, `🌍 Uso: !clima <nome da cidade>`, DELAY);
                    return;
                }
                getLatLng(city).then((windyLink) => {
                    city = sanitizeCity(city);
                    if (windyLink) {
                        msg = `${mapsUsername}, veja o tempo agora em: ${city} — Windy: ${windyLink}`;
                        delayResponse(client, channel, msg, DELAY);
                    } else {
                        msg = `${mapsUsername}, Localização não encontrada para: ${city}`;
                        delayResponse(client, channel, msg, DELAY);
                    }
                });
                break;
            case "!anotar": {
                if (!NOTION_KEY || !NOTION_PAGE_ANOTACAOES_ID) {
                    console.warn("[Notion] - ⚠️ Variáveis de ambiente do Notion não configuradas.");
                    delayResponse(client, channel, `@${tags.username}, o sistema de anotações não está ativado.`, DELAY);
                    return false;
                }

                const anotacao = args.slice(1).join(' ');
                if (!anotacao) {
                    delayResponse(client, channel, `📝 Uso: !anotar <sua anotação aqui>`, DELAY);
                    return;
                }

                if (!cooldownAnotar()) {
                    delayResponse(client, channel, `@${tags.username}, Comando !anotar em cooldown, aguarde 1 min.`, DELAY);
                    return;
                }

                const res = await salvarAnotacaoCompleta("anotação", anotacao, tags.username);

                if (res === true) {
                    delayResponse(client, channel, `@${tags.username}, anotação salva!`, DELAY);
                } else {
                    // Esse comando não tem limite, então qualquer false aqui é erro
                    delayResponse(client, channel, `@${tags.username}, ocorreu um erro ao salvar sua anotação. Tente novamente.`, DELAY);
                }

                break;
            }
            case "!react": {
                if (!NOTION_KEY || !NOTION_PAGE_REACT_ID) {
                    console.warn("[Notion] - ⚠️ Variáveis de ambiente do Notion não configuradas.");
                    delayResponse(client, channel, `@${tags.username}, o sistema de anotações não está ativado.`, DELAY);
                    return false;
                }

                const anotacao = args.slice(1).join(' ');
                if (!anotacao) {
                    delayResponse(client, channel, `📝 @${tags.username}, Use !react <sua anotação aqui>`, DELAY);
                    return;
                }

                const url = normalizeAndValidateUrl(anotacao);
                if (!url) {
                    delayResponse(client, channel, `❌ @${tags.username}, não consegui reconhecer esse link. Informe um link válido (ex: https://site.com).`, DELAY);
                    return;
                }

                if (!cooldownReact()) {
                    delayResponse(client, channel, `@${tags.username}, Comando !react em cooldown, aguarde 1 min.`, DELAY);
                    return;
                }

                const res = await salvarAnotacaoCompleta("react", anotacao, tags.username);

                if (res === true) {
                    delayResponse(client, channel, `@${tags.username}, anotação React salva!`, DELAY);
                } else if (res === "bloqueado") {
                    delayResponse(client, channel, `@${tags.username}, você atingiu o limite de React diário. Aguarde 24h.`, DELAY);
                } else if (res === "intervalo") {
                    delayResponse(client, channel, `@${tags.username}, aguarde alguns segundos antes de enviar um novo react.`, DELAY);
                } else {
                    delayResponse(client, channel, `@${tags.username}, ocorreu um erro ao salvar seu React. Tente novamente mais tarde.`, DELAY);
                }
                break;
            }
            case '!marcar': {

                if (!NOTION_KEY || !NOTION_PAGE_MARCADOS_ID) {
                    console.warn("[Notion] - ⚠️ Variáveis de ambiente do Notion não configuradas.");
                    delayResponse(client, channel, `@${tags.username}, o sistema de marcações não está ativado.`, DELAY);
                    return false;
                }

                // 2️⃣ Monta a marcação
                const assunto = args.slice(1).join(' ');
                if (!assunto) {
                    delayResponse(
                        client, channel, `📝 Uso: !marcar <sua marcação aqui>`, DELAY);
                    return;
                }

                if (!cooldownMarcar()) {
                    delayResponse(client, channel, `@${tags.username}, Comando !marcar em cooldown, aguarde 1 min.`, DELAY);
                    return;
                }

                // Função async autoexecutável
                (async () => {
                    try {
                        const tempo = await getLiveUptime();
                        console.log('[!marcar]');

                        if (tempo === "offline") {
                            delayResponse(client, channel, `@${tags.username}, não é possível marcar o tempo pois a live está offline.`, DELAY);
                            return;
                        } else if (tempo === "error") {
                            delayResponse(client, channel, `@${tags.username}, Houve um erro ao solicitar o tempo de live, tente novamente mais em alguns minutos.`, DELAY);
                            return;
                        }
                        console.log('[!marcar - Tempo de live]: ', tempo);
                        // Salva a anotação com o tempo da live

                        const res = await salvarAnotacaoCompleta("marcação", `${assunto} - (Tempo de live: ${tempo})`, tags.username);

                        // Feedback conforme o resultado
                        if (res === true) {
                            delayResponse(client, channel, `@${tags.username}, marcação salva!`, DELAY);
                        } else {
                            // Qualquer false é erro neste comando, já que não há limite
                            delayResponse(client, channel, `@${tags.username}, ocorreu um erro ao salvar sua marcação. Tente novamente.`, DELAY);
                        }

                    } catch (err) {
                        console.error("[!marcar] Erro ao processar marcação:", err);
                        delayResponse(client, channel, `@${tags.username}, ocorreu um erro inesperado ao salvar sua marcação.`, DELAY);
                    }
                })();

                break;
            }
            case '!streamer':
                const streamerCommand = args[1] ? args[1].toLowerCase() : '';
                const targetUser = args[2] || tags.username;
                if (isBroadcaster || isMod) {
                    switch (streamerCommand) {
                        case 'add':
                            await handleAddStreamer(client, channel, targetUser);
                            break;
                        case 'del':
                            await handleRemoveStreamer(client, channel, targetUser);
                            break;
                        default:
                            delayResponse(client, channel, `Uso: !streamer <add|del> @usuario`, DELAY);
                            break;
                    }
                } else {
                    delayResponse(client, channel, `@${tags.username}, você não tem permissão para usar este comando.`, DELAY);
                }
                break;
            default:
                break;
        }
    });
}

function stopTwitchBot() {
    if (client) {
        client.disconnect()
            .then(() => {
                console.log('⛔ Bot desconectado porque a live está offline.');
                client = null;
                resetGreetedToday();
            })
            .catch(err => console.error('Erro ao desconectar bot:', err));
    }
}

module.exports = { initTwitchBot, stopTwitchBot };