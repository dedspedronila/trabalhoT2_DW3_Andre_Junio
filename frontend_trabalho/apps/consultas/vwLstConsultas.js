//quando entrar na pagina valida o login, busca os elementos da listagem e inicia o carregamento das 
// consultas
document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return; //sai se não estiver logado
    }
    var listagem = document.getElementById('consultasListagem');
    var alertBox = document.getElementById('consultasAlert');
    if (!listagem) {
        return;
    }
    var servidorDw3 = listagem.dataset.servidorDw3;
    configurarOperacoesConsultas(alertBox);
    carregarConsultas(servidorDw3, alertBox);
});

//faz uma requisição GET para buscar todas as consultas cadastradas no servidor
async function carregarConsultas(servidorDw3, alertBox) {
    try {
        if (!servidorDw3) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }
        var response = await fetch(servidorDw3 + '/getAllConsultas', {
            headers: dw3MontarHeadersAutenticacao()
        });
        if (!response.ok) {
            throw new Error('Nao foi possivel carregar a lista de consultas.');
        }
        var data = await response.json();
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta invalida do servidor backend.');
        }

        //inicializa a tabela com os registros obtidos
        inicializarTabelaConsultas(data.registro);
    } catch (error) {
        exibirErro(alertBox, error.message || 'Erro ao carregar consultas.');
        inicializarTabelaConsultas([]); //tabela vazia em caso de erro
    }
}
//plugin DataTable preenchendo colunas, formatação de valor, data e botões de ação
function inicializarTabelaConsultas(consultas) {
    new DataTable('#tblConsultas', {
        data: consultas,
        columns: [
            { data: 'id', defaultContent: '' },
            { data: 'medico_nome', defaultContent: '' },
            { data: 'diagnostico', defaultContent: '' },
            {
                data: 'valor_consulta',
                defaultContent: '',
                render: function(data) {
                    if (data === null || data === undefined || data === '') {
                        return '';
                    }
                    //formata o valor numérico para o padrão de moeda Real (BRL)
                    return Number(data).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    });
                }
            },
            {
                data: 'data_consulta',
                defaultContent: '',
                render: function(data) {
                    if (!data) {
                        return '';
                    }
                    //formata a data para o padrão brasileiro (DD/MM/AAAA)
                    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
                }
            },
            { data: 'nome_paciente', defaultContent: '' },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    if (type !== 'display') {
                        return '';
                    }
                    var consultaId = escaparHtml(row.id || '');
                    //renderiza os botões de visualizar, atualizar e remover em cada linha
                    return [
                        '<div class="btn-group btn-group-sm" role="group" aria-label="Operacoes da consulta">',
                        '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-consultaid="' + consultaId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
                        '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-consultaid="' + consultaId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
                        '<button class="btn btn-outline-danger" type="button" data-action="remover" data-consultaid="' + consultaId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
                        '</div>'
                    ].join('');
                }
            }
        ],
        //traduções da interface do DataTable para o português
        language: {
            emptyTable: 'Nenhuma consulta cadastrada.',
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

//configura os cliques nos botões da tabela para redirecionar para o formulário com a operação
// correta
function configurarOperacoesConsultas(alertBox) {
    var tabela = document.getElementById('tblConsultas');
    if (!tabela) {
        return;
    }
    tabela.addEventListener('click', function(event) {
        var botao = event.target.closest('button[data-action][data-consultaid]');
        if (!botao) {
            return;
        }
        var action = botao.dataset.action;
        var consultaId = botao.dataset.consultaid;

        //redireciona para visualização ('Re')
        if (action === 'visualizar') {
            window.location.href = '/consultas/form?oper=Re&consultaId=' + encodeURIComponent(consultaId);
            return;
        }

        //redireciona para atualização ('Up')
        if (action === 'atualizar') {
            window.location.href = '/consultas/form?oper=Up&consultaId=' + encodeURIComponent(consultaId);
            return;
        }

        //redireciona para remoção ('De')
        if (action === 'remover') {
            window.location.href = '/consultas/form?oper=De&consultaId=' + encodeURIComponent(consultaId);
        }
    });
}

//exibe uma mensagem de aviso na tela
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
