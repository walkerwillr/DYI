// Templates HTML para criação de novos nós - Nova estrutura

// Esta função não é mais necessária pois os nós são criados dinamicamente
// através da função addNodeAndSave no supabase.js
function createEmployeeNodeHTML() {
    // Esta função é mantida para compatibilidade, mas não é mais usada
    // Os nós são agora criados dinamicamente através da integração com Supabase
    return `
        <div class="node-container">
            <div class="node-wrapper">
                <div class="node secondary">Novo Colaborador</div>
                <div class="action-buttons">
                    <span class="goals-icon" title="Definir Metas">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    </span>
                    <button class="action-button edit-button" title="Editar Nome"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                    <button class="action-button add-button" title="Adicionar Colaborador">+</button>
                    <button class="action-button remove-button" title="Remover Colaborador">-</button>
                </div>
            </div>
            <div class="goals-modal"><h3>Metas</h3><textarea placeholder="Descreva as metas aqui..."></textarea></div>
        </div>
    `;
}
