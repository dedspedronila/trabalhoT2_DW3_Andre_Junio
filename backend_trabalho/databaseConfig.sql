-- Habilita a extensao pgcrypto para uso de funcoes de hash/criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========================================================
-- Tabela de Autenticacao: usuarios
-- ========================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id bigserial CONSTRAINT pk_usuarios PRIMARY KEY,
    username varchar(20) UNIQUE NOT NULL,
    password text NOT NULL,
    removido boolean DEFAULT false
);

-- Insere usuarios padrao de teste (senhas criptografadas com blowfish / bcrypt)
INSERT INTO usuarios (username, password, removido) VALUES
    ('admin', crypt('admin', gen_salt('bf')), false),
    ('qwe', crypt('qwe', gen_salt('bf')), false)
ON CONFLICT (username) DO NOTHING;

-- ========================================================
-- Tabela 1 do Modulo de Saude ERP: pacientes
-- Relacionamento 1:N com consultas
-- Possui campos ID, Removido, texto (nome, cpf, telefone) e data (data_nascimento)
-- ========================================================
CREATE TABLE IF NOT EXISTS pacientes (
    id bigserial CONSTRAINT pk_pacientes PRIMARY KEY,
    nome varchar(100) NOT NULL,
    cpf varchar(14) UNIQUE NOT NULL,
    telefone varchar(20),
    data_nascimento date,
    removido boolean DEFAULT false
);

-- Registros de exemplo para pacientes
INSERT INTO pacientes (nome, cpf, telefone, data_nascimento, removido) VALUES
    ('Carlos Eduardo Silva', '111.222.333-44', '(17) 99111-2233', '1985-04-12', false),
    ('Mariana Souza Santos', '222.333.444-55', '(17) 99222-3344', '1992-08-25', false),
    ('João Pedro Oliveira', '333.444.555-66', '(17) 99333-4455', '2001-11-03', false)
ON CONFLICT (cpf) DO NOTHING;

-- ========================================================
-- Tabela 2 do Modulo de Saude ERP: consultas
-- Relacionamento 1:N (um paciente tem varias consultas)
-- Possui campos ID, Removido, texto (medico_nome, diagnostico), decimal (valor_consulta) e data (data_consulta)
-- ========================================================
CREATE TABLE IF NOT EXISTS consultas (
    id bigserial CONSTRAINT pk_consultas PRIMARY KEY,
    paciente_id bigint NOT NULL CONSTRAINT fk_consultas_paciente REFERENCES pacientes(id),
    medico_nome varchar(100) NOT NULL,
    data_consulta date NOT NULL,
    valor_consulta numeric(10,2) NOT NULL DEFAULT 0.00,
    diagnostico text,
    removido boolean DEFAULT false
);

-- Registros de exemplo para consultas
INSERT INTO consultas (paciente_id, medico_nome, data_consulta, valor_consulta, diagnostico, removido) VALUES
    ((SELECT id FROM pacientes WHERE cpf = '111.222.333-44'), 'Dra. Beatriz Costa', '2026-03-10', 250.00, 'Consulta de rotina cardiologica e exames preventivos', false),
    ((SELECT id FROM pacientes WHERE cpf = '111.222.333-44'), 'Dr. Fernando Dias', '2026-03-15', 180.50, 'Retorno pos-tratamento com melhora expressiva', false),
    ((SELECT id FROM pacientes WHERE cpf = '222.333.444-55'), 'Dra. Beatriz Costa', '2026-03-20', 300.00, 'Avaliacao dermatologica e prescricao de pomada', false)
ON CONFLICT DO NOTHING;
