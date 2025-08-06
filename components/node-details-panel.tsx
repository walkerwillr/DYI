"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Target, Users, X } from 'lucide-react'

interface NodeData {
  id: number
  name: string
  goals: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

interface NodeDetailsPanelProps {
  node: NodeData | null
  children: NodeData[]
  onClose: () => void
  onEdit: (id: number) => void
  onEditGoals: (id: number) => void
  onAddChild: (parentId: number) => void
}

export function NodeDetailsPanel({ 
  node, 
  children, 
  onClose, 
  onEdit, 
  onEditGoals, 
  onAddChild 
}: NodeDetailsPanelProps) {
  if (!node) return null

  const createdDate = new Date(node.created_at).toLocaleDateString('pt-BR')
  const updatedDate = new Date(node.updated_at).toLocaleDateString('pt-BR')

  return (
    <Card className="w-80 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">{node.name}</CardTitle>
            <Badge variant="outline">ID: {node.id}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onEdit(node.id)} className="flex-1">
            Editar Nome
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEditGoals(node.id)} className="flex-1">
            Editar Metas
          </Button>
        </div>
        
        <Button size="sm" variant="secondary" onClick={() => onAddChild(node.id)} className="w-full">
          Adicionar Filho
        </Button>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Metas e Descrição</span>
          </div>
          
          {node.goals ? (
            <ScrollArea className="h-32">
              <div className="text-sm p-3 bg-muted rounded text-muted-foreground whitespace-pre-wrap">
                {node.goals}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhuma meta ou descrição definida</p>
          )}
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Filhos ({children.length})</span>
          </div>
          
          {children.length > 0 ? (
            <ScrollArea className="h-24">
              <div className="space-y-1">
                {children.map((child) => (
                  <div key={child.id} className="text-sm p-2 bg-muted rounded">
                    {child.name}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhum filho</p>
          )}
        </div>
        
        <Separator />
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Criado: {createdDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Atualizado: {updatedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
