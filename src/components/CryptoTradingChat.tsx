"use client"

import { useState, FormEvent } from "react"
import { Send, Bot, Paperclip, Mic, CornerDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"

export function CryptoTradingChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Bem-vindo ao Smart Chat! 😊 Sou a Nathália Reis, mas, se preferir pode me chamar só de Nathy 🥰. Como posso te ajudar hoje?",
      sender: "ai",
    },
    {
      id: 2,
      content: "Gostaria de saber mais informações sobre o Smart Chat.",
      sender: "user",
    },
    {
      id: 3,
      content: "Queria entender um pouco melhor o seu desafio atualizado — você busca melhorar alguma frente específica do atendimento ou vendas? Posso te mostrar como nossas soluções podem ajudar a transformar seus resultados de forma prática e eficiente!",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: input,
        sender: "user",
      },
    ])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "Estou analisando as condições atuais do mercado para você. Com base nos dados recentes, recomendo considerar sua tolerância ao risco antes de fazer qualquer operação.",
          sender: "ai",
        },
      ])
      setIsLoading(false)
    }, 1500)
  }

  const handleAttachFile = () => {
    // Placeholder for file attachment
  }

  const handleMicrophoneClick = () => {
    // Placeholder for voice input
  }

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <h1 className="text-xl font-semibold text-foreground">Assistente Smart Chat 🗯️</h1>
        <p className="text-sm text-muted-foreground">
          Obtenha insights Sobre o Smart Chat e Tire suas Dúvidas
        </p>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={
                  message.sender === "user"
                    ? "https://images.unsplash.com/photo-1736939615657-590b2dce72cc?ixlib=rb-4.1.0&ixid=80&crop=faces&fit=crop"
                    : "https://images.unsplash.com/photo-1613943093160-3371121d7ed2?ixlib=rb-4.1.0&ixid=80&crop=faces&fit=crop"
                }
                fallback={message.sender === "user" ? "U" : "AI"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src="https://images.unsplash.com/photo-1736939615657-590b2dce72cc?ixlib=rb-4.1.0&ixid=80&crop=faces&fit=crop"
                fallback="AI"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border border-border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre o Smart Chat, Qual a sua dúvida..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleAttachFile}
              >
                <Paperclip className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleMicrophoneClick}
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" className="ml-auto gap-1.5">
              Enviar Mensagem
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}