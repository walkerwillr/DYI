"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Mail, Copy, X, Share2 } from 'lucide-react'
import { useMemo, useState } from "react"
import { toast } from "@/hooks/use-toast"

type GoalsViewerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  goalsText: string
  emailSubject?: string
}

export function GoalsViewer({
  open,
  onOpenChange,
  title,
  goalsText,
  emailSubject,
}: GoalsViewerProps) {
  const [copying, setCopying] = useState(false)

  const subject = useMemo(() => emailSubject || `Metas - ${title}`, [emailSubject, title])
  const mailtoHref = useMemo(() => {
    const body = goalsText || "Sem metas definidas."
    const href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    return href
  }, [subject, goalsText])

  const handleCopy = async () => {
    try {
      setCopying(true)
      await navigator.clipboard.writeText(goalsText || "")
      toast({
        title: "Copiado",
        description: "O texto das metas foi copiado para a área de transferência.",
      })
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Seu navegador pode ter bloqueado a ação.",
        variant: "destructive",
      })
    } finally {
      setCopying(false)
    }
  }

  const handleShare = () => {
    // Prefer a mailto experience per user story
    window.location.href = mailtoHref
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-4xl w-[min(100vw-1rem,900px)] p-0 gap-0">
        <DialogHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b p-4">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base sm:text-lg">{title || "Metas"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={copying}>
                <Copy className="h-4 w-4 mr-2" />
                {copying ? "Copiando..." : "Copiar"}
              </Button>
              <Button size="sm" onClick={handleShare}>
                <Mail className="h-4 w-4 mr-2" />
                Enviar por E-mail
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} title="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <span>{"Visualização focada das metas"}</span>
          </div>
          <Separator className="my-3" />

          <ScrollArea className="h-[70vh] sm:h-[72vh]">
            <div className="whitespace-pre-wrap text-sm leading-6 text-foreground p-1">
              {goalsText?.trim() ? goalsText : "Sem metas definidas."}
            </div>
          </ScrollArea>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
