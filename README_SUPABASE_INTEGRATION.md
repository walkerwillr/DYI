# Integração com Supabase - Organograma Dinâmico

## Visão Geral

Esta integração transforma o organograma de uma estrutura HTML estática para um sistema dinâmico baseado em banco de dados, onde cada nó é uma entidade separada no Supabase com relacionamentos pai-filho.

## Estrutura da Nova Implementação

### 1. Estrutura de Dados
- **Classe Node**: Representa cada nó do organograma
  - `id`: Identificador único
  - `name`: Nome do colaborador/cargo
  - `goals`: Metas do colaborador
  - `parentId`: ID do nó pai (null para nós raiz)
  - `children`: Array de nós filhos

### 2. Arquivos Modificados

#### `js/data.js`
- Nova estrutura de dados com classe `Node`
- Funções para construir árvore a partir de dados relacionais
- Funções para renderizar HTML dinamicamente
- Gerenciamento de estado global com Map e arrays

#### `js/supabase.js`
- **CRUD completo** para nós individuais
- **Sincronização automática** com o backend
- **Operações em lote** para salvar estado completo
- **Tratamento de erros** robusto

#### `js/events.js`
- **Event handlers assíncronos** para operações do Supabase
- **Feedback visual** para o usuário
- **Validação** de operações

#### `js/main.js`
- **Inicialização assíncrona** com tratamento de erros
- **Fallback** para estado padrão em caso de erro

## Configuração do Supabase

### 1. Criar a Tabela
Execute o script `supabase_setup.sql` no SQL Editor do Supabase:

```sql
-- Criar tabela nodes
CREATE TABLE IF NOT EXISTS nodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goals TEXT DEFAULT '',
    parent_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

-- Política para desenvolvimento (permitir todas as operações)
CREATE POLICY "Allow all operations" ON nodes
    FOR ALL USING (true)
    WITH CHECK (true);
```

## Fluxo de Funcionamento

### 1. Carregamento Inicial
```
1. loadInitialState() → loadNodesFromSupabase()
2. Busca todos os nós do Supabase
3. buildTreeFromNodes() → Constrói árvore em memória
4. renderTreeToHTML() → Gera HTML dinâmico
5. loadState() → Renderiza na tela
```

### 2. Adicionar Nó
```
1. Usuário clica em "+"
2. handleAddButtonClick() → addNodeAndSave()
3. Cria nó local → saveNodeToSupabase()
4. Supabase retorna ID → Atualiza nó local
5. Reconstruir árvore → Re-renderizar HTML
```

### 3. Editar Nó
```
1. Usuário edita nome/metas
2. handleEditButtonClick() / handleGoalsTextareaChange()
3. updateNodeAndSave() → saveNodeToSupabase()
4. Atualização imediata no Supabase
```

### 4. Remover Nó
```
1. Usuário clica em "-"
2. handleRemoveButtonClick() → removeNodeAndSave()
3. removeNodeChildrenFromSupabase() → Remove filhos recursivamente
4. deleteNodeFromSupabase() → Remove nó pai
5. Reconstruir árvore → Re-renderizar HTML
```

## Vantagens da Nova Implementação

### 1. **Sincronização Real-time**
- Todas as alterações são salvas imediatamente no Supabase
- Dados persistentes entre sessões
- Possibilidade de sincronização multi-usuário

### 2. **Estrutura Relacional**
- Cada nó é uma entidade independente
- Relacionamentos pai-filho bem definidos
- Facilita consultas e análises

### 3. **Escalabilidade**
- Suporte a organogramas complexos
- Performance otimizada com índices
- Estrutura preparada para funcionalidades futuras

### 4. **Manutenibilidade**
- Código modular e bem estruturado
- Separação clara de responsabilidades
- Tratamento robusto de erros

## Funcionalidades Implementadas

### ✅ **CRUD Completo**
- **Create**: Adicionar novos nós
- **Read**: Carregar organograma do Supabase
- **Update**: Editar nomes e metas
- **Delete**: Remover nós e filhos

### ✅ **Sincronização Automática**
- Salva automaticamente ao editar
- Carrega dados ao inicializar
- Tratamento de erros de conexão

### ✅ **Interface Responsiva**
- Feedback visual para operações
- Alertas de erro para o usuário
- Estados de loading implícitos

### ✅ **Integridade de Dados**
- Cascade delete para filhos
- Validação de relacionamentos
- Timestamps automáticos

## Como Usar

### 1. **Configuração Inicial**
```bash
# 1. Execute o script SQL no Supabase
# 2. Verifique as configurações em js/config.js
# 3. Abra index.html no navegador
```

### 2. **Operações Básicas**
- **Adicionar**: Clique no "+" ao lado de qualquer nó
- **Editar**: Clique no ícone de edição ou digite diretamente
- **Metas**: Clique no ícone de metas para definir objetivos
- **Remover**: Clique no "-" (exceto nós raiz)

### 3. **Sincronização**
- Todas as alterações são salvas automaticamente
- Recarregue a página para ver dados persistentes
- Dados são mantidos entre sessões

## Estrutura de Dados no Supabase

### Tabela `nodes`
```sql
id: SERIAL PRIMARY KEY
name: VARCHAR(255) NOT NULL
goals: TEXT DEFAULT ''
parent_id: INTEGER REFERENCES nodes(id)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Exemplo de Dados
```sql
INSERT INTO nodes (name, goals, parent_id) VALUES
('CEO | LEONARDO', 'Liderar empresa', NULL),
('CFO | KARINE', 'Gestão financeira', 1),
('FINANCEIRO | LUCAS', 'Contabilidade', 2);
```

## Próximos Passos

### 🔮 **Funcionalidades Futuras**
- Sincronização real-time com WebSockets
- Histórico de alterações
- Backup e restauração
- Exportação para PDF/Excel
- Permissões por usuário
- Comentários e anotações

### 🔧 **Melhorias Técnicas**
- Cache local para performance
- Otimização de queries
- Compressão de dados
- Logs de auditoria

## Troubleshooting

### Erro de Conexão
- Verifique as credenciais do Supabase
- Confirme se a tabela foi criada
- Teste a conectividade de rede

### Dados Não Carregam
- Verifique as políticas RLS
- Confirme se há dados na tabela
- Verifique o console para erros

### Operações Falham
- Verifique permissões da API key
- Confirme estrutura da tabela
- Teste operações individuais

## Contribuição

Para contribuir com melhorias:
1. Teste todas as operações CRUD
2. Verifique integridade dos dados
3. Teste cenários de erro
4. Documente novas funcionalidades 