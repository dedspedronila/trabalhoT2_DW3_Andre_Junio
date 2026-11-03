const mdlPacientes = require("../model/mdlPacientes"); // importa as funcoes de banco do model de pacientes

const GetAllPacientes = (req, res) => // rota para listar todos os pacientes
    (async () => {
        try {
            let registro = await mdlPacientes.GetAllPacientes();
            for (let i = 0; i < registro.length; i++) {
                const row = registro[i];
                if (row.data_nascimento instanceof Date) {
                    row.data_nascimento = row.data_nascimento.toISOString().split('T')[0];
                }
            }
            res.json({ status: "ok", registro: registro });
        } catch (error) {
            res.status(500).json({ status: "erro", message: error.message });
        }
    })();

const GetPacienteByID = (req, res) => // rota para buscar um paciente pelo id
    (async () => {
        try {
            const pacienteID = parseInt(req.params.id || req.params.pacienteid);
            let registro = await mdlPacientes.GetPacienteByID(pacienteID);
            if (registro.length > 0 && registro[0].data_nascimento instanceof Date) {
                registro[0].data_nascimento = registro[0].data_nascimento.toISOString().split('T')[0];
            }
            res.json({ status: "ok", registro: registro });
        } catch (error) {
            res.status(500).json({ status: "erro", message: error.message });
        }
    })();

const InsertPaciente = (request, res) => // rota para cadastrar um novo paciente
    (async () => {
        try {
            const pacienteREG = request.body;
            let { msg, linhasAfetadas } = await mdlPacientes.InsertPaciente(pacienteREG);
            res.json({ status: msg, linhasAfetadas: linhasAfetadas });
        } catch (error) {
            res.status(500).json({ status: error.message, linhasAfetadas: -1 });
        }
    })();

const UpdatePaciente = (request, res) => // rota para atualizar um paciente existente
    (async () => {
        try {
            const pacienteID = parseInt(request.params.id || request.params.pacienteid);
            const pacienteREG = request.body;
            let { msg, linhasAfetadas } = await mdlPacientes.UpdatePaciente(pacienteID, pacienteREG);
            res.json({ status: msg, linhasAfetadas: linhasAfetadas });
        } catch (error) {
            res.status(500).json({ status: error.message, linhasAfetadas: -1 });
        }
    })();

const DeletePaciente = (request, res) => // rota para apagar logicamente o paciente (soft delete)
    (async () => {
        try {
            const pacienteID = parseInt(request.params.id || request.params.pacienteid);
            let { msg, linhasAfetadas } = await mdlPacientes.DeletePaciente(pacienteID);
            res.json({ status: msg, linhasAfetadas: linhasAfetadas });
        } catch (error) {
            res.status(500).json({ status: error.message, linhasAfetadas: -1 });
        }
    })();

const GetPacientesToConsultas = (req, res) => // rota auxiliar para alimentar o select no cadastro de consultas
    (async () => {
        try {
            let registro = await mdlPacientes.GetPacientesToConsultas();
            res.json({ status: "ok", registro: registro });
        } catch (error) {
            res.status(500).json({ status: "erro", message: error.message });
        }
    })();

module.exports = {
    GetAllPacientes,
    GetPacienteByID,
    InsertPaciente,
    UpdatePaciente,
    DeletePaciente,
    GetPacientesToConsultas,
};

