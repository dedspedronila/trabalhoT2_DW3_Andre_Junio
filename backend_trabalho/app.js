const express = require('express'); // importa o express para criar a aplicacao web
const bodyParser = require('body-parser'); // importa o middleware para ler o corpo das requisicoes
require('dotenv').config(); // carrega as variaveis de ambiente do arquivo .env

// importa o arquivo de rotas
const router = require('./routes/router'); // importa as rotas definidas no router
const app = express(); // inicializa a instancia do express
const port = process.env.PORT || 40000;

app.use((req, res, next) => { // middleware para liberar acessos de outros dominios (CORS)
    res.header('Access-Control-Allow-Origin', '*'); // permite requisicoes de qualquer origem
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // libera os metodos http aceitos
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // libera os cabecalhos permitidos
    if (req.method === 'OPTIONS') { // verifica se e uma requisicao preflight de teste
        return res.sendStatus(204); // responde com status 204 sem conteudo e encerra a checagem
    }
    next(); // passa a requisicao para o proximo middleware ou rota
});

app.use(bodyParser.urlencoded({ extended: false })); // permite tratar dados enviados via formulario urlencoded
app.use(express.json()); // faz o express entender dados recebidos em formato json

// utiliza o router configurado em ./routes/router.js
app.use(router); // registra as rotas na aplicacao

app.listen(port, () => { // inicia o servidor ouvindo na porta definida
    console.log(`Backend ERP Saúde listening at port ${port}`); // imprime no terminal confirmando que subiu
});

module.exports = app;
