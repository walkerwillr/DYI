// Funções para controle de histórico e estado

const history = [];

function updateUndoButtonState() {
    undoButton.disabled = history.length === 0;
}

function saveState() {
    history.push(orgChart.innerHTML);
    updateUndoButtonState();
}

function loadState(state) {
    orgChart.innerHTML = state;
}

function closeAllGoalsModals() {
    document.querySelectorAll('.goals-modal.show').forEach(openModal => {
        openModal.classList.remove('show');
    });
} 