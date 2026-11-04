//quando carregar a página: valida o login e define qual operação será feita 
//(criar, ler, atualizar ou deletar)
document.addEventListener('DOMContentLoaded', async function () {

    //verifica se o usuario está logado, se não, interrompe o cookie
    if (!dw3IsLogged()) {
        return;
    }
    //verifica o form. pelo id, se não encontrar, interrompe a sessão
    var form = document.getElementById('frmPacientes');
    if (!form) {
        return;
    }

    //verifica os parametros 
    var parametros = new URLSearchParams(window.location.search);

    //verifica qual operação será feita
    var oper = parametros.get('oper') || parametros.get('Oper');

    //puxa a url do servidor backend
    var servidorDw3 = form.dataset.servidorDw3;

    //armazena os botões
    var btnInserir = document.getElementById('btnInserirPaciente');
    var btnAtualizar = document.getElementById('btnAtualizarPaciente');
    var btnRemover = document.getElementById('btnRemoverPaciente');

    //se for operação para criar
    if (oper === 'Cr') {
        btnInserir.classList.remove('d-none'); //botao fica visivel
    }
    if (btnInserir) {
        btnInserir.addEventListener('click', function () {
            vwInsertPaciente();
        });
    }
    //se for operação para ler
    if (oper === 'Re') {
        vwGetPacienteByID();
    }

    //se for operação para atualizar
    if (oper === 'Up') {
        btnAtualizar.classList.remove('d-none');
        btnAtualizar.disabled = !(await vwGetPacienteByID());
        btnAtualizar.addEventListener('click', function () {
            vwUpdatePaciente();
        });
    }

    //se for operação para deletar
    if (oper === 'De') {
        btnRemover.classList.remove('d-none');
        btnRemover.disabled = !(await vwGetPacienteByID());
        btnRemover.addEventListener('click', function () {
            vwDeletePaciente();
        });
    }
});

//função para inserir um novo paciente no servidor via POST
async function vwInsertPaciente() {
    var form = document.getElementById('frmPacientes');
    var btnInserir = document.getElementById('btnInserirPaciente');
    try {
        //valida se os campos obrigatórios do formulário foram preenchidos
        if (!form.reportValidity()) {
            return;
        }
        var servidorDw3 = form.dataset.servidorDw3;
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        //desativa o botão para evitar cliques duplos
        if (btnInserir) {
            btnInserir.disabled = true;
        }
        //envia os dados do formulário para o backend
        var response = await fetch(servidorDw3 + '/insertPaciente', {
            method: 'POST',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(montarPacienteDoFormulario())
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel inserir o paciente.');
        }
        var data = await response.json();

        //verifica se a sessão expirou
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel inserir o paciente.');
        }

        //redireciona para a listagem após o sucesso
        window.location.href = '/pacientes';
    } catch (error) {
        alert(error.message || 'Erro ao inserir paciente.');
    } finally {
        //reativa o botão ao finalizar
        if (btnInserir) {
            btnInserir.disabled = false;
        }
    }
}

//monta o objeto do paciente a partir dos campos do formulário
function montarPacienteDoFormulario() {
    return {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        telefone: document.getElementById('telefone').value,
        data_nascimento: document.getElementById('data_nascimento').value,
        removido: document.getElementById('removido').value === 'true'
    };
}

//busca um paciente pelo ID e preenche o formulário com os dados retornados do backend
async function vwGetPacienteByID() {
    var form = document.getElementById('frmPacientes');
    try {
        var parametros = new URLSearchParams(window.location.search);
        var pacienteId = parametros.get('pacienteId');
        var servidorDw3 = form.dataset.servidorDw3;

        //verifica se o ID do paciente é um numero válido
        if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
            throw new Error('ID do paciente invalido.');
        }
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }

        //faz a requisição GET para buscar o paciente no servidor
        var response = await fetch(servidorDw3 + '/getPacienteByID/' + encodeURIComponent(pacienteId), {
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            })
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel carregar o paciente.');
        }
        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta invalida do servidor backend.');
        }
        var paciente = data.registro[0];
        if (!paciente) {
            throw new Error('Paciente nao encontrado.');
        }

        //preenche os campos do formulário com os dados obtidos
        document.getElementById('id').value = paciente.id;
        document.getElementById('nome').value = paciente.nome ?? '';
        document.getElementById('cpf').value = paciente.cpf ?? '';
        document.getElementById('telefone').value = paciente.telefone ?? '';
        document.getElementById('data_nascimento').value = paciente.data_nascimento ? paciente.data_nascimento.slice(0, 10) : '';
        document.getElementById('removido').value = String(paciente.removido === true);
        return true;
    } catch (error) {
        alert(error.message || 'Erro ao carregar paciente.');
        return false;
    }
}

//atualiza os dados de um paciente existente no servidor via PUT
async function vwUpdatePaciente() {
    var form = document.getElementById('frmPacientes');
    var btnAtualizar = document.getElementById('btnAtualizarPaciente');
    if (btnAtualizar.disabled || !form.reportValidity()) {
        return;
    }
    try {
        var pacienteId = new URLSearchParams(window.location.search).get('pacienteId');
        var servidorDw3 = form.dataset.servidorDw3;

        //verifica se o botão esta desativado ou se o formulário é invalido
        if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
            throw new Error('ID do paciente invalido.');
        }
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        btnAtualizar.disabled = true;
        var paciente = montarPacienteDoFormulario();

        //envia a requisição PUT com os novos dados
        var response = await fetch(servidorDw3 + '/updatePaciente/' + encodeURIComponent(pacienteId), {
            method: 'PUT',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(paciente)
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel atualizar o paciente.');
        }
        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel atualizar o paciente.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum paciente foi atualizado.');
        }
        alert('Paciente atualizado com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar paciente.');
    } finally {
        btnAtualizar.disabled = false;
    }
}

//remove um paciente do servidor via DELETE após confirmação
async function vwDeletePaciente() {
    var form = document.getElementById('frmPacientes');
    var btnRemover = document.getElementById('btnRemoverPaciente');
    if (btnRemover.disabled) {
        return;
    }

    //exibe alerta de confirmação antes de excluir
    if (!window.confirm('Confirma a remoção deste paciente?')) {
        return;
    }
    try {
        var pacienteId = document.getElementById('id').value;
        var servidorDw3 = form.dataset.servidorDw3;
        if (!pacienteId || !/^\d+$/.test(pacienteId) || Number(pacienteId) <= 0) {
            throw new Error('ID do paciente invalido.');
        }
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        btnRemover.disabled = true;

        //envia a requisição DELETE para apagar o registro
        var response = await fetch(servidorDw3 + '/deletePaciente/' + encodeURIComponent(pacienteId), {
            method: 'DELETE',
            headers: dw3MontarHeadersAutenticacao()
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel remover o paciente.');
        }
        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel remover o paciente.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum paciente foi removido.');
        }
        window.location.href = '/pacientes';
    } catch (error) {
        alert(error.message || 'Erro ao remover paciente.');
    } finally {
        btnRemover.disabled = false;
    }
}
