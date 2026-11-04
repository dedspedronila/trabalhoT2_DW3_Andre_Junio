//cria express e o router para criar as rotas
var express = require('express');
var router = express.Router();

//pega a rota /home e inicializa no site
router.get('/', function (req, res) {
    res.render('home', {
        title: 'Painel Principal',
        showNavbar: true,
        activeMenu: 'home'
    });
});

//exporta para termos o acesso ao arquivo
module.exports = router;
