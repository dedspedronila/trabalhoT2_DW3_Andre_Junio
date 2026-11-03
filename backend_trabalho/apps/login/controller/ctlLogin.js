const jwt = require("jsonwebtoken"); // importa o modulo de criacao e verificacao de tokens JWT
const bCrypt = require("bcryptjs"); // importa o modulo de criptografia para comparacao segura
const mdlLogin = require("../model/mdlLogin"); // importa as funcoes de banco do model de login

const JWT_SECRET = process.env.SECRET_API || "CHAVE_SECRETA_JWT_DW3_PADRAO";

const Login = async (req, res, next) => { // rota para autenticar o usuario e gerar o token JWT
    try {
        const usernameInput = req.body.username;
        const passwordInput = req.body.password;

        if (!usernameInput || !passwordInput) {
            return res.status(200).json({ auth: false, message: "Informe usuário e senha!" });
        }

        const credencial = await mdlLogin.GetCredencial(usernameInput); // busca a credencial do usuario no banco
        if (!credencial || credencial.length === 0) { // verifica se a credencial existe
            return res.status(200).json({ auth: false, message: "Usuário não identificado!" });
        }

        if (bCrypt.compareSync(passwordInput, credencial[0].password)) { // compara a senha com o hash criptografado
            const username = credencial[0].username;
            const token = jwt.sign({ id: credencial[0].id, username: username }, JWT_SECRET, {
                expiresIn: 3600, // expira em 1 hora (3600s)
            });
            return res.json({ auth: true, token: token, username: username });
        }

        return res.status(200).json({ auth: false, message: "Login inválido!" });
    } catch (error) {
        return res.status(500).json({ auth: false, message: "Erro no servidor ao autenticar: " + error.message });
    }
};

function AutenticaJWT(req, res, next) { // middleware para verificar se o token JWT enviado na requisicao e valido
    const tokenHeader = req.headers["authorization"]; // pega o token do cabecalho da requisicao
    if (!tokenHeader) {
        return res.status(200).json({ auth: false, message: "Não foi informado o token JWT" });
    }

    const bearer = tokenHeader.split(" ");
    const token = bearer[1] || bearer[0]; // aceita tanto "Bearer <token>" quanto "<token>" direto

    if (!token) {
        return res.status(200).json({ auth: false, message: "Não foi informado o token JWT" });
    }

    jwt.verify(token, JWT_SECRET, function (err, decoded) { // valida a autenticidade e validade do token
        if (err) {
            return res.status(200).json({ auth: false, message: "JWT inválido ou expirado" });
        }
        req.userId = decoded.id;
        req.username = decoded.username;
        next();
    });
}

const Logout = (req, res, next) => { // rota para realizar o encerramento da sessao
    res.json({ auth: false, token: null });
};

module.exports = {
    Login,
    Logout,
    AutenticaJWT,
};
