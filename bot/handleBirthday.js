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
async function handleUserBirthdayCommand(client, channel, tags, inputData) {
    const username = tags.username.toLowerCase();
    try {
        const wasRegistered = await db._insertBirthday (username, inputData);
        if (wasRegistered) {
            enqueueBirthdayMessage(client, channel, `🎂 @${username}, seu aniversário foi registrado/atualizado com sucesso! 🗓️`);
            console.log(`[Birthday]: ${username} cadastrou/atualizou aniversário (${inputData}).`);
        } else {
            enqueueBirthdayMessage(client, channel, `⚠️ @${username}, não foi possível registrar seu aniversário. Verifique o formato.`);
        }
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
        const message = await db._checkBirthdayOnJoin (username);
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
