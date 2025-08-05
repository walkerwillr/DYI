-- Script para criar a tabela nodes no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela nodes
CREATE TABLE IF NOT EXISTS nodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goals TEXT DEFAULT '',
    parent_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_nodes_created_at ON nodes(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações (para desenvolvimento)
-- Em produção, você deve criar políticas mais restritivas
CREATE POLICY "Allow all operations" ON nodes
    FOR ALL USING (true)
    WITH CHECK (true);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_nodes_updated_at 
    BEFORE UPDATE ON nodes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários sobre a estrutura
COMMENT ON TABLE nodes IS 'Tabela para armazenar os nós do organograma';
COMMENT ON COLUMN nodes.id IS 'ID único do nó';
COMMENT ON COLUMN nodes.name IS 'Nome do colaborador/cargo';
COMMENT ON COLUMN nodes.goals IS 'Metas do colaborador';
COMMENT ON COLUMN nodes.parent_id IS 'ID do nó pai (NULL para nós raiz)';
COMMENT ON COLUMN nodes.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN nodes.updated_at IS 'Data da última atualização'; 