//ao entrar na pagina carrega a listagem de pacientes
document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return; //sai se não estiver logado
    }
    var listagem = document.getElementById('pacientesListagem');
    var alertBox = document.getElementById('pacientesAlert');
    if (!listagem) {
        return;
    }
    var servidorDw3 = listagem.dataset.servidorDw3;
    configurarOperacoesPacientes(alertBox);
    carregarPacientes(servidorDw3, alertBox);
});

//requisição GET para buscar todos os pacientes cadastrados no servidor
async function carregarPacientes(servidorDw3, alertBox) {
    try {
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        var response = await fetch(servidorDw3 + '/getAllPacientes', {
            headers: dw3MontarHeadersAutenticacao()
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel carregar a lista de pacientes.');
        }
        var data = await response.json();
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta invalida do servidor backend.');
        }

        //inicializa a tabela com os registros obtidos
        inicializarTabelaPacientes(data.registro);
    } catch (error) {
        exibirErro(alertBox, error.message || 'Erro ao carregar pacientes.');
        inicializarTabelaPacientes([]); //inicializa tabela vazia em caso de erro
    }
}

//configura o plugin DataTable preenchendo as colunas, formatação de data e botões de ação
function inicializarTabelaPacientes(pacientes) {
    new DataTable('#tblPacientes', {
        data: pacientes,
        columns: [
            { data: 'id', defaultContent: '' },
            { data: 'nome', defaultContent: '' },
            { data: 'cpf', defaultContent: '' },
            { data: 'telefone', defaultContent: '' },
            {
                data: 'data_nascimento',
                defaultContent: '',
                render: function(data) {
                    if (!data) {
                        return '';
                    }
                    //formata a data para o padrão brasileiro (DD/MM/AAAA)
                    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
                }
            },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    if (type !== 'display') {
                        return '';
                    }
                    var pacienteId = escaparHtml(row.id || '');
                    //renderiza os botões de visualizar, atualizar e remover em cada linha da tabela
                    return [
                        '<div class="btn-group btn-group-sm" role="group" aria-label="Operacoes do paciente">',
                        '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-pacienteid="' + pacienteId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
                        '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-pacienteid="' + pacienteId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
                        '<button class="btn btn-outline-danger" type="button" data-action="remover" data-pacienteid="' + pacienteId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
                        '</div>'
                    ].join('');
                }
            }
        ],

        //traduções da interface do DataTable para o português
        language: {
            emptyTable: 'Nenhum paciente cadastrado.',
            info: 'Mostrando _START_ ate _END_ de _TOTAL_ registros',
            infoEmpty: 'Mostrando 0 ate 0 de 0 registros',
            infoFiltered: '(filtrado de _MAX_ registros no total)',
            lengthMenu: 'Mostrar _MENU_ registros',
            loadingRecords: 'Carregando...',
            processing: 'Processando...',
            search: 'Pesquisar:',
            zeroRecords: 'Nenhum registro encontrado',
            paginate: {
                first: 'Primeiro',
                last: 'Ultimo',
                next: 'Proximo',
                previous: 'Anterior'
            }
        }
    });
}

//configura os cliques nos botões da tabela para redirecionar para o formulário com a operação correta
function configurarOperacoesPacientes(alertBox) {
    var tabela = document.getElementById('tblPacientes');
    if (!tabela) {
        return;
    }
    tabela.addEventListener('click', function(event) {
        var botao = event.target.closest('button[data-action][data-pacienteid]');
        if (!botao) {
            return;
        }
        var action = botao.dataset.action;
        var pacienteId = botao.dataset.pacienteid;

        //redireciona para visualização ('Re')
        if (action === 'visualizar') {
            window.location.href = '/pacientes/form?oper=Re&pacienteId=' + encodeURIComponent(pacienteId);
            return;
        }

        //redireciona para atualização ('Up')
        if (action === 'atualizar') {
            window.location.href = '/pacientes/form?oper=Up&pacienteId=' + encodeURIComponent(pacienteId);
            return;
        }

        //redireciona para remoção ('De')
        if (action === 'remover') {
            window.location.href = '/pacientes/form?oper=De&pacienteId=' + encodeURIComponent(pacienteId);
        }
    });
}

//exibe uma mensagem de aviso/informação na tela
function exibirAviso(alertBox, mensagem) {
    if (!alertBox) {
        return;
    }
    alertBox.textContent = mensagem;
    alertBox.classList.remove('alert-danger');
    alertBox.classList.add('alert-info');
    alertBox.classList.remove('d-none');
}

//escapa caracteres especiais do HTML para evitar falhas de segurança
function escaparHtml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

//exibe uma mensagem de erro na tela
function exibirErro(alertBox, mensagem) {
    if (!alertBox) {
        return;
    }
    alertBox.textContent = mensagem;
    alertBox.classList.remove('alert-info');
    alertBox.classList.add('alert-danger');
    alertBox.classList.remove('d-none');
}
