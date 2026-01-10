// utils/delayResponse.js
// Função para adicionar delay antes de enviar mensagens ou realizar ações
// Configuração padrão de delay (pode vir do .env)
const DEFAULT_DELAY = process.env.MESSAGE_DELAY || 2000;

class MessageQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    /**
     * Adiciona uma mensagem à fila e inicia o processamento se estiver parado.
     */
    enqueue(client, channel, message, delay) {
        this.queue.push({ client, channel, message, delay });
        this.processNext();
    }

    /**
     * Processa a próxima mensagem da fila
     */
    async processNext() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        
        const { client, channel, message, delay } = this.queue.shift();
        const finalDelay = delay ?? DEFAULT_DELAY;

        try {
            // Aguarda o tempo estipulado ANTES de enviar
            await new Promise(resolve => setTimeout(resolve, finalDelay));
            
            if (client && client.readyState() === 'OPEN') {
                client.say(channel, message);
            }
        } catch (error) {
            console.error('Erro ao processar fila de mensagem:', error);
        } finally {
            this.isProcessing = false;
            // Chama recursivamente para a próxima mensagem
            this.processNext();
        }
    }
}

// Instância única para ser compartilhada por todo o bot
const queueInstance = new MessageQueue();

/**
 * Função exportada para manter compatibilidade com seu código atual
 */
function delayResponse(client, channel, message, delay) {
    queueInstance.enqueue(client, channel, message, delay);
}

module.exports = {
    delayResponse,
};