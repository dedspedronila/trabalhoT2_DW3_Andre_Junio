const mdlConsultas = require("../model/mdlConsultas"); // importa as funcoes de banco do model de consultas

const GetAllConsultas = (req, res) => // rota para listar todas as consultas
    (async () => {
        try {
            let registro = await mdlConsultas.GetAllConsultas();
            for (let i = 0; i < registro.length; i++) {
                const row = registro[i];
                if (row.data_consulta instanceof Date) {
                    row.data_consulta = row.data_consulta.toISOString().split('T')[0];
                }
            }
            res.json({ status: "ok", registro: registro });
        } catch (error) {
            res.status(500).json({ status: "erro", message: error.message });
        }
    })();

const GetConsultaByID = (req, res) => // rota para buscar uma consulta pelo id
    (async () => {
        try {
            const consultaID = parseInt(req.params.id || req.params.consultaid);
            let registro = await mdlConsultas.GetConsultaByID(consultaID);
            if (registro.length > 0 && registro[0].data_consulta instanceof Date) {
                registro[0].data_consulta = registro[0].data_consulta.toISOString().split('T')[0];
            }
            res.json({ status: "ok", registro: registro });
        } catch (error) {
            res.status(500).json({ status: "erro", message: error.message });
        }
    })();

const InsertConsulta = (request, res) => // rota para cadastrar uma nova consulta
    (async () => {
        try {
            const consultaREG = request.body;
            let { msg, linhasAfetadas } = await mdlConsultas.InsertConsulta(consultaREG);
            res.json({ status: msg, linhasAfetadas: linhasAfetadas });
        } catch (error) {
            res.status(500).json({ status: error.message, linhasAfetadas: -1 });
        }
    })();

const UpdateConsulta = (request, res) => // rota para atualizar uma consulta
    (async () => {
        try {
            const consultaID = parseInt(request.params.id || request.params.consultaid);
            const consultaREG = request.body;
            let { msg, linhasAfetadas } = await mdlConsultas.UpdateConsulta(consultaID, consultaREG);
            res.json({ status: msg, linhasAfetadas: linhasAfetadas });
        } catch (error) {
            res.status(500).json({ status: error.message, linhasAfetadas: -1 });
        }
    })();

const DeleteConsulta = (request, res) => // rota para apagar logicamente a consulta (soft delete)
    (async () => {
        try {
            const consultaID = parseInt(request.params.id || request.params.consultaid);
            let { msg, linhasAfetadas } = await mdlConsultas.DeleteConsulta(consultaID);
            res.json({ status: msg, linhasAfetadas: linhasAfetadas });
        } catch (error) {
            res.status(500).json({ status: error.message, linhasAfetadas: -1 });
        }
    })();

module.exports = {
    GetAllConsultas,
    GetConsultaByID,
    InsertConsulta,
    UpdateConsulta,
    DeleteConsulta,
};

