const db = require("../../../database/databaseconfig"); // importa o modulo de conexao com o banco de dados

const GetAllConsultas = async () => { // busca todas as consultas ativas (removido = false)
    return (
        await db.query(
            "SELECT *, (SELECT nome FROM pacientes WHERE id = consultas.paciente_id) AS nome_paciente " +
            "FROM consultas WHERE removido = false ORDER BY data_consulta DESC, id DESC"
        )
    ).rows;
};

const GetConsultaByID = async (consultaIDPar) => { // busca uma consulta especifica pelo id (removido = false)
    return (
        await db.query(
            "SELECT *, (SELECT nome FROM pacientes WHERE id = consultas.paciente_id) AS nome_paciente " +
            "FROM consultas WHERE id = $1 AND removido = false",
            [consultaIDPar]
        )
    ).rows;
};

const InsertConsulta = async (consultaREGPar) => { // cadastra uma nova consulta
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "INSERT INTO consultas (paciente_id, medico_nome, data_consulta, valor_consulta, diagnostico, removido) " +
                "VALUES ($1, $2, $3, $4, $5, $6)",
                [
                    consultaREGPar.paciente_id,
                    consultaREGPar.medico_nome,
                    consultaREGPar.data_consulta,
                    consultaREGPar.valor_consulta !== undefined ? consultaREGPar.valor_consulta : 0.00,
                    consultaREGPar.diagnostico || null,
                    consultaREGPar.removido !== undefined ? consultaREGPar.removido : false,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlConsultas|InsertConsulta] " + (error.detail || error.message);
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const UpdateConsulta = async (consultaIDPar, consultaREGPar) => { // atualiza uma consulta existente pelo id
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE consultas SET " +
                "paciente_id = $2, " +
                "medico_nome = $3, " +
                "data_consulta = $4, " +
                "valor_consulta = $5, " +
                "diagnostico = $6, " +
                "removido = $7 " +
                "WHERE id = $1",
                [
                    consultaIDPar,
                    consultaREGPar.paciente_id,
                    consultaREGPar.medico_nome,
                    consultaREGPar.data_consulta,
                    consultaREGPar.valor_consulta !== undefined ? consultaREGPar.valor_consulta : 0.00,
                    consultaREGPar.diagnostico || null,
                    consultaREGPar.removido !== undefined ? consultaREGPar.removido : false,
                ]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlConsultas|UpdateConsulta] " + (error.detail || error.message);
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

const DeleteConsulta = async (consultaIDPar) => { // efetua o soft delete marcando removido = true
    let linhasAfetadas;
    let msg = "ok";
    try {
        linhasAfetadas = (
            await db.query(
                "UPDATE consultas SET removido = true WHERE id = $1",
                [consultaIDPar]
            )
        ).rowCount;
    } catch (error) {
        msg = "[mdlConsultas|DeleteConsulta] " + (error.detail || error.message);
        linhasAfetadas = -1;
    }
    return { msg, linhasAfetadas };
};

module.exports = {
    GetAllConsultas,
    GetConsultaByID,
    InsertConsulta,
    UpdateConsulta,
    DeleteConsulta,
};
