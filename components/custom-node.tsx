"use client"

import { Handle, Position, NodeProps } from "reactflow"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Target, Eye } from 'lucide-react'
import { cn } from "@/lib/utils"

interface CustomNodeData {
  label: string
  goals: string
  dbId: number
  isHighlighted?: boolean
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onAddChild: (parentId: number) => void
  onEditGoals: (id: number) => void
  onSelect: (id: number) => void
}

export const CustomNode = ({ data, selected }: NodeProps<CustomNodeData>) => {
  const goalsList = data.goals ? data.goals.split('\n').filter(goal => goal.trim()) : []

  return (
    <Card 
      className={cn(
        "min-w-[250px] max-w-[300px] shadow-lg transition-all duration-200 cursor-pointer",
        selected && "ring-2 ring-blue-500",
        data.isHighlighted && "ring-2 ring-yellow-400 bg-yellow-50"
      )}
    >
      <CardContent className="p-4">
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
        
        <div 
          className="space-y-3 cursor-pointer" 
          onClick={() => data.onSelect(data.dbId)}
        >
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm leading-tight flex-1 pr-2">
              {data.label}
            </h3>
            <Badge variant="secondary" className="text-xs">
              ID: {data.dbId}
            </Badge>
          </div>
          
          {goalsList.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Metas ({goalsList.length})
                </span>
              </div>
              <div className="max-h-20 overflow-y-auto">
                {goalsList.slice(0, 3).map((goal, index) => (
                  <p key={index} className="text-xs text-muted-foreground line-clamp-1">
                    • {goal.trim()}
                  </p>
                ))}
                {goalsList.length > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    +{goalsList.length - 3} mais...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-1 flex-wrap mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              data.onAddChild(data.dbId)
            }}
            className="h-7 px-2"
            title="Adicionar filho"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              data.onEdit(data.dbId)
            }}
            className="h-7 px-2"
            title="Editar nome"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              data.onEditGoals(data.dbId)
            }}
            className="h-7 px-2"
            title="Editar metas"
          >
            <Target className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (confirm('Tem certeza que deseja deletar este nodo e todos os seus filhos?')) {
                data.onDelete(data.dbId)
              }
            }}
            className="h-7 px-2"
            title="Deletar nodo"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      </CardContent>
    </Card>
  )
}
