"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Upload, FileJson } from 'lucide-react'
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface NodeData {
  id: number
  name: string
  goals: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

interface ExportImportDialogProps {
  nodeData: NodeData[]
  onImportComplete: () => void
}

export function ExportImportDialog({ nodeData, onImportComplete }: ExportImportDialogProps) {
  const [importData, setImportData] = useState("")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const handleExport = () => {
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      nodes: nodeData.map(node => ({
        name: node.name,
        goals: node.goals,
        parent_id: node.parent_id,
      }))
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `flowchart-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Sucesso",
      description: "Dados exportados com sucesso",
    })
  }

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData)
      
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error("Formato de dados inválido")
      }

      if (isSupabaseConfigured()) {
        // Limpar dados existentes (opcional)
        const { error: deleteError } = await supabase
          .from('nodes')
          .delete()
          .neq('id', 0)

        if (deleteError) throw deleteError

        // Importar novos dados
        const { error: insertError } = await supabase
          .from('nodes')
          .insert(data.nodes)

        if (insertError) throw insertError
      } else {
        // Modo offline - usar localStorage
        localStorage.setItem('flowchart-nodes', JSON.stringify(data.nodes.map((node: any, index: number) => ({
          ...node,
          id: index + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))))
        localStorage.setItem('flowchart-next-id', (data.nodes.length + 1).toString())
      }

      toast({
        title: "Sucesso",
        description: `${data.nodes.length} nodos importados com sucesso`,
      })

      setIsImportDialogOpen(false)
      setImportData("")
      onImportComplete()
    } catch (error) {
      console.error('Error importing data:', error)
      toast({
        title: "Erro",
        description: "Falha ao importar dados. Verifique o formato do arquivo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Importar Dados
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Dados JSON</label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Cole aqui o JSON exportado..."
                rows={12}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={!importData.trim()}>
                Importar Dados
              </Button>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p><strong>Atenção:</strong> A importação irá substituir todos os dados existentes.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
