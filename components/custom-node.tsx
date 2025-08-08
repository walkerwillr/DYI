"use client"

import { Handle, Position, NodeProps } from "reactflow"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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
  onViewGoals: (id: number) => void
}

export const CustomNode = ({ data, selected }: NodeProps<CustomNodeData>) => {
  const goalsList = data.goals ? data.goals.split('\n').filter(goal => goal.trim()) : []

  // Entire card is now the trigger; actions are moved into a contextual menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Card
          className={cn(
            "min-w-[250px] max-w-[300px] shadow-lg transition-all duration-200 cursor-pointer",
            selected && "ring-2 ring-blue-500",
            data.isHighlighted && "ring-2 ring-yellow-400 bg-yellow-50"
          )}
          // Pre-select the node so menu actions apply to this card
          onClick={(e) => {
            e.stopPropagation()
            data.onSelect(data.dbId)
          }}
        >
          <CardContent className="p-4">
            <Handle type="target" position={Position.Top} className="w-3 h-3" />

            <div className="space-y-3">
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
              <p className="text-[11px] text-muted-foreground">
                Clique para opções
              </p>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
          </CardContent>
        </Card>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            data.onViewGoals(data.dbId)
          }}
        >
          Ver metas
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            data.onEdit(data.dbId)
          }}
        >
          Editar nome
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            data.onEditGoals(data.dbId)
          }}
        >
          Editar metas
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            data.onAddChild(data.dbId)
          }}
        >
          Adicionar filho
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('Tem certeza que deseja deletar este nodo e todos os seus filhos?')) {
              data.onDelete(data.dbId)
            }
          }}
        >
          Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
