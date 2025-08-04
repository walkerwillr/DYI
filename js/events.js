// Event listeners e lógica de interação

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
            saveOrganogramState();
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

function handleAddButtonClick(addButton) {
    saveState();
    const parentNodeContainer = addButton.closest('.node-container');
    let childNodeGroup = parentNodeContainer.querySelector('.node-group');
    if (!childNodeGroup) {
        childNodeGroup = document.createElement('div');
        childNodeGroup.className = 'node-group';
        parentNodeContainer.appendChild(childNodeGroup);
    }
    const newEmployeeHTML = createEmployeeNodeHTML();
    childNodeGroup.insertAdjacentHTML('beforeend', newEmployeeHTML);
    saveOrganogramState();
}

function handleRemoveButtonClick(removeButton) {
    const nodeContainerToRemove = removeButton.closest('.node-container');
    if (nodeContainerToRemove.dataset.level !== 'top') {
        saveState();
        const parentGroup = nodeContainerToRemove.parentElement;
        nodeContainerToRemove.remove();
        if (parentGroup && parentGroup.classList.contains('node-group') && !parentGroup.hasChildNodes()) {
            parentGroup.remove();
        }
        saveOrganogramState();
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

    const disableEditing = () => {
        node.setAttribute('contenteditable', 'false');
        node.removeEventListener('blur', disableEditing);
        node.removeEventListener('keydown', handleKeydown);
        saveOrganogramState(); // Salva após a edição
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

function handleUndoButtonClick() {
    if (history.length > 0) {
        loadState(history.pop());
        saveOrganogramState(); // Salva o estado revertido
        updateUndoButtonState();
    }
} 