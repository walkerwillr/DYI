// Arquivo principal da aplicação - Nova estrutura com Supabase

let mainContainer = document.querySelector('.main-container');
let orgChart = document.querySelector('.chart-wrapper'); // <-- Apenas mude a classe aqui
let undoButton = document.getElementById('undo-button');

document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Configuração dos event listeners
        setupEventListeners();

        // Carregar dados do Supabase e renderizar
        await loadInitialState();
        updateUndoButtonState();
        
        console.log('Aplicação inicializada com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        // Em caso de erro, carregar estado padrão
        loadState(initialStateHTML);
    }
});
