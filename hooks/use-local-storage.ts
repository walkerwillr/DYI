import { useState, useEffect } from 'react'

interface NodeData {
  id: number
  name: string
  goals: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

export function useLocalStorage() {
  const [localNodes, setLocalNodes] = useState<NodeData[]>([])
  const [nextId, setNextId] = useState(1)

  useEffect(() => {
    // Carregar dados do localStorage na inicialização
    const saved = localStorage.getItem('flowchart-nodes')
    const savedNextId = localStorage.getItem('flowchart-next-id')
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setLocalNodes(parsed)
      } catch (error) {
        console.error('Error parsing saved nodes:', error)
      }
    }
    
    if (savedNextId) {
      setNextId(parseInt(savedNextId, 10))
    }
  }, [])

  const saveToStorage = (nodes: NodeData[], newNextId?: number) => {
    localStorage.setItem('flowchart-nodes', JSON.stringify(nodes))
    if (newNextId) {
      localStorage.setItem('flowchart-next-id', newNextId.toString())
      setNextId(newNextId)
    }
    setLocalNodes(nodes)
  }

  const addNode = (name: string, parentId: number | null = null, goals: string = '') => {
    const newNode: NodeData = {
      id: nextId,
      name,
      goals,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const updatedNodes = [...localNodes, newNode]
    saveToStorage(updatedNodes, nextId + 1)
    return newNode
  }

  const updateNode = (id: number, updates: Partial<NodeData>) => {
    const updatedNodes = localNodes.map(node => 
      node.id === id 
        ? { ...node, ...updates, updated_at: new Date().toISOString() }
        : node
    )
    saveToStorage(updatedNodes)
    return updatedNodes.find(n => n.id === id)
  }

  const deleteNode = (id: number) => {
    // Função recursiva para deletar nodo e todos os filhos
    const deleteNodeAndChildren = (nodeId: number, nodes: NodeData[]): NodeData[] => {
      const children = nodes.filter(n => n.parent_id === nodeId)
      let filteredNodes = nodes.filter(n => n.id !== nodeId)
      
      children.forEach(child => {
        filteredNodes = deleteNodeAndChildren(child.id, filteredNodes)
      })
      
      return filteredNodes
    }
    
    const updatedNodes = deleteNodeAndChildren(id, localNodes)
    saveToStorage(updatedNodes)
  }

  const clearAll = () => {
    localStorage.removeItem('flowchart-nodes')
    localStorage.removeItem('flowchart-next-id')
    setLocalNodes([])
    setNextId(1)
  }

  const importNodes = (nodes: Omit<NodeData, 'id' | 'created_at' | 'updated_at'>[]) => {
    const now = new Date().toISOString()
    let currentId = nextId
    
    const newNodes = nodes.map(node => ({
      ...node,
      id: currentId++,
      created_at: now,
      updated_at: now
    }))
    
    saveToStorage(newNodes, currentId)
  }

  return {
    nodes: localNodes,
    addNode,
    updateNode,
    deleteNode,
    clearAll,
    importNodes
  }
}
