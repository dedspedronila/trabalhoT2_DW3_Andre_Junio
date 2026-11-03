# ERP Saúde - Servidor Back-End (Desenvolvimento Web III)

Projeto prático desenvolvido para o 2º Trabalho da disciplina **Desenvolvimento Web III (DW3)** do curso de Bacharelado em Sistemas de Informação - IFSP Campus Votuporanga (Prof. Dr. Evandro Jardini).

O projeto implementa as APIs RESTful do módulo de **Saúde** de um sistema ERP, seguindo **100% à risca** os padrões apresentados em sala de aula, na apostila da disciplina (`apostDW3idx.pdf`) e no repositório de referência ([github.com/eajardini/dw3](https://github.com/eajardini/dw3)).

---

## 📋 Sumário
- [Estudo de Caso e Modelagem](#-estudo-de-caso-e-modelagem)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Lista de APIs Desenvolvidas](#-lista-de-apis-desenvolvidas)
- [Execução com Docker (Padrão Oficial da Apostila - Seção 4.3)](#-execução-com-docker-padrão-oficial-da-apostila---seção-43)
- [Execução Local sem Docker](#-execução-local-sem-docker)
- [Testes das APIs com REST Client](#-testes-das-apis-com-rest-client)
- [Integração com o Servidor Front-End](#-integração-com-o-servidor-front-end)

---

## 🏥 Estudo de Caso e Modelagem

Foram implementadas duas tabelas com relacionamento **1:N** do módulo hospitalar/saúde: **`pacientes`** e **`consultas`**, além da tabela de autenticação **`usuarios`**.

### Requisitos do PDF Atendidos:
- **Campos Obrigatórios:** Ambas as tabelas possuem os campos `id` e `removido` (para soft delete).
- **Tipos de Dados no Conjunto:**
  - **Texto:** `nome`, `cpf`, `telefone`, `medico_nome`, `diagnostico`
  - **Decimal:** `valor_consulta` (`NUMERIC(10,2)`)
  - **Data:** `data_nascimento` (`DATE`) e `data_consulta` (`DATE`)
- **Autenticação:** Tabela `usuarios` com senhas criptografadas usando extensão `pgcrypto` (`bcrypt`).

### Esquema do Banco de Dados (`databaseConfig.sql`):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabela de Pacientes (1)
CREATE TABLE IF NOT EXISTS pacientes (
    id bigserial CONSTRAINT pk_pacientes PRIMARY KEY,
    nome varchar(100) NOT NULL,
    cpf varchar(14) UNIQUE NOT NULL,
    telefone varchar(20),
    data_nascimento date,
    removido boolean DEFAULT false
);

-- 2. Tabela de Consultas (N - Relacionada a Pacientes)
CREATE TABLE IF NOT EXISTS consultas (
    id bigserial CONSTRAINT pk_consultas PRIMARY KEY,
    paciente_id bigint NOT NULL CONSTRAINT fk_consultas_paciente REFERENCES pacientes(id),
    medico_nome varchar(100) NOT NULL,
    data_consulta date NOT NULL,
    valor_consulta numeric(10,2) NOT NULL DEFAULT 0.00,
    diagnostico text,
    removido boolean DEFAULT false
);

-- 3. Tabela de Usuários (Autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
    id bigserial CONSTRAINT pk_usuarios PRIMARY KEY,
    username varchar(20) UNIQUE NOT NULL,
    password text NOT NULL,
    removido boolean DEFAULT false
);
```

---

## 📁 Estrutura do Projeto

Estrutura idêntica à apresentada em sala de aula:

```
trabalhoT2_DW3_Andre_Junio/
├── .gitignore
├── DW3_Trab02.pdf
├── apostDW3idx.pdf
├── README.md
└── backend_trabalho/
    ├── app.js                          # Servidor Express (porta 40000, CORS)
    ├── package.json                    # Dependências do Node.js
    ├── package-lock.json               # Versões exatas das dependências
    ├── Dockerfile                      # Listing 4.1 da apostila
    ├── .dockerignore                   # Seção 4.3.1 da apostila
    ├── .env                            # Variáveis de ambiente
    ├── .env.example                    # Modelo de variáveis de ambiente
    ├── databaseConfig.sql              # Script SQL com DDL e seeds
    ├── database/
    │   └── databaseconfig.js           # Pool de conexão PostgreSQL
    ├── routes/
    │   └── router.js                   # Rotas protegidas com AutenticaJWT
    └── apps/
        ├── login/
        │   ├── controller/ctlLogin.js  # Emissão e validação de JWT
        │   ├── model/mdlLogin.js
        │   └── tests/testLogin.rest    # Testes de autenticação
        ├── pacientes/
        │   ├── controller/ctlPacientes.js
        │   ├── model/mdlPacientes.js   # Erros no formato [mdlPacientes|Método]
        │   └── tests/testPacientes.rest# Testes do CRUD de pacientes
        └── consultas/
            ├── controller/ctlConsultas.js
            ├── model/mdlConsultas.js   # Erros no formato [mdlConsultas|Método]
            └── tests/testConsultas.rest# Testes do CRUD de consultas
```

---

## 🔌 Lista de APIs Desenvolvidas

Todas as rotas de CRUD exigem o cabeçalho `Authorization: Bearer <TOKEN_JWT>`.

### 1. Autenticação (Pública)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/Login` | Autentica (`username`, `password`) e retorna o JWT |
| `POST` | `/Logout` | Invalida a sessão do cliente |
| `GET`  | `/` | Informações de status da API |

### 2. Módulo de Pacientes
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/getAllPacientes` | Retorna todos os pacientes ativos (`removido = false`) |
| `GET` | `/getPacienteByID/:id` | Retorna paciente por ID (`removido = false`) |
| `POST` | `/insertPaciente` | Insere novo paciente |
| `PUT` | `/updatePaciente/:id` | Atualiza paciente por ID |
| `DELETE` | `/deletePaciente/:id` | Soft delete do paciente (`removido = true`) |
| `GET` | `/getPacientesToConsultas` | Retorna `id`, `nome` e `cpf` para preencher o select no front |

### 3. Módulo de Consultas
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/getAllConsultas` | Retorna consultas ativas (`removido = false`) com nome do paciente |
| `GET` | `/getConsultaByID/:id` | Retorna consulta por ID com nome do paciente |
| `POST` | `/insertConsulta` | Insere nova consulta associada ao paciente |
| `PUT` | `/updateConsulta/:id` | Atualiza consulta por ID |
| `DELETE` | `/deleteConsulta/:id` | Soft delete da consulta (`removido = true`) |

---

## 🐳 Execução com Docker (Padrão Oficial da Apostila - Seção 4.3)

Seguindo estritamente as seções **4.3.2**, **4.3.3** e **4.3.4** da apostila `apostDW3idx.pdf`:

### 1. Criar a Imagem do Servidor BackEnd (Seção 4.3.3)
No diretório `backend_trabalho/`, execute:
```bash
docker build -t dw3backend_img:1.0 .
```

Confirme a criação da imagem com:
```bash
docker images
```

### 2. Executar a Imagem do BackEnd (Seção 4.3.4)

#### Situação A: Se o PostgreSQL estiver rodando na máquina hospedeira (Local/Host)
1. No arquivo `.env`, altere o `DB_HOST` para:
   ```env
   DB_HOST=host.docker.internal
   ```
2. Execute o contêiner adicionando a regra de rede:
   ```bash
   docker run -d \
     --name dw3backend_ctner \
     --add-host host.docker.internal:host-gateway \
     --env-file .env \
     -p 40000:40000 \
     --restart unless-stopped \
     dw3backend_img:1.0
   ```

#### Situação B: Se o PostgreSQL estiver rodando em contêiner Docker
Execute o contêiner diretamente:
```bash
docker run -d \
  --name dw3backend_ctner \
  --env-file .env \
  -p 40000:40000 \
  --restart unless-stopped \
  dw3backend_img:1.0
```

### 3. Comandos de Gerenciamento do Contêiner (Seção 4.3.4)
- **Visualizar contêiner em execução:**
  ```bash
  docker ps
  ```
- **Visualizar mensagens e logs da aplicação:**
  ```bash
  docker logs dw3backend_ctner
  ```
- **Interromper o contêiner:**
  ```bash
  docker stop dw3backend_ctner
  ```
- **Reiniciar o contêiner:**
  ```bash
  docker start dw3backend_ctner
  ```
- **Remover o contêiner:**
  ```bash
  docker stop dw3backend_ctner
  docker rm dw3backend_ctner
  ```

---

## 💻 Execução Local sem Docker

Caso deseje rodar a aplicação diretamente no Node.js local:

1. Acesse o diretório:
   ```bash
   cd backend_trabalho
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicialize o banco PostgreSQL com o script:
   ```bash
   psql -U postgres -d erp_saude -f databaseConfig.sql
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```
   A aplicação responderá na porta `40000`.

---

## 🧪 Testes das APIs com REST Client

Os testes de cada módulo encontram-se organizados em suas respectivas pastas `tests/`:

1. **[testLogin.rest](file:///home/deds/C0d1ng/trabalhoT2_DW3_Andre_Junio/backend_trabalho/apps/login/tests/testLogin.rest):**
   - Teste de login com credencial correta (`qwe` / `qwe` ou `admin` / `admin`).
   - Teste de login com senha inválida.
   - Teste de logout.

2. **[testPacientes.rest](file:///home/deds/C0d1ng/trabalhoT2_DW3_Andre_Junio/backend_trabalho/apps/pacientes/tests/testPacientes.rest):**
   - Login e captura automática do token JWT.
   - `POST /insertPaciente` (Inserir paciente).
   - `GET /getAllPacientes` (Listar todos com `removido = false`).
   - `GET /getPacienteByID/1` (Buscar por ID).
   - `PUT /updatePaciente/1` (Atualizar).
   - `GET /getPacientesToConsultas` (Lista para select).
   - `DELETE /deletePaciente/1` (Soft delete).

3. **[testConsultas.rest](file:///home/deds/C0d1ng/trabalhoT2_DW3_Andre_Junio/backend_trabalho/apps/consultas/tests/testConsultas.rest):**
   - Login e captura automática do token JWT.
   - `POST /insertConsulta` (Inserir consulta vinculada a um paciente).
   - `GET /getAllConsultas` (Listar consultas ativas com nome do paciente).
   - `GET /getConsultaByID/1` (Buscar por ID).
   - `PUT /updateConsulta/1` (Atualizar consulta).
   - `DELETE /deleteConsulta/1` (Soft delete).

---

## 🖥️ Integração com o Servidor Front-End

Conforme a Seção 4.3.5 da apostila:
- O servidor Front-End roda em sua própria porta (porta **`40100`**).
- O Front-End nunca acessa o SGBD diretamente; todas as operações são realizadas consumindo a API na porta `40000`.
- O token JWT recebido no login deve ser armazenado em `localStorage` ou `cookie` e enviado nas requisições protegidas no formato:
  `Authorization: Bearer <token>`.
