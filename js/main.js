// Arquivo principal da aplicação

let mainContainer = document.querySelector('.main-container');
let orgChart = document.querySelector('.org-chart');
let undoButton = document.getElementById('undo-button');

document.addEventListener('DOMContentLoaded', async function () {
  // Inicialização dos elementos principais

  // Configuração dos event listeners
  setupEventListeners();

  // Carregar o estado inicial e configurar o botão de voltar
  await loadInitialState();
  updateUndoButtonState();
});
