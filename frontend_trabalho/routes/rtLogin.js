//cria express e o router para criar as rotas
var express = require('express');
var router = express.Router();

//pega a rota /login e inicializa na home
router.get('/', function (req, res) {
    res.render('login', {
        title: 'Login',
        showNavbar: false,
        servidorDw3: process.env.SERVIDOR_DW3 
    });
});

//é a rota que o usuario se identifica 
router.post('/', function (req, res) {
    res.redirect('/home');
});

//exporta para termos o acesso ao arquivo
module.exports = router;
