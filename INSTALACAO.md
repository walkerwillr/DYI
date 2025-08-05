# Instalação e Configuração - Integração Supabase

## Passo a Passo para Configurar

### 1. Configurar o Supabase

#### 1.1 Acessar o Supabase
1. Vá para [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Crie um novo projeto ou use um existente

#### 1.2 Executar o Script SQL
1. No painel do Supabase, vá para **SQL Editor**
2. Copie e cole o conteúdo do arquivo `supabase_setup.sql`
3. Clique em **Run** para executar o script

#### 1.3 Verificar a Tabela
1. Vá para **Table Editor**
2. Confirme que a tabela `nodes` foi criada
3. Verifique se as colunas estão corretas:
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR)
   - `goals` (TEXT)
   - `parent_id` (INTEGER)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### 2. Configurar as Credenciais

#### 2.1 Obter URL e API Key
1. No painel do Supabase, vá para **Settings** → **API**
2. Copie a **Project URL**
3. Copie a **anon public** API key

#### 2.2 Atualizar o arquivo config.js
1. Abra o arquivo `js/config.js`
2. Substitua as credenciais pelas suas:
```javascript
const SUPABASE_URL = 'sua_url_do_supabase';
const SUPABASE_KEY = 'sua_api_key_do_supabase';
```

### 3. Testar a Integração

#### 3.1 Usar o Arquivo de Teste
1. Abra o arquivo `test_integration.html` no navegador
2. Verifique se a conexão está funcionando
3. Execute os testes de CRUD
4. Teste a construção da árvore

#### 3.2 Verificar no Console
1. Abra o DevTools (F12)
2. Vá para a aba **Console**
3. Verifique se não há erros
4. Confirme as mensagens de sucesso

### 4. Usar a Aplicação Principal

#### 4.1 Abrir a Aplicação
1. Abra o arquivo `index.html` no navegador
2. Aguarde o carregamento dos dados
3. Verifique se o organograma aparece

#### 4.2 Testar Funcionalidades
1. **Adicionar nó**: Clique no "+" ao lado de qualquer nó
2. **Editar nome**: Clique no ícone de edição
3. **Definir metas**: Clique no ícone de metas
4. **Remover nó**: Clique no "-" (exceto nós raiz)

### 5. Verificar Persistência

#### 5.1 Testar Salvamento
1. Faça algumas alterações no organograma
2. Recarregue a página (F5)
3. Verifique se as alterações foram mantidas

#### 5.2 Verificar no Supabase
1. Vá para **Table Editor** no Supabase
2. Selecione a tabela `nodes`
3. Verifique se os dados estão sendo salvos

## Solução de Problemas

### Erro de Conexão
```
❌ Erro de conexão: [error_message]
```

**Soluções:**
1. Verifique se a URL e API key estão corretas
2. Confirme se a tabela `nodes` foi criada
3. Verifique se as políticas RLS estão configuradas

### Dados Não Carregam
```
❌ Erro ao carregar nós do Supabase
```

**Soluções:**
1. Verifique as políticas RLS no Supabase
2. Confirme se há dados na tabela
3. Teste a conexão com o arquivo de teste

### Operações Falham
```
❌ Erro ao [criar/atualizar/deletar] nó
```

**Soluções:**
1. Verifique as permissões da API key
2. Confirme a estrutura da tabela
3. Teste operações individuais

## Estrutura de Arquivos

```
DYI/
├── index.html                 # Aplicação principal
├── test_integration.html      # Arquivo de teste
├── supabase_setup.sql        # Script SQL para Supabase
├── README_SUPABASE_INTEGRATION.md  # Documentação completa
├── INSTALACAO.md             # Este arquivo
└── js/
    ├── config.js             # Configurações do Supabase
    ├── data.js               # Estrutura de dados
    ├── supabase.js           # Funções de integração
    ├── events.js             # Event handlers
    ├── main.js               # Arquivo principal
    ├── history.js            # Controle de histórico
    └── templates.js          # Templates HTML
```

## Verificação Final

### ✅ Checklist de Instalação
- [ ] Script SQL executado no Supabase
- [ ] Tabela `nodes` criada
- [ ] Credenciais atualizadas em `config.js`
- [ ] Teste de conexão bem-sucedido
- [ ] Operações CRUD funcionando
- [ ] Aplicação principal carregando dados
- [ ] Alterações sendo salvas automaticamente
- [ ] Dados persistentes entre sessões

### 🔧 Próximos Passos
1. Personalizar o organograma inicial
2. Configurar permissões específicas
3. Implementar funcionalidades avançadas
4. Otimizar performance se necessário

## Suporte

Se encontrar problemas:
1. Verifique o console do navegador
2. Teste com o arquivo `test_integration.html`
3. Confirme as configurações do Supabase
4. Consulte a documentação completa em `README_SUPABASE_INTEGRATION.md` 