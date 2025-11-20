import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Image } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
  bucket?: string
  accept?: string
  maxSize?: number // in bytes
}

export const ImageUpload = ({ 
  value, 
  onChange, 
  className,
  bucket = 'news-images',
  accept = 'image/jpeg,image/png,image/svg+xml,image/webp',
  maxSize = 5 * 1024 * 1024 // 5MB
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setIsLoggedIn(!!data.session)
    }
    checkSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      toast({
        title: "Erro",
        description: `Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive",
      })
      return false
    }

    const acceptedTypes = accept.split(',').map(type => type.trim())
    if (!acceptedTypes.some(type => file.type === type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return

    setUploading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        toast({
          title: "Login necessário",
          description: "Faça login para enviar imagens.",
          variant: "destructive",
        })
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onChange(data.publicUrl)
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      const message = (error as any)?.message || 'Não foi possível enviar a imagem'
      const hint = typeof message === 'string' && message.includes('Bucket not found')
        ? "Verifique o bucket 'news-images' no Supabase (Storage) e se está definido como Público."
        : undefined
      toast({
        title: "Erro",
        description: hint ? `${message}. ${hint}` : message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    uploadFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (!isLoggedIn) {
      toast({
        title: "Login necessário",
        description: "Entre na sua conta para enviar imagens.",
        variant: "destructive",
      })
      return
    }

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeImage = () => {
    onChange('')
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Imagem em Destaque</Label>
      {!isLoggedIn && (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-200">
          <p className="text-xs">Você precisa estar logado para enviar imagens.</p>
        </div>
      )}
      
      {value ? (
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            dragActive 
              ? "border-primary bg-primary/10" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!isLoggedIn) {
              toast({
                title: "Login necessário",
                description: "Faça login para enviar imagens.",
                variant: "destructive",
              })
              return
            }
            fileInputRef.current?.click()
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                <Image className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {uploading ? 'Enviando...' : 'Clique ou arraste uma imagem'}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, SVG ou WebP até {maxSize / (1024 * 1024)}MB
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={uploading || !isLoggedIn}
      />
    </div>
  )
}