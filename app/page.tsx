"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
} from "reactflow"
import "reactflow/dist/style.css"
import { supabase, isSupabaseConfigured, testSupabaseConnection } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Target, Search, X, RefreshCw, Eye } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { CustomNode } from "@/components/custom-node"
import { NodeDetailsPanel } from "@/components/node-details-panel"
import { ExportImportDialog } from "@/components/export-import-dialog"
import { GoalsViewer } from "@/components/goals-viewer"
import { Separator } from "@/components/ui/separator"

interface NodeData {
  id: number
  name: string
  goals: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

interface TreeNode {
  id: number
  data: NodeData
  children: TreeNode[]
  x: number
  y: number
  width: number
}

const nodeTypes = {
  custom: CustomNode,
}

function ConfigurationCheck({ children }: { children: React.ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConfig = () => {
      const configured = isSupabaseConfigured()
      setIsConfigured(configured)
      setIsChecking(false)
    }
    
    checkConfig()
  }, [])

  if (isChecking) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p>Verificando configuração...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-red-500 text-4xl">⚠️</div>
            <h2 className="text-xl font-semibold">Configuração Necessária</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Para usar esta aplicação, você precisa configurar as variáveis de ambiente do Supabase:</p>
              <div className="bg-gray-100 p-3 rounded text-left font-mono text-xs">
                <div>NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui</div>
              </div>
              <p>Adicione essas variáveis no arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code></p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <img 
          src="http://dseclab.io/cdn/shop/files/Logo_DIYSEC_-_Rod_Lage_310x.png?v=1752180244"
          alt="DIY SEC Logo"
          className="h-10 w-10 object-contain"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = 'none'
          }}
        />
        <h1 className="text-xl font-bold text-gray-900">
          Organograma e Metas DIY
        </h1>
      </div>
    </header>
  )
}

export default function FlowchartApp() {
  return (
    <ConfigurationCheck>
      <div className="w-full h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          <ReactFlowProvider>
            <FlowChart />
          </ReactFlowProvider>
        </div>
      </div>
    </ConfigurationCheck>
  )
}

function FlowChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nodeData, setNodeData] = useState<NodeData[]>([])
  const [editingNode, setEditingNode] = useState<NodeData | null>(null)
  const [editingGoals, setEditingGoals] = useState<NodeData | null>(null)
  const [newNodeName, setNewNodeName] = useState("")
  const [newNodeGoals, setNewNodeGoals] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGoalsDialogOpen, setIsGoalsDialogOpen] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState<number | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)
  const selectedNode = useMemo(() => nodeData.find(n => n.id === selectedNodeId) || null, [nodeData, selectedNodeId])
  const [isGoalsViewerOpen, setIsGoalsViewerOpen] = useState(false)
  const [isOnlineMode, setIsOnlineMode] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  const localStorage = useLocalStorage()

  useEffect(() => {
    const checkConnection = async () => {
      if (isSupabaseConfigured()) {
        const { success } = await testSupabaseConnection()
        setConnectionStatus(success ? 'online' : 'offline')
        setIsOnlineMode(success)
      } else {
        setConnectionStatus('offline')
        setIsOnlineMode(false)
      }
    }
    
    checkConnection()
  }, [])

  const fetchNodes = useCallback(async () => {
    if (isOnlineMode && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('nodes')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        setNodeData(data || [])
        convertToFlowNodes(data || [])
      } catch (error) {
        console.error('Error fetching nodes:', error)
        toast({
          title: "Erro de Conexão",
          description: "Mudando para modo offline. Dados serão salvos localmente.",
          variant: "destructive",
        })
        setIsOnlineMode(false)
        setConnectionStatus('offline')
        setNodeData(localStorage.nodes)
        convertToFlowNodes(localStorage.nodes)
      }
    } else {
      setNodeData(localStorage.nodes)
      convertToFlowNodes(localStorage.nodes)
    }
  }, [searchTerm, isOnlineMode, localStorage.nodes])

  // Algoritmo melhorado para posicionamento em árvore
  const buildTreeStructure = (data: NodeData[]): TreeNode[] => {
    const nodeMap = new Map<number, TreeNode>()
    
    // Criar todos os nodos
    data.forEach(nodeData => {
      nodeMap.set(nodeData.id, {
        id: nodeData.id,
        data: nodeData,
        children: [],
        x: 0,
        y: 0,
        width: 0
      })
    })
    
    // Construir hierarquia
    const roots: TreeNode[] = []
    data.forEach(nodeData => {
      const node = nodeMap.get(nodeData.id)!
      if (nodeData.parent_id === null) {
        roots.push(node)
      } else {
        const parent = nodeMap.get(nodeData.parent_id)
        if (parent) {
          parent.children.push(node)
        }
      }
    })
    
    return roots
  }

  const calculateTreeLayout = (roots: TreeNode[]) => {
    const NODE_WIDTH = 320
    const NODE_HEIGHT = 180
    const HORIZONTAL_SPACING = 50
    const VERTICAL_SPACING = 80
    
    // Calcular largura de cada subárvore
    const calculateSubtreeWidth = (node: TreeNode): number => {
      if (node.children.length === 0) {
        node.width = NODE_WIDTH
        return NODE_WIDTH
      }
      
      let totalChildWidth = 0
      node.children.forEach(child => {
        totalChildWidth += calculateSubtreeWidth(child)
      })
      
      // Adicionar espaçamento entre filhos
      const childrenSpacing = (node.children.length - 1) * HORIZONTAL_SPACING
      const childrenTotalWidth = totalChildWidth + childrenSpacing
      
      // A largura do nodo é o máximo entre sua própria largura e a largura dos filhos
      node.width = Math.max(NODE_WIDTH, childrenTotalWidth)
      return node.width
    }
    
    // Posicionar nodos
    const positionNodes = (node: TreeNode, x: number, y: number) => {
      node.x = x
      node.y = y
      
      if (node.children.length === 0) return
      
      // Calcular posição inicial dos filhos (centralizada)
      let totalChildrenWidth = 0
      node.children.forEach(child => {
        totalChildrenWidth += child.width
      })
      
      const childrenSpacing = (node.children.length - 1) * HORIZONTAL_SPACING
      const totalWidth = totalChildrenWidth + childrenSpacing
      let currentX = x + (node.width - totalWidth) / 2
      
      node.children.forEach(child => {
        // Posicionar filho no centro de sua subárvore
        const childCenterX = currentX + child.width / 2
        positionNodes(child, childCenterX - NODE_WIDTH / 2, y + NODE_HEIGHT + VERTICAL_SPACING)
        currentX += child.width + HORIZONTAL_SPACING
      })
    }
    
    // Processar cada árvore raiz
    let currentRootX = 0
    roots.forEach(root => {
      calculateSubtreeWidth(root)
      positionNodes(root, currentRootX, 0)
      currentRootX += root.width + HORIZONTAL_SPACING * 2 // Espaço extra entre árvores
    })
  }

  const convertToFlowNodes = (data: NodeData[]) => {
    const flowNodes: Node[] = []
    const flowEdges: Edge[] = []

    // Filtrar dados baseado na busca
    const filteredData = searchTerm 
      ? data.filter(node => 
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.goals.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : data

    // Construir estrutura de árvore
    const roots = buildTreeStructure(filteredData)
    
    // Calcular layout
    calculateTreeLayout(roots)
    
    // Converter para nodos do ReactFlow
    const processNode = (treeNode: TreeNode) => {
      const isHighlighted = searchTerm && (
        treeNode.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treeNode.data.goals.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      flowNodes.push({
        id: treeNode.id.toString(),
        type: 'custom',
        position: { x: treeNode.x, y: treeNode.y },
        data: {
          label: treeNode.data.name,
          goals: treeNode.data.goals,
          dbId: treeNode.id,
          isHighlighted,
          onEdit: handleEditNode,
          onDelete: handleDeleteNode,
          onAddChild: handleAddChild,
          onEditGoals: handleEditGoals,
          onSelect: setSelectedNodeId,
          onViewGoals: (id: number) => {
            setSelectedNodeId(id)
            setIsGoalsViewerOpen(true)
          },
        },
        selected: selectedNodeId === treeNode.id,
      })

      // Criar edges para filhos
      treeNode.children.forEach(child => {
        flowEdges.push({
          id: `e${treeNode.id}-${child.id}`,
          source: treeNode.id.toString(),
          target: child.id.toString(),
          type: 'smoothstep',
          animated: isHighlighted,
          style: {
            stroke: isHighlighted ? '#fbbf24' : '#94a3b8',
            strokeWidth: isHighlighted ? 3 : 2,
          },
        })
        
        processNode(child)
      })
    }

    roots.forEach(processNode)

    setNodes(flowNodes)
    setEdges(flowEdges)
  }

  const handleEditNode = (id: number) => {
    const node = nodeData.find(n => n.id === id)
    if (node) {
      setEditingNode(node)
      setNewNodeName(node.name)
      setIsEditDialogOpen(true)
    }
  }

  const handleEditGoals = (id: number) => {
    const node = nodeData.find(n => n.id === id)
    if (node) {
      setEditingGoals(node)
      setNewNodeGoals(node.goals)
      setIsGoalsDialogOpen(true)
    }
  }

  const handleAddChild = (parentId: number) => {
    setIsAddingChild(parentId)
    setNewNodeName("")
    setIsEditDialogOpen(true)
  }

  const handleDeleteNode = async (id: number) => {
    try {
      if (isOnlineMode && isSupabaseConfigured()) {
        const { error } = await supabase
          .from('nodes')
          .delete()
          .eq('id', id)

        if (error) throw error
      } else {
        localStorage.deleteNode(id)
      }

      toast({
        title: "Sucesso",
        description: `Nodo deletado com sucesso ${!isOnlineMode ? '(modo offline)' : ''}`,
      })
      
      fetchNodes()
    } catch (error) {
      console.error('Error deleting node:', error)
      toast({
        title: "Erro",
        description: "Falha ao deletar o nodo. Tentando modo offline...",
        variant: "destructive",
      })
      
      setIsOnlineMode(false)
      setConnectionStatus('offline')
      localStorage.deleteNode(id)
      fetchNodes()
    }
  }

  const resetDialogStates = () => {
    setIsEditDialogOpen(false)
    setIsGoalsDialogOpen(false)
    setEditingNode(null)
    setEditingGoals(null)
    setIsAddingChild(null)
    setNewNodeName("")
    setNewNodeGoals("")
  }

  const handleSaveNode = async () => {
    try {
      if (isOnlineMode && isSupabaseConfigured()) {
        if (editingNode) {
          const { error } = await supabase
            .from('nodes')
            .update({ 
              name: newNodeName,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingNode.id)

          if (error) throw error
        } else if (isAddingChild !== null) {
          const { error } = await supabase
            .from('nodes')
            .insert({
              name: newNodeName,
              parent_id: isAddingChild,
              goals: ''
            })

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('nodes')
            .insert({
              name: newNodeName,
              parent_id: null,
              goals: ''
            })

          if (error) throw error
        }
      } else {
        if (editingNode) {
          localStorage.updateNode(editingNode.id, { name: newNodeName })
        } else {
          localStorage.addNode(newNodeName, isAddingChild)
        }
      }

      toast({
        title: "Sucesso",
        description: `Nodo ${editingNode ? 'atualizado' : 'criado'} com sucesso ${!isOnlineMode ? '(modo offline)' : ''}`,
      })

      resetDialogStates()
      fetchNodes()
    } catch (error) {
      console.error('Error saving node:', error)
      toast({
        title: "Erro",
        description: "Falha ao salvar o nodo. Tentando modo offline...",
        variant: "destructive",
      })
      
      setIsOnlineMode(false)
      setConnectionStatus('offline')
      
      if (editingNode) {
        localStorage.updateNode(editingNode.id, { name: newNodeName })
      } else {
        localStorage.addNode(newNodeName, isAddingChild)
      }
      
      resetDialogStates()
      fetchNodes()
    }
  }

  const handleSaveGoals = async () => {
    if (!editingGoals) return

    try {
      if (isOnlineMode && isSupabaseConfigured()) {
        const { error } = await supabase
          .from('nodes')
          .update({ 
            goals: newNodeGoals,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGoals.id)

        if (error) throw error
      } else {
        localStorage.updateNode(editingGoals.id, { goals: newNodeGoals })
      }

      toast({
        title: "Sucesso",
        description: `Metas atualizadas com sucesso ${!isOnlineMode ? '(modo offline)' : ''}`,
      })

      setIsGoalsDialogOpen(false)
      setEditingGoals(null)
      setNewNodeGoals("")
      fetchNodes()
    } catch (error) {
      console.error('Error saving goals:', error)
      toast({
        title: "Erro",
        description: "Falha ao salvar as metas. Tentando modo offline...",
        variant: "destructive",
      })
      
      setIsOnlineMode(false)
      setConnectionStatus('offline')
      localStorage.updateNode(editingGoals.id, { goals: newNodeGoals })
      
      setIsGoalsDialogOpen(false)
      setEditingGoals(null)
      setNewNodeGoals("")
      fetchNodes()
    }
  }

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  useEffect(() => {
    fetchNodes()
  }, [fetchNodes])

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          connectionStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' :
          connectionStatus === 'online' ? 'bg-green-100 text-green-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {connectionStatus === 'checking' ? 'Verificando conexão...' :
           connectionStatus === 'online' ? '🟢 Online (Supabase)' :
           '🟠 Offline (Local)'}
        </div>
      </div>

      <div className="absolute top-16 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingNode(null)
                setIsAddingChild(null)
                setNewNodeName("")
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Nodo Raiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingNode ? "Editar Nodo" : "Novo Nodo"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome do Nodo</label>
                  <Input
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    placeholder="Digite o nome do nodo"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveNode} disabled={!newNodeName.trim()}>
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>

        {showSearch && (
          <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-lg">
            <Input
              placeholder="Buscar nodos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => setIsGoalsViewerOpen(true)}
            disabled={!selectedNode}
            title={selectedNode ? "Ver metas em modo focado" : "Selecione um nodo para visualizar"}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Metas
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setNodes([])
              setEdges([])
              setTimeout(() => fetchNodes(), 100)
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <ExportImportDialog 
            nodeData={nodeData} 
            onImportComplete={fetchNodes} 
          />
        </div>
      </div>

      {/* Editar Metas — sticky header with Save button and scrollable Textarea */}
      <Dialog open={isGoalsDialogOpen} onOpenChange={setIsGoalsDialogOpen}>
        <DialogContent className="max-w-4xl w-[min(100vw-2rem,900px)] p-0">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b p-4">
            <div className="flex items-center justify-between gap-2">
              <DialogHeader className="p-0">
                <DialogTitle>Editar Metas - {editingGoals?.name}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Button onClick={handleSaveGoals}>
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsGoalsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <label className="text-sm font-medium mb-2 block">
              Metas do Nodo (texto livre)
            </label>
            <Textarea
              value={newNodeGoals}
              onChange={(e) => setNewNodeGoals(e.target.value)}
              placeholder="Digite as metas, objetivos, descrições ou qualquer informação relevante para este nodo..."
              className="w-full h-[60vh] resize-none font-mono text-sm overflow-auto"
            />
            <p className="text-xs text-muted-foreground mt-2">
              O campo acima é rolável para textos longos. O botão Salvar está sempre visível no topo.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {selectedNodeId && (
        <div className="absolute top-16 right-4 bottom-4 z-10">
          <NodeDetailsPanel
            node={nodeData.find(n => n.id === selectedNodeId) || null}
            children={nodeData.filter(n => n.parent_id === selectedNodeId)}
            onClose={() => setSelectedNodeId(null)}
            onEdit={handleEditNode}
            onEditGoals={handleEditGoals}
            onAddChild={handleAddChild}
          />
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        onNodeClick={(_, node) => setSelectedNodeId(node.data.dbId)}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      <GoalsViewer
        open={isGoalsViewerOpen}
        onOpenChange={setIsGoalsViewerOpen}
        title={selectedNode?.name || "Metas"}
        goalsText={selectedNode?.goals || ""}
      />
    </div>
  )
}
