# ERP Saúde - Backend API (Desenvolvimento Web III)

Backend desenvolvido para o 2º Trabalho Prático da disciplina **Desenvolvimento Web III (DW3)** do curso de Bacharelado em Sistemas de Informação - IFSP Campus Votuporanga.

Este projeto implementa as APIs RESTful do módulo de **Saúde** de um sistema ERP, com controle de autenticação via **JWT**, persistência em **PostgreSQL** e suporte a execução conteinerizada via **Docker**.

---

## 📋 Sumário
- [Estudo de Caso e Modelagem](#-estudo-de-caso-e-modelagem)
- [Regras de Negócio e Decisões de Projeto](#-regras-de-negócio-e-decisões-de-projeto)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Lista de APIs Implementadas](#-lista-de-apis-implementadas)
- [Instalação e Execução com Docker (Recomendado)](#-instalação-e-execução-com-docker-recomendado)
- [Instalação e Execução Local](#-instalação-e-execução-local)
- [Guia de Testes e Exemplos de Requisições](#-guia-de-testes-e-exemplos-de-requisições)
- [Integração com o Front-End](#-integração-com-o-front-end)

---

## 🏥 Estudo de Caso e Modelagem

Foram selecionadas duas entidades fortemente relacionadas (1:N) do módulo hospitalar/saúde: **Pacientes** e **Consultas**.

### Requisitos Atendidos:
- **Ambas as tabelas possuem os campos `id` e `removido`**.
- **Conjunto de tipos exigidos:**
  - **Texto:** `nome`, `cpf`, `telefone`, `medico_nome`, `diagnostico`
  - **Decimal:** `valor_consulta` (`NUMERIC(10,2)`)
  - **Data:** `data_nascimento` (`DATE`) e `data_consulta` (`DATE`)
- **Tabela de Usuários:** `usuarios` com senhas criptografadas em `bcrypt` (`pgcrypto`).

### Esquema do Banco de Dados:

```sql
-- 1. Tabela de Pacientes (1)
CREATE TABLE pacientes (
    id bigserial CONSTRAINT pk_pacientes PRIMARY KEY,
    nome varchar(100) NOT NULL,
    cpf varchar(14) UNIQUE NOT NULL,
    telefone varchar(20),
    data_nascimento date,
    removido boolean DEFAULT false
);

-- 2. Tabela de Consultas (N - Relacionada a Pacientes)
CREATE TABLE consultas (
    id bigserial CONSTRAINT pk_consultas PRIMARY KEY,
    paciente_id bigint NOT NULL CONSTRAINT fk_consultas_paciente REFERENCES pacientes(id),
    medico_nome varchar(100) NOT NULL,
    data_consulta date NOT NULL,
    valor_consulta numeric(10,2) NOT NULL DEFAULT 0.00,
    diagnostico text,
    removido boolean DEFAULT false
);

-- 3. Tabela de Usuários (Autenticação)
CREATE TABLE usuarios (
    id bigserial CONSTRAINT pk_usuarios PRIMARY KEY,
    username varchar(20) UNIQUE NOT NULL,
    password text NOT NULL,
    removido boolean DEFAULT false
);
```

---

## ⚖️ Regras de Negócio e Decisões de Projeto

1. **Soft Delete (Exclusão Lógica):** Nenhuma remoção apaga registros fisicamente do SGBD. A chamada `DeleteXXX` atualiza `removido = true`.
2. **Consultas (`GetAll` e `GetByID`):** Filtram obrigatoriamente `removido = false`, garantindo que registros inativos não sejam exibidos.
3. **Priorização dos Requisitos do PDF:**
   - O PDF exige colunas `ID` e `Removido`. No PostgreSQL, os nomes são padronizados em `id` e `removido`.
   - As rotas aceitam tanto a convenção camelCase (`/getAllPacientes`, `/getPacienteByID/:id`) quanto PascalCase (`/GetAllPacientes`, `/GetPacienteByID/:id`), garantindo total compatibilidade com os clientes e avaliações.
   - Retorno do endpoint de login enriquecido com `{ auth: true, token, username }`, facilitando o armazenamento exigido pelo PDF em `localStorage` ou `cookie` no front-end.
4. **Formatação de Datas:** No Postgres com driver Node.js `pg`, campos `DATE` retornam objetos `Date` em fuso horário UTC. O backend formata automaticamente para strings no formato ISO `YYYY-MM-DD`, prevenindo distorções no front-end.
5. **CORS Habilitado:** Configurado para aceitar origens externas, permitindo que o front-end execute em porta separada (ex: `3000` ou `5173`) sem bloqueios de navegador.

---

## 📁 Estrutura de Pastas

Seguindo rigorosamente o padrão arquitetural em camadas adotado em sala de aula:

```
trabalhoT2_DW3_Andre_Junio/
├── docker-compose.yml          # Orquestração do PostgreSQL e Backend
├── .gitignore                  # Arquivos ignorados para o Git
├── DW3_Trab02.pdf              # Especificação do trabalho
├── README.md                   # Documentação completa
└── backend_trabalho/           # Código-fonte do Backend
    ├── app.js                  # Inicialização do Express, middlewares e porta
    ├── package.json            # Dependências e scripts de execução
    ├── Dockerfile              # Imagem Docker do Backend (Node.js Alpine)
    ├── .env.example            # Exemplo de configuração de variáveis de ambiente
    ├── .env                    # Variáveis locais de ambiente
    ├── databaseConfig.sql      # Script DDL e seeds iniciais de dados
    ├── database/
    │   └── databaseconfig.js   # Pool de conexões PostgreSQL (pg)
    ├── routes/
    │   └── router.js           # Definição e proteção de rotas com JWT
    └── apps/
        ├── login/              # Módulo de Autenticação
        │   ├── controller/ctlLogin.js
        │   ├── model/mdlLogin.js
        │   └── tests/testLogin.rest
        ├── pacientes/          # Módulo 1 (Tabela Pacientes)
        │   ├── controller/ctlPacientes.js
        │   ├── model/mdlPacientes.js
        │   └── tests/testPacientes.rest
        └── consultas/          # Módulo 2 (Tabela Consultas)
            ├── controller/ctlConsultas.js
            ├── model/mdlConsultas.js
            └── tests/testConsultas.rest
```

---

## 🔌 Lista de APIs Implementadas

Todas as rotas de CRUD exigem o cabeçalho `Authorization: Bearer <TOKEN_JWT>`.

### 1. Autenticação (Pública)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/Login` | Autentica usuário (`username`, `password`) e retorna o JWT |
| `POST` | `/Logout` | Invalida a sessão do cliente retornando token nulo |
| `GET`  | `/` | Status da API e índice de rotas |

### 2. Módulo de Pacientes
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/getAllPacientes` | Retorna todos os pacientes ativos (`removido = false`) |
| `GET` | `/getPacienteByID/:id` | Retorna paciente por ID (`removido = false`) |
| `POST` | `/insertPaciente` | Insere novo paciente |
| `PUT` | `/updatePaciente/:id` | Atualiza paciente existente pelo ID |
| `DELETE` | `/deletePaciente/:id` | Exclusão lógica (`removido = true`) |
| `GET` | `/getPacientesToConsultas` | Retorna lista resumida (`id`, `nome`, `cpf`) para select |

### 3. Módulo de Consultas
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/getAllConsultas` | Retorna todas as consultas ativas com nome do paciente |
| `GET` | `/getConsultaByID/:id` | Retorna consulta por ID com nome do paciente |
| `POST` | `/insertConsulta` | Insere nova consulta vinculada a um paciente |
| `PUT` | `/updateConsulta/:id` | Atualiza consulta existente pelo ID |
| `DELETE` | `/deleteConsulta/:id` | Exclusão lógica (`removido = true`) |

---

## 🐳 Instalação e Execução com Docker (Recomendado)

O projeto está totalmente preparado para rodar via Docker Compose, subindo automaticamente o banco de dados PostgreSQL (com as tabelas criadas e alimentadas) e a API Backend na porta `40000`.

### Passo a Passo:

1. **Subir os containers:**
   ```bash
   docker compose up -d --build
   ```

2. **Verificar os serviços:**
   ```bash
   docker compose ps
   ```
   Os containers `erp_saude_db` e `erp_saude_backend` estarão ativos.

3. **Acessar o backend:**
   Abra no navegador ou faça uma requisição:
   ```bash
   curl http://localhost:40000/
   ```

4. **Para parar os containers:**
   ```bash
   docker compose down
   ```

---

## 💻 Instalação e Execução Local

Caso prefira rodar localmente sem Docker (necessário ter o PostgreSQL instalado):

1. **Instalar as dependências:**
   ```bash
   cd backend_trabalho
   npm install
   ```

2. **Criar e popular o banco de dados:**
   - Crie uma base chamada `erp_saude` no seu PostgreSQL.
   - Execute o script `databaseConfig.sql` nela:
     ```bash
     psql -U postgres -d erp_saude -f databaseConfig.sql
     ```

3. **Configurar as variáveis de ambiente:**
   Crie ou edite o arquivo `.env` dentro de `backend_trabalho/`:
   ```env
   PORT=40000
   SECRET_API=super_secret_jwt_key_dw3_health_erp_2026
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=erp_saude
   DB_PASS=sua_senha
   DB_PORT=5432
   ```

4. **Iniciar o servidor:**
   ```bash
   npm start
   ```
   O servidor iniciará em `http://localhost:40000`.

---

## 🧪 Guia de Testes e Exemplos de Requisições

### Credenciais Padrão de Teste (já inseridas pelo script SQL):
- **Usuário 1:** `qwe` | **Senha:** `qwe`
- **Usuário 2:** `admin` | **Senha:** `admin`

### 1. Realizar Login (`POST /Login`):
```bash
curl -X POST http://localhost:40000/Login \
  -H "Content-Type: application/json" \
  -d '{"username": "qwe", "password": "qwe"}'
```
**Resposta:**
```json
{
  "auth": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "qwe"
}
```

### 2. Listar Pacientes (`GET /getAllPacientes`):
```bash
curl -X GET http://localhost:40000/getAllPacientes \
  -H "Authorization: Bearer <SEU_TOKEN_AQUI>"
```

### 3. Cadastrar Paciente (`POST /insertPaciente`):
```bash
curl -X POST http://localhost:40000/insertPaciente \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU_TOKEN_AQUI>" \
  -d '{
    "nome": "Beatriz Miranda",
    "cpf": "777.888.999-00",
    "telefone": "(17) 99665-4321",
    "data_nascimento": "1994-07-20",
    "removido": false
  }'
```

### 4. Cadastrar Consulta (`POST /insertConsulta`):
```bash
curl -X POST http://localhost:40000/insertConsulta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU_TOKEN_AQUI>" \
  -d '{
    "paciente_id": 1,
    "medico_nome": "Dr. Fernando Dias",
    "data_consulta": "2026-06-15",
    "valor_consulta": 250.00,
    "diagnostico": "Consulta oftalmologica de rotina",
    "removido": false
  }'
```

### 5. Arquivo de Testes Integrados (.rest):
O repositório inclui a suíte completa no arquivo:
- `backend_trabalho/tests_health_erp.rest`
- Arquivos modulares em `apps/login/tests/testLogin.rest`, `apps/pacientes/tests/testPacientes.rest` e `apps/consultas/tests/testConsultas.rest`.

Para executar no VS Code, basta instalar a extensão **REST Client** e clicar em *"Send Request"*.

---

## 🖥️ Integração com o Front-End

Conforme exigido pelo PDF:
- O Front-End deve rodar em porta distinta (ex: `3000` ou `5173`).
- Não pode acessar diretamente o SGBD; todas as operações devem passar pela API (`http://localhost:40000`).
- O Front-End deve armazenar o token recebido no login em `localStorage` ou `cookie` e enviá-lo nas requisições subsequentes no header:
  `Authorization: Bearer <token>`.
- Para rodar o Front-End em container junto com o backend, basta descomentar o serviço `frontend` no `docker-compose.yml`.

