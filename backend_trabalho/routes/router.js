const express = require("express");
const routerApp = express.Router(); // instancia o roteador do express

const appLogin = require("../apps/login/controller/ctlLogin"); // controller de autenticacao e login
const appPacientes = require("../apps/pacientes/controller/ctlPacientes"); // controller do modulo de pacientes
const appConsultas = require("../apps/consultas/controller/ctlConsultas"); // controller do modulo de consultas

routerApp.use((req, res, next) => { // middleware intermediario para interceptar as requisicoes do roteador
    next();
});

// Rota raiz para verificacao de status da API
routerApp.get("/", (req, res) => {
    res.json({
        app: "ERP Saude - Backend API",
        status: "online",
        disciplina: "Desenvolvimento Web III",
        rotas_principais: {
            auth: ["/Login", "/Logout"],
            pacientes: [
                "GET /getAllPacientes",
                "GET /getPacienteByID/:id",
                "POST /insertPaciente",
                "PUT /updatePaciente/:id",
                "DELETE /deletePaciente/:id",
                "GET /getPacientesToConsultas"
            ],
            consultas: [
                "GET /getAllConsultas",
                "GET /getConsultaByID/:id",
                "POST /insertConsulta",
                "PUT /updateConsulta/:id",
                "DELETE /deleteConsulta/:id"
            ]
        }
    });
});

// ==========================================
// Rotas de Autenticacao (Publicas)
// ==========================================
routerApp.post("/Login", appLogin.Login);
routerApp.post("/Logout", appLogin.Logout);

// ==========================================
// Rotas de Pacientes (Protegidas por JWT)
// Suporta camelCase e PascalCase para compatibilidade
// ==========================================
routerApp.get("/getAllPacientes", appLogin.AutenticaJWT, appPacientes.GetAllPacientes);
routerApp.get("/GetAllPacientes", appLogin.AutenticaJWT, appPacientes.GetAllPacientes);

routerApp.get("/getPacienteByID/:id", appLogin.AutenticaJWT, appPacientes.GetPacienteByID);
routerApp.get("/GetPacienteByID/:id", appLogin.AutenticaJWT, appPacientes.GetPacienteByID);

routerApp.post("/insertPaciente", appLogin.AutenticaJWT, appPacientes.InsertPaciente);
routerApp.post("/InsertPaciente", appLogin.AutenticaJWT, appPacientes.InsertPaciente);

routerApp.put("/updatePaciente/:id", appLogin.AutenticaJWT, appPacientes.UpdatePaciente);
routerApp.put("/UpdatePaciente/:id", appLogin.AutenticaJWT, appPacientes.UpdatePaciente);

routerApp.delete("/deletePaciente/:id", appLogin.AutenticaJWT, appPacientes.DeletePaciente);
routerApp.delete("/DeletePaciente/:id", appLogin.AutenticaJWT, appPacientes.DeletePaciente);

routerApp.get("/getPacientesToConsultas", appLogin.AutenticaJWT, appPacientes.GetPacientesToConsultas);
routerApp.get("/GetPacientesToConsultas", appLogin.AutenticaJWT, appPacientes.GetPacientesToConsultas);

// ==========================================
// Rotas de Consultas (Protegidas por JWT)
// Suporta camelCase e PascalCase para compatibilidade
// ==========================================
routerApp.get("/getAllConsultas", appLogin.AutenticaJWT, appConsultas.GetAllConsultas);
routerApp.get("/GetAllConsultas", appLogin.AutenticaJWT, appConsultas.GetAllConsultas);

routerApp.get("/getConsultaByID/:id", appLogin.AutenticaJWT, appConsultas.GetConsultaByID);
routerApp.get("/GetConsultaByID/:id", appLogin.AutenticaJWT, appConsultas.GetConsultaByID);

routerApp.post("/insertConsulta", appLogin.AutenticaJWT, appConsultas.InsertConsulta);
routerApp.post("/InsertConsulta", appLogin.AutenticaJWT, appConsultas.InsertConsulta);

routerApp.put("/updateConsulta/:id", appLogin.AutenticaJWT, appConsultas.UpdateConsulta);
routerApp.put("/UpdateConsulta/:id", appLogin.AutenticaJWT, appConsultas.UpdateConsulta);

routerApp.delete("/deleteConsulta/:id", appLogin.AutenticaJWT, appConsultas.DeleteConsulta);
routerApp.delete("/DeleteConsulta/:id", appLogin.AutenticaJWT, appConsultas.DeleteConsulta);

module.exports = routerApp;
