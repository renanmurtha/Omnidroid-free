// bot/data/sql/databaseManager.js

const databases = [
    {
        name: 'Banco principal',
        instance: require('./database')
    },
    // // 👉 quando criar outro banco, só adicionar aqui
    // {
    //     name: 'Outro banco',
    //     instance: require('./OutroBanco')
    // }
];

async function initAllDatabases() {
    try {
        for (const db of databases) {
            await db.instance.connectDb();
            await db.instance.initDb();
            console.log(`[database log] ✅ ${db.name} inicializado com sucesso`);
        }
    } catch (error) {
        console.error(`[database log] ❌ Erro fatal ao iniciar o banco de dados: ${db.name}`, error.message);
        process.exit(1);
    }
}

module.exports = {
    initAllDatabases
};
