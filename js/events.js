// Event listeners e lógica de interação - Nova estrutura com Supabase

function setupEventListeners() {
    // Event listener principal para cliques no container
    mainContainer.addEventListener('click', function(event) {
        const goalsIcon = event.target.closest('.goals-icon');
        const addButton = event.target.closest('.add-button');
        const removeButton = event.target.closest('.remove-button');
        const editButton = event.target.closest('.edit-button');

        if (goalsIcon) {
            handleGoalsIconClick(goalsIcon);
        } else if (addButton) {
            handleAddButtonClick(addButton);
        } else if (removeButton) {
            handleRemoveButtonClick(removeButton);
        } else if (editButton) {
            handleEditButtonClick(editButton);
        } else if (!event.target.closest('.goals-modal')) {
            closeAllGoalsModals();
        }
    });

    // Event listener para mudanças nas textareas
    mainContainer.addEventListener('input', function(event) {
        if (event.target.tagName.toLowerCase() === 'textarea') {
            handleGoalsTextareaChange(event.target);
        }
    });

    // Event listener para o botão de voltar
    undoButton.addEventListener('click', handleUndoButtonClick);
}

function handleGoalsIconClick(goalsIcon) {
    const parentContainer = goalsIcon.closest('.node-container');
    const modal = parentContainer.querySelector('.goals-modal');
    const node = parentContainer.querySelector('.node');
    const modalTitle = modal.querySelector('h3');
    modalTitle.textContent = 'Metas para ' + node.textContent;
    const isAlreadyOpen = modal.classList.contains('show');
    closeAllGoalsModals();
    if (!isAlreadyOpen) {
        modal.classList.add('show');
    }
}

async function handleAddButtonClick(addButton) {
    try {
        saveState();
        const parentNodeContainer = addButton.closest('.node-container');
        const parentNodeId = parseInt(parentNodeContainer.dataset.nodeId);
        
        // Adicionar novo nó e salvar no Supabase
        await addNodeAndSave('Novo Colaborador', parentNodeId);
        
        updateUndoButtonState();
    } catch (error) {
        console.error('Erro ao adicionar nó:', error);
        alert('Erro ao adicionar colaborador. Tente novamente.');
    }
}

async function handleRemoveButtonClick(removeButton) {
    try {
        const nodeContainerToRemove = removeButton.closest('.node-container');
        const nodeId = parseInt(nodeContainerToRemove.dataset.nodeId);
        
        if (nodeContainerToRemove.dataset.level !== 'top') {
            saveState();
            
            // Remover nó e salvar no Supabase
            await removeNodeAndSave(nodeId);
            
            updateUndoButtonState();
        }
    } catch (error) {
        console.error('Erro ao remover nó:', error);
        alert('Erro ao remover colaborador. Tente novamente.');
    }
}

function handleEditButtonClick(editButton) {
    const nodeWrapper = editButton.closest('.node-wrapper');
    const node = nodeWrapper.querySelector('.node');
    
    node.setAttribute('contenteditable', 'true');
    node.focus();
    
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);

    const disableEditing = async () => {
        node.setAttribute('contenteditable', 'false');
        node.removeEventListener('blur', disableEditing);
        node.removeEventListener('keydown', handleKeydown);
        
        // Salvar alteração no Supabase
        const nodeContainer = node.closest('.node-container');
        const nodeId = parseInt(nodeContainer.dataset.nodeId);
        const newName = node.textContent;
        
        try {
            await updateNodeAndSave(nodeId, { name: newName });
        } catch (error) {
            console.error('Erro ao salvar alteração:', error);
            alert('Erro ao salvar alteração. Tente novamente.');
        }
    };

    const handleKeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            node.blur();
        }
    };

    node.addEventListener('blur', disableEditing);
    node.addEventListener('keydown', handleKeydown);
}

async function handleGoalsTextareaChange(textarea) {
    try {
        const nodeContainer = textarea.closest('.node-container');
        const nodeId = parseInt(nodeContainer.dataset.nodeId);
        const newGoals = textarea.value;
        
        // Salvar alteração no Supabase
        await updateNodeAndSave(nodeId, { goals: newGoals });
    } catch (error) {
        console.error('Erro ao salvar metas:', error);
        alert('Erro ao salvar metas. Tente novamente.');
    }
}

function handleUndoButtonClick() {
    if (history.length > 0) {
        loadState(history.pop());
        updateUndoButtonState();
    }
} 