const Pool = require('pg').Pool; // importa o driver do postgres para gerenciar conexoes

// Cria o pool de conexao usando variaveis de ambiente
const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'erp_saude',
        password: process.env.DB_PASS || 'postgres',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    });

module.exports = {
    // exporta a funcao de consulta para executar sql usando o pool
    query: (text, params) => pool.query(text, params),
    pool: pool,
};
