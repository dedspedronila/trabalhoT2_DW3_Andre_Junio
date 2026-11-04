//cria express e o router para criar as rotas
var express = require('express');
var router = express.Router();

//pega a rota /pacientes e inicializa no site
router.get('/', function(req, res) {
    res.render('pacientes/vwLstPacientes', {
        title: 'Pacientes',
        showNavbar: true,
        activeMenu: 'pacientes',
        servidorDw3: process.env.SERVIDOR_DW3 //puxa do back a conexão 
    });
});

//define uma rota GET para o caminho '/form' (ex: /pacientes/form)
router.get('/form', function(req, res) {
    
    //renderiza o template HTML do formulário de pacientes
    res.render('pacientes/vwFormPacientes', {
        title: 'Formulario de pacientes',
        showNavbar: true,
        activeMenu: 'pacientes',
        servidorDw3: process.env.SERVIDOR_DW3
    });
});

module.exports = router;
