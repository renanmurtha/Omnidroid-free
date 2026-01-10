
const { delayResponse } = require('../utils/delayResponse');

const welcomeMessages = [
    "seja bem-vindo(a)! Puxe uma cadeira 🪑, pegue um café ☕ e vamos conversar!",
    "prepara-se para boas risadas 😄",
    "aproveite e fique à vontade 👋",
    "hoje a diversão está garantida 🎉",
    "entre e sinta-se em casa 🏠",
    "hora de conhecer a galera 😎",
    "esperamos que aproveite o chat 💬",
    "fique confortável 🛋️ e participe!",
    "que comece a diversão 🎊",
    "prepara-se para uma ótima experiência 🌟",
    "hora de puxar papo e rir 😂",
    "aproveite e participe da conversa 💡",
    "hoje vai ser épico 🚀",
    "pegue um café ☕ e junte-se à festa 🎉",
    "estamos felizes em te ver 😃",
    "vamos interagir 👋",
    "hora de se divertir e conhecer a galera 🥳",
    "fique à vontade e participe do chat 🏡",
    "que seu tempo aqui seja incrível 🌈",
    "estamos animados que você entrou 🎊"
];

const welcomeQueue = [];
let processingQueue = false;

function sendWelcome(client, channel, username, usuariosAtivos) {
    const user = username.toLowerCase();
    const dalayQueue = 500; // delay local dentro da função

    if (user === channel.toLowerCase() || user === client.username.toLowerCase()) return;

    if (!usuariosAtivos.has(user)) {
        usuariosAtivos.add(user);
        welcomeQueue.push({ channel, username });

        if (!processingQueue) processQueue(client, dalayQueue);
    }
}

async function processQueue(client, dalayQueue) {
    processingQueue = true;

    while (welcomeQueue.length > 0) {
        const { channel, username } = welcomeQueue.shift();
        const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        delayResponse(client, channel, `@${username}, ${message}`, dalayQueue);

        await new Promise(r => setTimeout(r, dalayQueue));
    }

    processingQueue = false;
}

module.exports = { sendWelcome };
