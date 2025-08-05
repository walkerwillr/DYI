// Estrutura de dados para nós do organograma
class Node {
    constructor(id, name, goals = '', parentId = null) {
        this.id = id;
        this.name = name;
        this.goals = goals;
        this.parentId = parentId;
        this.children = [];
    }
}

// Estado global da aplicação
let nodes = new Map(); // Map para armazenar todos os nós por ID
let rootNodes = []; // Array dos nós raiz (sem pai)

// Função para construir a árvore a partir dos dados do Supabase
function buildTreeFromNodes(nodesData) {
    nodes.clear();
    rootNodes = [];
    
    // Primeiro, criar todos os nós
    nodesData.forEach(nodeData => {
        const node = new Node(
            nodeData.id,
            nodeData.name,
            nodeData.goals || '',
            nodeData.parent_id
        );
        nodes.set(node.id, node);
    });
    
    // Depois, estabelecer as relações pai-filho
    nodes.forEach(node => {
        if (node.parentId === null) {
            rootNodes.push(node);
        } else {
            const parent = nodes.get(node.parentId);
            if (parent) {
                parent.children.push(node);
            }
        }
    });
}

// Função para converter a árvore em HTML
function renderTreeToHTML() {
    let html = '<div class="node-container">';
    html += '<div class="node-group" style="padding-top: 0;">';
    
    rootNodes.forEach(node => {
        html += renderNodeToHTML(node);
    });
    
    html += '</div></div>';
    return html;
}

// Função recursiva para renderizar um nó e seus filhos
function renderNodeToHTML(node, level = 'top') {
    let html = `<div class="node-container" data-node-id="${node.id}" data-level="${level}">`;
    html += '<div class="node-wrapper">';
    html += `<div class="node">${escapeHtml(node.name)}</div>`;
    html += '<div class="action-buttons">';
    html += '<span class="goals-icon" title="Definir Metas"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></span>';
    html += '<button class="action-button edit-button" title="Editar Nome"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>';
    html += '<button class="action-button add-button" title="Adicionar Colaborador">+</button>';
    if (level !== 'top') {
        html += '<button class="action-button remove-button" title="Remover Colaborador">-</button>';
    }
    html += '</div></div>';
    
    html += `<div class="goals-modal"><h3>Metas</h3><textarea placeholder="Descreva as metas aqui...">${escapeHtml(node.goals)}</textarea></div>`;
    
    if (node.children.length > 0) {
        html += '<div class="node-group">';
        node.children.forEach(child => {
            html += renderNodeToHTML(child, 'child');
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// Função para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para obter um nó por ID
function getNodeById(id) {
    return nodes.get(id);
}

// Função para adicionar um novo nó
function addNode(name, parentId = null) {
    const newNode = new Node(null, name, '', parentId);
    return newNode;
}

// Função para remover um nó
function removeNode(id) {
    const node = nodes.get(id);
    if (node) {
        // Remover todos os filhos recursivamente
        removeNodeChildren(node);
        // Remover o nó do mapa
        nodes.delete(id);
        // Remover da lista de nós raiz se for um nó raiz
        const rootIndex = rootNodes.indexOf(node);
        if (rootIndex > -1) {
            rootNodes.splice(rootIndex, 1);
        }
    }
}

// Função auxiliar para remover filhos recursivamente
function removeNodeChildren(node) {
    node.children.forEach(child => {
        removeNodeChildren(child);
        nodes.delete(child.id);
    });
}

// Função para atualizar um nó
function updateNode(id, updates) {
    const node = nodes.get(id);
    if (node) {
        Object.assign(node, updates);
    }
}

// Função para obter todos os nós como array plano
function getAllNodesAsArray() {
    return Array.from(nodes.values());
}

// Estado inicial HTML para fallback (mantido para compatibilidade)
const initialStateHTML = `
    <div class="node-container">
        <div class="node-group" style="padding-top: 0;">
            <div class="node-container" data-level="top">
                <div class="node-wrapper">
                    <div class="node">CEO | LEONARDO</div>
                    <div class="action-buttons">
                        <span class="goals-icon" title="Definir Metas"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></span>
                        <button class="action-button edit-button" title="Editar Nome"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                        <button class="action-button add-button" title="Adicionar Colaborador">+</button>
                    </div>
                </div>
                <div class="goals-modal"><h3>Metas</h3><textarea placeholder="Descreva as metas aqui..."></textarea></div>
                <div class="node-group">
                    <div class="node-container">
                        <div class="node-wrapper">
                            <div class="node">CFO | KARINE</div>
                            <div class="action-buttons">
                                <span class="goals-icon" title="Definir Metas"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></span>
                                <button class="action-button edit-button" title="Editar Nome"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                                <button class="action-button add-button" title="Adicionar Colaborador">+</button>
                                <button class="action-button remove-button" title="Remover Colaborador">-</button>
                            </div>
                        </div>
                        <div class="goals-modal"><h3>Metas</h3><textarea placeholder="Descreva as metas aqui..."></textarea></div>
                        <div class="node-group">
                            <div class="node-container">
                                <div class="node-wrapper">
                                    <div class="node secondary">FINANCEIRO | LUCAS</div>
                                    <div class="action-buttons">
                                        <span class="goals-icon" title="Definir Metas"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></span>
                                        <button class="action-button edit-button" title="Editar Nome"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                                        <button class="action-button add-button" title="Adicionar Colaborador">+</button>
                                        <button class="action-button remove-button" title="Remover Colaborador">-</button>
                                    </div>
                                </div>
                                <div class="goals-modal"><h3>Metas</h3><textarea placeholder="Descreva as metas aqui..."></textarea></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
