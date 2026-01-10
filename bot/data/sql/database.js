// bot/data/sql/database.js
const sqlite3 = require('sqlite3').verbose();
const { fail } = require('assert');
const path = require('path');

const { DATABASE_NAME, CHANNEL_NAME } = process.env;

const sanitizeAndFallback = (name) => {
    const cleaned = (name || '').trim().replace(/[\\/?%*:|"<>^]/g, '');
    return cleaned.length > 0 ? cleaned.toLocaleLowerCase() : 'omnidroids';
};
const preferredName = ((DATABASE_NAME ?? '').trim() || (CHANNEL_NAME ?? '').trim());
const databaseName = sanitizeAndFallback(preferredName);
let DB_PATH = `bot/data/database/${databaseName}.db`;

// Variável para armazenar a instância do banco de dados conectada
let dbInstance;

module.exports = {
    /**
     * Conecta-se ao banco de dados SQLite.
     * @returns {Promise<void>}
     */
    connectDb: async () => {
        return new Promise((resolve, reject) => {
            dbInstance = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error(`[database log] Erro ao conectar ao banco de dados: ${databaseName}.db`, err.message);
                    reject(err);
                } else {
                    console.log(`[database log] Conectado ao banco principal: ${databaseName}.db`);
                    resolve();
                }
            });
        });
    },

    /**
     * Inicializa o esquema do banco de dados (cria tabelas se não existirem).
     * @returns {Promise<void>}
     */
    initDb: async () => {
        return new Promise((resolve, reject) => {
            if (!dbInstance) {
                reject(new Error('[database log]  Banco de dados não conectado. Chame connectDb primeiro.'));
                return;
            }

            dbInstance.serialize(() => {
                let completedStatements = 0;
                const totalStatements = 2; // Total de tabelas a serem criadas

                const checkCompletion = () => {
                    completedStatements++;
                    if (completedStatements === totalStatements) {
                        console.log('[database log] Todas as tabelas foram verificadas/criadas.');
                        resolve();
                    }
                };

                const handleError = (err, tableName) => {
                    console.error(`[database log] Erro ao criar tabela ${tableName}:`, err.message);
                    checkCompletion();
                };


                // Tabela para armazenar aniversários
                dbInstance.run(`
                    CREATE TABLE IF NOT EXISTS user_birthdays (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL UNIQUE, -- Cada usuário só pode ter um aniversário
                        birthday TEXT NOT NULL,        -- Formato 'MM-DD' (ano descartado)
                        last_congratulation_year INTEGER -- Último ano em que foi parabenizado
                    );
                `, (err) => {
                    if (err) handleError(err, 'user_birthdays');
                    else checkCompletion();
                });
                // Tabela para armazenar streamer
                dbInstance.run(`
                    CREATE TABLE IF NOT EXISTS channel_raids (
                        username TEXT PRIMARY KEY,
                        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        source TEXT
                    );
                `, (err) => {
                    if (err) handleError(err, 'channel_raids');
                    else checkCompletion();
                });

            });
        });
    },


    /**
    * Tenta registrar ou atualizar o aniversário de um usuário.
    * Esta é uma função interna do módulo.
    * @param {string} username Nome de usuário.
    * @param {string} inputData Data enviada (dd/mm, mm-dd, etc).
    * @returns {Promise<boolean>} True se inseriu/atualizou, false se já existia igual.
    */
    _insertBirthday: async (username, inputData) => {
        return new Promise((resolve, reject) => {
            if (!dbInstance) { reject(new Error('[database log] Banco de dados não conectado.')); return; }

            // Normaliza para 'MM-DD'
            const parts = inputData.replace(/[^0-9]/g, ' ').trim().split(/\s+/);
            if (parts.length !== 2) {
                resolve(false); // formato inválido → não grava
                return;
            }

            let [m, d] = parts.map(p => parseInt(p, 10));

            // Se o primeiro número for dia (maior que 12), inverte
            if (m > 12) [d, m] = [m, d];

            // Valida mês e dia
            if (m < 1 || m > 12 || d < 1 || d > 31) {
                resolve(false); // data inválida → não grava
                return;
            }

            const birthday = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            dbInstance.run(`
            INSERT INTO user_birthdays (username, birthday)
            VALUES (?, ?)
            ON CONFLICT(username) DO UPDATE SET birthday=excluded.birthday;
        `, [username, birthday], function (err) {
                if (err) {
                    console.error('[database log] Erro ao registrar aniversário:', err.message);
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    },

    /**
     * Verifica se hoje é aniversário do usuário e parabeniza uma vez por ano.
     * Esta é uma função interna do módulo.
     * @param {string} username Nome de usuário.
     * @returns {Promise<string|null>} Mensagem de parabéns ou null.
     */
    _checkBirthdayOnJoin: async (username) => {
        return new Promise((resolve, reject) => {
            if (!dbInstance) { reject(new Error('[database log] Banco de dados não conectado.')); return; }

            const now = new Date();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const todayStr = `${mm}-${dd}`;
            const currentYear = now.getFullYear();

            dbInstance.get(
                'SELECT birthday, last_congratulation_year FROM user_birthdays WHERE username = ?',
                [username],
                (err, row) => {
                    if (err) {
                        console.error('[database log] Erro ao consultar aniversário:', err.message);
                        reject(err);
                    } else if (row && row.birthday === todayStr) {
                        if (row.last_congratulation_year !== currentYear) {
                            dbInstance.run(
                                'UPDATE user_birthdays SET last_congratulation_year = ? WHERE username = ?',
                                [currentYear, username],
                                function (updErr) {
                                    if (updErr) {
                                        console.error('[database log] Erro ao atualizar ano de parabenização:', updErr.message);
                                        reject(updErr);
                                    } else {
                                        resolve(`🎉 Feliz aniversário, ${username}! 🎂`);
                                    }
                                }
                            );
                        } else {
                            resolve(null); // já foi parabenizado este ano
                        }
                    } else {
                        resolve(null); // não é aniversário
                    }
                }
            );
        });
    },

    /**
    * Registra uma raid recebida.
    * @param {string} username Nome do canal que fez a raid.
    * @param {string} [source='manual'] Origem da raid.
    * @returns {Promise<boolean>} True se inserido, false se já existia.
    */
    addRaid: async (username, source = 'manual') => {
        return new Promise((resolve, reject) => {
            if (!dbInstance) {
                reject(new Error('Banco de raids não conectado.'));
                return;
            }
            const cleanUsername = username.toLowerCase().replace('@', '');
            dbInstance.run(
                `INSERT OR IGNORE INTO channel_raids (username, source) VALUES (?, ?)`,
                [cleanUsername, source],
                function (err) {
                    if (err) {
                        console.error('[database log] Erro ao registrar raid:', err.message);
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    },

    /**
     * Verifica se um canal já fez raid.
     * @param {string} username Nome do canal.
     * @returns {Promise<boolean>} True se já fez raid, false caso contrário.
     */
    isRaider: async (username) => {
        return new Promise((resolve, reject) => {
            if (!dbInstance) {
                reject(new Error('[database log] Banco de raids não conectado.'));
                return;
            }
            const cleanUsername = username.toLowerCase();
            dbInstance.get(
                `SELECT username FROM channel_raids WHERE username = ?`,
                [cleanUsername],
                (err, row) => {
                    if (err) {
                        console.error('[database log] Erro ao consultar raid:', err.message);
                        reject(err);
                    } else {
                        resolve(!!row);
                    }
                }
            );
        });
    },

    /**
     * Remove o registro de uma raid.
     * @param {string} username Nome do canal.
     * @returns {Promise<boolean>} True se removido, false se não existia.
     */
    removeRaid: async (username) => {
        return new Promise((resolve, reject) => {
            if (!dbInstance) {
                reject(new Error('[database log] Banco de raids não conectado.'));
                return;
            }
            const cleanUsername = username.toLowerCase().replace('@', '');
            dbInstance.run(
                `DELETE FROM channel_raids WHERE username = ?`,
                [cleanUsername],
                function (err) {
                    if (err) {
                        console.error('[database log] Erro ao remover raid:', err.message);
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }
};