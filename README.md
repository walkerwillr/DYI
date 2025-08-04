# Organograma da Empresa DIY

Este projeto é um organograma interativo que permite visualizar e gerenciar a estrutura organizacional de uma empresa.

## Estrutura do Projeto

```
DYI/
├── index.html              # Arquivo HTML principal
├── styles/
│   └── main.css           # Estilos CSS do organograma
├── js/
│   ├── config.js          # Configurações do Supabase
│   ├── data.js            # Dados iniciais do organograma
│   ├── supabase.js        # Funções de salvamento/carregamento
│   ├── history.js         # Controle de histórico e estado
│   ├── templates.js       # Templates HTML para novos nós
│   ├── events.js          # Event listeners e lógica de interação
│   └── main.js            # Arquivo principal da aplicação
└── README.md              # Documentação do projeto
```

## Funcionalidades

- **Visualização do Organograma**: Exibe a estrutura hierárquica da empresa
- **Edição de Nós**: Permite editar nomes e cargos diretamente no organograma
- **Adição de Colaboradores**: Adiciona novos colaboradores na estrutura
- **Remoção de Colaboradores**: Remove colaboradores (exceto o CEO)
- **Definição de Metas**: Modal para definir metas para cada colaborador
- **Histórico de Ações**: Botão "Voltar" para desfazer ações
- **Persistência de Dados**: Salva automaticamente no Supabase

## Tecnologias Utilizadas

- **HTML5**: Estrutura da página
- **CSS3**: Estilização e layout responsivo
- **JavaScript**: Lógica de interação e manipulação do DOM
- **Tailwind CSS**: Framework CSS para estilização
- **Supabase**: Backend para persistência de dados
- **Google Fonts**: Fonte Inter para tipografia

## Como Usar

1. Abra o arquivo `index.html` em um navegador web
2. O organograma será carregado automaticamente
3. Use os botões de ação em cada nó:
   - **Ícone de metas**: Abre modal para definir metas
   - **Botão de edição**: Permite editar o nome/cargo
   - **Botão +**: Adiciona novo colaborador
   - **Botão -**: Remove colaborador (exceto CEO)
4. Use o botão "Voltar" para desfazer ações

## Estrutura dos Arquivos JavaScript

### `config.js`
Contém as configurações do Supabase e inicialização do cliente.

### `data.js`
Define o estado inicial do organograma com todos os colaboradores e suas hierarquias.

### `supabase.js`
Funções para salvar e carregar dados do Supabase:
- `saveOrganogramState()`: Salva o estado atual
- `loadInitialState()`: Carrega o estado salvo

### `history.js`
Controle de histórico e estado da aplicação:
- `saveState()`: Salva estado no histórico
- `loadState()`: Carrega estado do histórico
- `updateUndoButtonState()`: Atualiza estado do botão voltar

### `templates.js`
Templates HTML para criação de novos nós:
- `createEmployeeNodeHTML()`: Template para novo colaborador

### `events.js`
Event listeners e lógica de interação:
- `setupEventListeners()`: Configura todos os event listeners
- Handlers para cada tipo de ação (adicionar, remover, editar, metas)

### `main.js`
Arquivo principal que inicializa a aplicação e coordena todos os módulos.

## Personalização

Para personalizar o organograma:

1. **Dados Iniciais**: Edite o arquivo `js/data.js` para modificar a estrutura inicial
2. **Estilos**: Modifique `styles/main.css` para alterar a aparência
3. **Funcionalidades**: Adicione novas funcionalidades nos arquivos JavaScript apropriados

## Configuração do Supabase

O projeto usa Supabase para persistência de dados. Para configurar:

1. Crie uma conta no Supabase
2. Crie uma tabela `organograma` com colunas:
   - `id` (int, primary key)
   - `html_content` (text)
3. Atualize as credenciais em `js/config.js` 