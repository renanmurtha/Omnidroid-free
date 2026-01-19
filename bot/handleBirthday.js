// handleBirthday.js
const db = require('./data/sql/database');
const { delayResponse } = require('../utils/delayResponse');

const DELAY = 2000; // 2 segundos entre mensagens
let birthdayQueue = [];
let processing = false;

/**
 * Enfileira mensagens de parabéns para evitar flood.
 */
function enqueueBirthdayMessage(client, channel, message) {
    birthdayQueue.push({ client, channel, message });
    if (!processing) processQueue();
}

async function processQueue() {
    processing = true;
    while (birthdayQueue.length > 0) {
        const { client, channel, message } = birthdayQueue.shift();
        delayResponse(client, channel, message, DELAY);
        await new Promise(res => setTimeout(res, DELAY));
    }
    processing = false;
}

/**
 * Cadastra/atualiza aniversário do usuário.
 */
async function handleUserBirthdayCommand(client, channel, username, inputData, update = false) {
    try {
        let logMessage = '';
        const result = await db._insertBirthday(username, inputData, update);
        switch (result) {
            case 'insert':
                enqueueBirthdayMessage(client, channel, `🎂 @${username}, seu aniversário foi registrado com sucesso! 🗓️`);
                logMessage = `[Birthday]: Aniversário de ${username} registrado como ${inputData}.`;
                break;
            case 'update':
                enqueueBirthdayMessage(client, channel, `✏️ @${username}, seu aniversário foi atualizado com sucesso! 🗓️`);
                logMessage = `[Birthday]: Aniversário de ${username} atualizado para ${inputData}.`;
                break;
            case 'exists':
                enqueueBirthdayMessage(client, channel, `ℹ️ @${username}, seu aniversário já está cadastrado.`);
                logMessage = `[Birthday]: Aniversário de ${username} já estava cadastrado.`;
                break;
            case 'invalid':
                enqueueBirthdayMessage(client, channel, `⚠️ @${username}, data inválida. Use o formato DD-MM ou MM-DD.`);
                logMessage = `[Birthday]: Formato inválido fornecido por ${username}: ${inputData}.`;
                break
            default:
                enqueueBirthdayMessage(client, channel, `⚠️ @${username}, formato inválido. Use DD-MM ou MM-DD.`);
                logMessage = `[Birthday]: Formato inválido fornecido por ${username}: ${inputData}.`;
                break;
        }

        if (logMessage) console.log(logMessage);

    } catch (error) {
        console.error(`[Birthday Error]: Erro ao processar aniversário para ${username}:`, error.message);
        enqueueBirthdayMessage(client, channel, `🐞 @${username}, ocorreu um erro ao registrar seu aniversário. Tente novamente mais tarde.`);
    }
}

/**
 * Checa se hoje é aniversário do usuário quando ele entra no chat.
 * Parabeniza apenas uma vez por ano.
 */
async function handleBirthdayOnJoin(client, channel, username) {
    try {
        const message = await db._checkBirthdayOnJoin(username);
        if (message) {
            enqueueBirthdayMessage(client, channel, message);
            console.log(`[Birthday]: ${username} foi parabenizado hoje.`);
        }
    } catch (error) {
        console.error(`[Birthday Error]: Erro ao verificar aniversário para ${username}:`, error.message);
    }
}

module.exports = {
    handleUserBirthdayCommand,
    handleBirthdayOnJoin,
};
