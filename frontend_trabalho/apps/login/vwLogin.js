//espera o html carregar antes de executar
document.addEventListener('DOMContentLoaded', function () {

    //limpa o Cookie Islogged
    dw3ClearIsLoggedCookie();

    //atribui o formulário de login e onde as mensagem de erro vai ser exibida
    var form = document.getElementById('loginForm');
    var errorBox = document.getElementById('loginError');

    //se o formulario de login não executar, a execução é interrompida
    if (!form) {
        return;
    }
    //verifica o formulario no back antes de avançar
    form.addEventListener('submit', async function (event) {

        //trava o formulario, para não recarregar a pagina
        event.preventDefault();

        //atribui a url do servidor, usuario e senha para enviar para o back-end
        var servidorDw3 = form.dataset.servidorDw3; //vem de routes/rtLogin.js
        var usuario = document.getElementById('usuario').value;
        var senha = document.getElementById('senha').value;
        var submitButton = form.querySelector('button[type="submit"]');

        //caso haja erro, ele é escondido e o texto é limpo
        if (errorBox) {
            errorBox.classList.add('d-none');
            errorBox.textContent = '';
        }

        //desativa o botão de confirmar para evitar varios cliques 
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Entrando...';
        }

        //faz a requisição de login para o back 
        try {
            var response = await fetch(servidorDw3 + '/Login', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    username: usuario,
                    password: senha
                })
            });

            //se retornar erro, é exibida na tela 
            if (!response.ok) {
                throw new Error('Usuario ou senha inválidos.');
            }

            //converte a resposta do back para json
            var data = await response.json();

            //procura o token de resposta do back
            var token = data.token || data.Token || data.accessToken || data.AccessToken;

            //se não encontrar, exibe o erro
            if (!token) {
                throw new Error('Erro no login. Token não retornado pelo servidor.');
            }

            //salva o token criando um cookie para verificar se o usuário está logado
            localStorage.setItem('token', token);
            document.cookie = 'IsLogged=true; path=/'; //define o cookie usado para verificar se o usuário está ou não logado
            window.location.href = '/home'; //redireciona o usuario para a pagina inicial

            //caso haja erro, exibe na tela 
        } catch (error) {
            if (errorBox) {
                errorBox.textContent = error.message || 'Nao foi possivel realizar o login.';
                errorBox.classList.remove('d-none');
            }

            //executada no final, reativando o botão de entrar/ fazer login novamente
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Entrar';
            }
        }
    });
});
