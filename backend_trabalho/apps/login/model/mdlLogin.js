const db = require("../../../database/databaseconfig"); // importa o modulo de conexao com o banco de dados

const GetCredencial = async (loginPar) => { // busca os dados de autenticacao pelo username
    return (
        await db.query(
            "SELECT id, username, password " +
            "FROM usuarios WHERE username = $1 AND removido = false",
            [loginPar]
        )
    ).rows;
};

module.exports = {
    GetCredencial,
};
