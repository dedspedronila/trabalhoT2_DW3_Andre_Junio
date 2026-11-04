//cria express e o router para criar as rotas
var express = require('express');
var router = express.Router();

//é a rota / que obriga o usuario se identificar na login
router.get('/', function (req, res) {
    res.redirect('/login');
});

//exporta para termos o acesso ao arquivo
module.exports = router;
