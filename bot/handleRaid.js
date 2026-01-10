// bot/handleRaid.js
const raidsDb = require('./data/sql/database');
const { delayResponse } = require('../utils/delayResponse');

const DELAY = 2000;
let raidQueue = [];
let processing = false;
let greetedToday = new Set();

function resetGreetedToday() {
    greetedToday.clear();
}

function enqueueRaidMessage(client, channel, message) {
    raidQueue.push({ client, channel, message });
    if (!processing) processQueue();
}

async function processQueue() {
    processing = true;
    while (raidQueue.length > 0) {
        const { client, channel, message } = raidQueue.shift();
        delayResponse(client, channel, message, DELAY);
        await new Promise(res => setTimeout(res, DELAY));
    }
    processing = false;
}

/**
 * Adiciona streamer manualmente
 */
async function handleAddStreamer(client, channel, username, source = 'manual') {
    const cleanUsername = (username || '').replace('@', '').toLowerCase();
    if (!cleanUsername) {
        enqueueRaidMessage(client, channel, '⚠️ Uso correto: !streamer add @usuario');
        return;
    }
    try {
        const added = await raidsDb.addRaid(cleanUsername, source);
        if (added) {
            enqueueRaidMessage(client, channel, `✅ @${cleanUsername} foi adicionado como Amigo do Canal!`);
            console.log(`[STREAMER]: ${cleanUsername} adicionado (${source}).`);
        } else {
            enqueueRaidMessage(client, channel, `ℹ️ @${cleanUsername} já está na lista de amigos.`);
        }
    } catch (error) {
        console.error(`[STREAMER Error]: Erro ao adicionar ${cleanUsername}:`, error.message);
        enqueueRaidMessage(client, channel, `🐞 Ocorreu um erro ao cadastrar @${cleanUsername}.`);
    }
}

/**
 * Remove streamer manualmente
 */
async function handleRemoveStreamer(client, channel, username) {
    const cleanUsername = (username || '').replace('@', '').toLowerCase();
    if (!cleanUsername) {
        enqueueRaidMessage(client, channel, '⚠️ Uso correto: !streamer del @usuario');
        return;
    }
    try {
        const removed = await raidsDb.removeRaid(cleanUsername);
        if (removed) {
            enqueueRaidMessage(client, channel, `❌ @${cleanUsername} removido da lista de amigos.`);
        } else {
            enqueueRaidMessage(client, channel, `ℹ️ @${cleanUsername} não estava na lista de amigos.`);
        }
    } catch (error) {
        console.error(`[STREAMER Error]: Erro ao remover ${cleanUsername}:`, error.message);
        enqueueRaidMessage(client, channel, `🐞 Ocorreu um erro ao remover @${cleanUsername}.`);
    }
}

/**
 * Checa se é streamer cadastrado e responde conforme contexto
 */
async function handleCheckStreamer(client, channel, username, source) {
    const cleanUsername = (username || '').replace('@', '');
    try {
        const isRaider = await raidsDb.isRaider(cleanUsername);

        if (source === 'raided') {
            if (!isRaider) {
                await raidsDb.addRaid(cleanUsername, source);
                enqueueRaidMessage(client, channel, `🚨 Obrigado pela primeira Raid @${cleanUsername}! Sejam bem-vindos!`);
                greetedToday.add(cleanUsername);
                console.log(`[RAID]: ${cleanUsername} cadastrado e saudado pela primeira raid.`);
            } else {
                enqueueRaidMessage(client, channel, `🚨 Obrigado pela Raid @${cleanUsername}! Sejam bem-vindos!`);
                console.log(`[RAID]: ${cleanUsername} já era amigo, raid recebida.`);
            }
        } else if (source === 'join') {
            if (isRaider && !greetedToday.has(cleanUsername)) {
                greetedToday.add(cleanUsername);
                enqueueRaidMessage(client, channel, `👋 Sigam @${cleanUsername},   `);
                console.log(`[JOIN]: ${cleanUsername} saudado como amigo.`);
            }
        }
    } catch (error) {
        console.error(`[STREAMER Error]: Erro ao checar/cadastrar ${cleanUsername}:`, error.message);
    }
}

module.exports = {
    handleAddStreamer,
    handleRemoveStreamer,
    handleCheckStreamer,
    resetGreetedToday
};
