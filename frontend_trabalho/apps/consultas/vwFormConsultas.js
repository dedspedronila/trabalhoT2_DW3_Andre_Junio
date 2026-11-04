//quando a pagina é carregada valida o login, pega elementos, configura o Select2 e define a operação 
// (criar, ler, atualizar ou deletar)
document.addEventListener('DOMContentLoaded', async function() {
    if (!dw3IsLogged()) {
        return; //sai se não estiver logado
    }
    var form = document.getElementById('frmConsultas');
    if (!form) {
        return;
    }
    var parametros = new URLSearchParams(window.location.search);
    var oper = parametros.get('oper') || parametros.get('Oper');
    var servidorDw3 = form.dataset.servidorDw3;
    var btnInserir = document.getElementById('btnInserirConsulta');
    var btnAtualizar = document.getElementById('btnAtualizarConsulta');
    var btnRemover = document.getElementById('btnRemoverConsulta');

    //inicializa o componente de seleção de pacientes 
    inicializarSelectPacientes();

    //se for criar ('Cr')
    if (oper === 'Cr') {
        btnInserir.classList.remove('d-none'); //torna o botão visível
        carregarPacientesToConsultas(servidorDw3); //carrega os pacientes no select
    }
    if (btnInserir) {
        btnInserir.addEventListener('click', function() {
            vwInsertConsulta();
        });
    }

    //se for ler('Re')
    if (oper === 'Re') {
        vwGetConsultaByID();
    }

    //se for atualizar ('Up')
    if (oper === 'Up') {
        btnAtualizar.classList.remove('d-none');
        btnAtualizar.disabled = !(await vwGetConsultaByID());
        btnAtualizar.addEventListener('click', function() {
            vwUpdateConsulta();
        });
    }

    //se for deletar ('De')
    if (oper === 'De') {
        btnRemover.classList.remove('d-none');
        btnRemover.disabled = !(await vwGetConsultaByID());
        btnRemover.addEventListener('click', function() {
            vwDeleteConsulta();
        });
    }
});

//inicializa o plugin no campo de pacientes
function inicializarSelectPacientes() {
    $('#paciente_id').select2({
        theme: 'bootstrap-5',
        placeholder: 'Selecione um paciente',
        width: '100%'
    });
}

//busca os pacientes disponíveis no backend para preencher 
async function carregarPacientesToConsultas(servidorDw3) {
    try {
        if (!servidorDw3) {
            throw new Error('Endereço do servidor backend nao configurado.');
        }
        var response = await fetch(servidorDw3 + '/getPacientesToConsultas', {
            headers: dw3MontarHeadersAutenticacao() //adiciona os headers de autenticação
        });
        if (!response.ok) {
            throw new Error('Não foi possivel carregar os pacientes.');
        }
        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faca login novamente.');
        }
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta invalida do servidor backend.');
        }
        preencherSelectPacientes(data.registro);
    } catch (error) {
        alert(error.message || 'Erro ao carregar pacientes.');
    }
}

//preenche o elemento select com as opções de pacientes vindas do servidor
function preencherSelectPacientes(pacientes) {
    var pacienteSelect = document.getElementById('paciente_id');
    if (!pacienteSelect) {
        return;
    }
    pacienteSelect.innerHTML = '<option value="">Selecione um paciente</option>';
    pacientes.forEach(function(paciente) {
        var option = document.createElement('option');
        option.value = paciente.id;
        option.textContent = paciente.nome + ' - ' + paciente.cpf;
        pacienteSelect.appendChild(option);
    });
    $('#paciente_id').trigger('change');
}

//envia os dados para criar uma nova consulta no servidor (POST)
async function vwInsertConsulta() {
    var form = document.getElementById('frmConsultas');
    var btnInserir = document.getElementById('btnInserirConsulta');
    try {
        if (!form.reportValidity()) {
            return; //valida os campos obrigatórios
        }
        var servidorDw3 = form.dataset.servidorDw3;
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        if (btnInserir) {
            btnInserir.disabled = true; //desativa o botão para evitar cliques duplos
        }
        var response = await fetch(servidorDw3 + '/insertConsulta', {
            method: 'POST',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(montarConsultaDoFormulario())
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel inserir a consulta.');
        }
        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel inserir a consulta.');
        }
        window.location.href = '/consultas'; //retorna para a listagem
    } catch (error) {
        alert(error.message || 'Erro ao inserir consulta.');
    } finally {
        if (btnInserir) {
            btnInserir.disabled = false; //reativa o botão
        }
    }
}

//puxa os valores preenchidos nos inputs do formulário e retorna um objeto
function montarConsultaDoFormulario() {
    return {
        medico_nome: document.getElementById('medico_nome').value,
        diagnostico: document.getElementById('diagnostico').value,
        valor_consulta: document.getElementById('valor_consulta').value,
        data_consulta: document.getElementById('data_consulta').value,
        paciente_id: document.getElementById('paciente_id').value,
        removido: document.getElementById('removido').value === 'true'
    };
}

//busca uma consulta específica pelo ID da URL e preenche o formulário (GET)
async function vwGetConsultaByID() {
    var form = document.getElementById('frmConsultas');
    try {
        var parametros = new URLSearchParams(window.location.search);
        var consultaId = parametros.get('consultaId');
        var servidorDw3 = form.dataset.servidorDw3;
        if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
            throw new Error('ID da consulta invalido.');
        }
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        var response = await fetch(servidorDw3 + '/getConsultaByID/' + encodeURIComponent(consultaId), {
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            })
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel carregar a consulta.');
        }
        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta invalida do servidor backend.');
        }
        var consulta = data.registro[0];
        if (!consulta) {
            throw new Error('Consulta nao encontrada.');
        }

        //preenche os campos da tela com os dados retornados
        document.getElementById('id').value = consulta.id;
        document.getElementById('medico_nome').value = consulta.medico_nome ?? '';
        document.getElementById('diagnostico').value = consulta.diagnostico ?? '';
        document.getElementById('valor_consulta').value = consulta.valor_consulta ?? '';
        document.getElementById('data_consulta').value = consulta.data_consulta ? consulta.data_consulta.slice(0, 10) : '';
        document.getElementById('removido').value = String(consulta.removido === true);

        await carregarPacientesToConsultas(servidorDw3); //carrega os pacientes 
        $('#paciente_id').val(consulta.paciente_id).trigger('change'); //seleciona o paciente correto
        return true;
    } catch (error) {
        alert(error.message || 'Erro ao carregar consulta.');
        return false;
    }
}

//atualiza os dados de uma consulta existente no servidor (PUT)
async function vwUpdateConsulta() {
    var form = document.getElementById('frmConsultas');
    var btnAtualizar = document.getElementById('btnAtualizarConsulta');
    if (btnAtualizar.disabled || !form.reportValidity()) {
        return;
    }
    try {
        var consultaId = new URLSearchParams(window.location.search).get('consultaId');
        var servidorDw3 = form.dataset.servidorDw3;
        if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
            throw new Error('ID da consulta invalido.');
        }
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        btnAtualizar.disabled = true;
        var consulta = montarConsultaDoFormulario();
        consulta.valor_consulta = Number(consulta.valor_consulta);
        consulta.paciente_id = Number(consulta.paciente_id);
        var response = await fetch(servidorDw3 + '/updateConsulta/' + encodeURIComponent(consultaId), {
            method: 'PUT',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(consulta)
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel atualizar a consulta.');
        }
        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel atualizar a consulta.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhuma consulta foi atualizada.');
        }
        alert('Consulta atualizada com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar consulta.');
    } finally {
        btnAtualizar.disabled = false;
    }
}


//remove uma consulta do servidor após confirmação (DELETE)
async function vwDeleteConsulta() {
    var form = document.getElementById('frmConsultas');
    var btnRemover = document.getElementById('btnRemoverConsulta');
    if (btnRemover.disabled) {
        return;
    }

    //exibe caixa de confirmação nativa
    if (!window.confirm('Confirma a remoção desta consulta?')) {
        return;
    }
    try {
        var consultaId = document.getElementById('id').value;
        var servidorDw3 = form.dataset.servidorDw3;
        if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
            throw new Error('ID da consulta invalido.');
        }
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        btnRemover.disabled = true;
        var response = await fetch(servidorDw3 + '/deleteConsulta/' + encodeURIComponent(consultaId), {
            method: 'DELETE',
            headers: dw3MontarHeadersAutenticacao()
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel remover a consulta.');
        }
        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel remover a consulta.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhuma consulta foi removida.');
        }
        window.location.href = '/consultas'; //retorna para a listagem
    } catch (error) {
        alert(error.message || 'Erro ao remover consulta.');
    } finally {
        btnRemover.disabled = false;
    }
}
