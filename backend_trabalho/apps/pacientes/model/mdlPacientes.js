const db = require("../../../database/databaseconfig"); // importa a conexao com o banco de dados

const GetAllPacientes = async () => { // busca todos os pacientes ativos (removido = false)
    return (
        await db.query(
            "SELECT * FROM pacientes WHERE removido = false ORDER BY nome ASC"
        )
    ).rows;
};

const GetPacienteByID = async (pacienteIDPar) => { // busca um paciente especifico pelo id (removido = false)
    return (
        await db.query(
            "SELECT * FROM pacientes WHERE id = $1 AND removido = false",
            [pacienteIDPar]
        )
    ).rows;
};

const InsertPaciente = async (pacienteREGPar) => { // insere um novo paciente no banco
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "INSERT INTO pacientes (nome, cpf, telefone, data_nascimento, removido) " +
                "VALUES ($1, $2, $3, $4, $5)",
                [
                    pacienteREGPar.nome,
                    pacienteREGPar.cpf,
                    pacienteREGPar.telefone,
                    pacienteREGPar.data_nascimento || null,
                    pacienteREGPar.removido !== undefined ? pacienteREGPar.removido : false,
                ]
            )
        ).rowCount;
    } catch (error) { // captura erros caso a insercao falhe (ex: cpf duplicado)
        msg = "[mdlPacientes InsertPaciente] " + (error.detail || error.message);
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const UpdatePaciente = async (pacienteIDPar, pacienteREGPar) => { // atualiza um paciente existente pelo id
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE pacientes SET " +
                "nome = $2, " +
                "cpf = $3, " +
                "telefone = $4, " +
                "data_nascimento = $5, " +
                "removido = $6 " +
                "WHERE id = $1",
                [
                    pacienteIDPar,
                    pacienteREGPar.nome,
                    pacienteREGPar.cpf,
                    pacienteREGPar.telefone,
                    pacienteREGPar.data_nascimento || null,
                    pacienteREGPar.removido !== undefined ? pacienteREGPar.removido : false,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlPacientes UpdatePaciente] " + (error.detail || error.message);
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const DeletePaciente = async (pacienteIDPar) => { // executa o soft delete marcando removido = true
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE pacientes SET removido = true WHERE id = $1",
                [pacienteIDPar]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlPacientes DeletePaciente] " + (error.detail || error.message);
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const GetPacientesToConsultas = async () => { // busca pacientes disponiveis para vincular na consulta
    return (
        await db.query(
            "SELECT id, nome, cpf FROM pacientes WHERE removido = false ORDER BY nome ASC"
        )
    ).rows;
};

module.exports = {
    GetAllPacientes,
    GetPacienteByID,
    InsertPaciente,
    UpdatePaciente,
    DeletePaciente,
    GetPacientesToConsultas,
};

