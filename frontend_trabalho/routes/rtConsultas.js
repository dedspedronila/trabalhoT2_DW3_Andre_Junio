//cria express e o router para criar as rotas
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('consultas/vwLstConsultas', {
        title: 'Consultas',
        showNavbar: true,
        activeMenu: 'consultas',
        servidorDw3: process.env.SERVIDOR_DW3 // É necessário, pois, o front em html não acesso ao arquivo .env
    });
});

//define uma rota GET para o caminho '/form' dentro de consultas (ex: /consultas/form)
router.get('/form', function(req, res) {

    //renderiza o template HTML do formulário de consultas
    res.render('consultas/vwFormConsultas', {
        title: 'Formulario de consultas',
        showNavbar: true,
        activeMenu: 'consultas',
        servidorDw3: process.env.SERVIDOR_DW3
    });
});

//exporta para termos o acesso ao arquivo
module.exports = router;
