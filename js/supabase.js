// Funções para interação com o Supabase - Nova estrutura de nós relacionais

// Salvar um nó individual no Supabase
async function saveNodeToSupabase(node) {
    try {
        const nodeData = {
            name: node.name,
            goals: node.goals,
            parent_id: node.parentId
        };

        if (node.id) {
            // Atualizar nó existente
            const { error } = await supabase
                .from('nodes')
                .update(nodeData)
                .eq('id', node.id);
            
            if (error) throw error;
        } else {
            // Criar novo nó
            const { data, error } = await supabase
                .from('nodes')
                .insert(nodeData)
                .select()
                .single();
            
            if (error) throw error;
            
            // Atualizar o ID do nó com o retornado pelo Supabase
            node.id = data.id;
        }
        
        return node;
    } catch (error) {
        console.error('Erro ao salvar nó no Supabase:', error);
        throw error;
    }
}

// Remover um nó do Supabase
async function deleteNodeFromSupabase(nodeId) {
    try {
        const { error } = await supabase
            .from('nodes')
            .delete()
            .eq('id', nodeId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Erro ao remover nó do Supabase:', error);
        throw error;
    }
}

// Carregar todos os nós do Supabase
async function loadNodesFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('nodes')
            .select('*')
            .order('id');

        if (error) throw error;

        if (data && data.length > 0) {
            // Construir a árvore a partir dos dados
            buildTreeFromNodes(data);
            return true;
        } else {
            // Se não há dados, criar estrutura inicial
            await createInitialStructure();
            return true;
        }
    } catch (error) {
        console.error('Erro ao carregar nós do Supabase:', error);
        return false;
    }
}

// Criar estrutura inicial se não existir
async function createInitialStructure() {
    try {
        // Criar nó CEO
        const ceoNode = new Node(null, 'CEO | LEONARDO', '', null);
        await saveNodeToSupabase(ceoNode);
        
        // Criar nó CFO
        const cfoNode = new Node(null, 'CFO | KARINE', '', ceoNode.id);
        await saveNodeToSupabase(cfoNode);
        
        // Criar nó Financeiro
        const financeNode = new Node(null, 'FINANCEIRO | LUCAS', '', cfoNode.id);
        await saveNodeToSupabase(financeNode);
        
        // Reconstruir a árvore
        buildTreeFromNodes(getAllNodesAsArray());
    } catch (error) {
        console.error('Erro ao criar estrutura inicial:', error);
    }
}

// Salvar estado completo do organograma
async function saveOrganogramState() {
    try {
        // Atualizar metas dos nós baseado no HTML atual
        updateNodesFromHTML();
        
        // Salvar todos os nós no Supabase
        const nodesToSave = getAllNodesAsArray();
        for (const node of nodesToSave) {
            await saveNodeToSupabase(node);
        }
        
        console.log('Estado do organograma salvo com sucesso');
    } catch (error) {
        console.error('Erro ao salvar estado do organograma:', error);
    }
}

// Atualizar nós a partir do HTML atual
function updateNodesFromHTML() {
    const nodeContainers = document.querySelectorAll('.node-container[data-node-id]');
    
    nodeContainers.forEach(container => {
        const nodeId = parseInt(container.dataset.nodeId);
        const node = getNodeById(nodeId);
        
        if (node) {
            // Atualizar nome
            const nameElement = container.querySelector('.node');
            if (nameElement) {
                node.name = nameElement.textContent;
            }
            
            // Atualizar metas
            const goalsTextarea = container.querySelector('.goals-modal textarea');
            if (goalsTextarea) {
                node.goals = goalsTextarea.value;
            }
        }
    });
}

// Carregar estado inicial
async function loadInitialState() {
    const success = await loadNodesFromSupabase();
    
    if (success) {
        // Renderizar a árvore
        const html = renderTreeToHTML();
        loadState(html);
    } else {
        // Em caso de erro, carregar estado padrão
        loadState(initialStateHTML);
    }
}

// Função para adicionar novo nó e salvar no Supabase
async function addNodeAndSave(name, parentId = null) {
    try {
        const newNode = addNode(name, parentId);
        await saveNodeToSupabase(newNode);
        
        // Reconstruir a árvore e re-renderizar
        buildTreeFromNodes(getAllNodesAsArray());
        const html = renderTreeToHTML();
        loadState(html);
        
        return newNode;
    } catch (error) {
        console.error('Erro ao adicionar nó:', error);
        throw error;
    }
}

// Função para remover nó e salvar no Supabase
async function removeNodeAndSave(nodeId) {
    try {
        const node = getNodeById(nodeId);
        if (node) {
            // Remover filhos recursivamente do Supabase
            await removeNodeChildrenFromSupabase(node);
            
            // Remover o nó do Supabase
            await deleteNodeFromSupabase(nodeId);
            
            // Remover da estrutura local
            removeNode(nodeId);
            
            // Reconstruir a árvore e re-renderizar
            buildTreeFromNodes(getAllNodesAsArray());
            const html = renderTreeToHTML();
            loadState(html);
        }
    } catch (error) {
        console.error('Erro ao remover nó:', error);
        throw error;
    }
}

// Função auxiliar para remover filhos recursivamente do Supabase
async function removeNodeChildrenFromSupabase(node) {
    for (const child of node.children) {
        await removeNodeChildrenFromSupabase(child);
        await deleteNodeFromSupabase(child.id);
    }
}

// Função para atualizar nó e salvar no Supabase
async function updateNodeAndSave(nodeId, updates) {
    try {
        updateNode(nodeId, updates);
        const node = getNodeById(nodeId);
        
        if (node) {
            await saveNodeToSupabase(node);
        }
    } catch (error) {
        console.error('Erro ao atualizar nó:', error);
        throw error;
    }
}
