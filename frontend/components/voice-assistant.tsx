"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, Loader2, Bell, User, LogOut, Home, CreditCard, BarChart4, Clock, PieChart as PieChartIcon } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

type Account = {
  id: string
  type: string
  nickname: string
  balance: number
  rewards: number
  account_number: string
}

type Transaction = {
  transaction_id: string
  type: string
  merchant_name: string
  amount: number
  date: string
  description: string
}

type UserData = {
  customer_id: string
  first_name: string
  last_name: string
  accounts: Account[]
  transactions: Transaction[]
}

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

interface VoiceAssistantProps {
  userData: UserData | null
}

export default function VoiceAssistant({ userData }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(true)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [displayMessages, setDisplayMessages] = useState<{ text: string; isUser: boolean; id: string }[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Voice recognition & state helpers
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)
  // When starting voice input, store the current input text so that new speech appends to it.
  const initialInputRef = useRef("")

  // Speech synthesis setup
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null

  const router = useRouter()

  // Initialize welcome message when userData changes
  useEffect(() => {
    const welcomeText = userData 
      ? `Hello ${userData.first_name}! I'm your AI banking assistant. How can I help you today?`
      : "Hello! I'm your AI banking assistant. How can I help you today?"
    setMessages([{ role: "assistant", content: welcomeText }])
    setDisplayMessages([{ text: welcomeText, isUser: false, id: `welcome-${Date.now()}` }])
  }, [userData])

  // Initialize speech recognition (only once)
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interimTranscript += event.results[i][0].transcript
        }
        // Clean and append new speech to the initial stored input
        const trimmedInterim = interimTranscript.trim()
        let appendedText = ""
        if (initialInputRef.current) {
          if (trimmedInterim) {
            // If the base text doesn't end in a space, add one
            const separator = initialInputRef.current.endsWith(" ") ? "" : " "
            appendedText = separator + trimmedInterim.charAt(0).toLowerCase() + trimmedInterim.slice(1)
          }
        } else {
          appendedText = trimmedInterim
        }
        setTranscript(interimTranscript) // still update transcript if needed
        // Append recognized text to the existing text stored at start
        setInputMessage(initialInputRef.current + appendedText)
      }

      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          recognitionRef.current.start()
        }
      }
    }

    return () => {
      recognitionRef.current?.stop()
      synth?.cancel()
    }
  }, [synth])

  // Update scrolling when displayMessages or processing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end" 
      });
    }
  }, [displayMessages, isProcessing]);

  const toggleListening = () => {
    if (isListening) {
      // Stop listening; do not auto-send transcript—user may edit it.
      setIsListening(false)
      isListeningRef.current = false
      recognitionRef.current?.stop()
      setTranscript("")
    } else {
      // Start listening: store the current input so new speech appends.
      setIsListening(true)
      isListeningRef.current = true
      initialInputRef.current = inputMessage
      recognitionRef.current?.start()
    }
  }

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking)
    if (isSpeaking && synth) {
      synth.cancel()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }

  const speakResponse = (text: string, audioUrl?: string) => {
    if (!isSpeaking) return

    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err)
          speakWithBrowser(text)
        })
      } else {
        const audio = new Audio(audioUrl)
        audio.play().catch(err => {
          console.error("Error playing audio:", err)
          speakWithBrowser(text)
        })
      }
    } else {
      speakWithBrowser(text)
    }
  }

  const speakWithBrowser = (text: string) => {
    if (synth) {
      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      synth.speak(utterance)
    }
  }

  // Handle sending user message to ChatGPT backend
  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessageId = `user-${Date.now()}`
    const userMessage: Message = { role: "user", content: text }
    const userDisplayMessage = { text, isUser: true, id: userMessageId }

    setMessages(prev => [...prev, userMessage])
    setDisplayMessages(prev => [...prev, userDisplayMessage])
    setIsProcessing(true)

    try {
      const currentMessages = [...messages, userMessage]
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: currentMessages,
          user_data: userData
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()
      const assistantMessageId = `assistant-${Date.now()}`
      const assistantMessage: Message = { role: "assistant", content: data.reply }
      const assistantDisplayMessage = { text: data.reply, isUser: false, id: assistantMessageId }

      setMessages(prev => [...prev, assistantMessage])
      setDisplayMessages(prev => [...prev, assistantDisplayMessage])

      if (isSpeaking) {
        speakResponse(data.reply, data.audio_url)
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessageId = `error-${Date.now()}`
      setDisplayMessages(prev => [
        ...prev,
        { text: "Sorry, I encountered an error processing your request. Please try again.", isUser: false, id: errorMessageId }
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    handleUserMessage(inputMessage)
    setInputMessage("")
    setTranscript("")
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px"
    }
  }

  const preventScrollPropagation = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  return (
    <Card className="w-full h-full min-h-[600px] flex flex-col">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <MessageSquare className="mr-2 h-5 w-5" />
          AI Banking Voice Assistant
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleSpeech} 
            className={`h-8 w-8 ${!isSpeaking ? 'bg-red-100' : ''}`}
          >
            {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-500" />}
            <span className="sr-only">{isSpeaking ? "Mute voice" : "Enable voice"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden pb-6">
        <div 
          ref={chatContainerRef}
          className="h-[500px] overflow-y-auto overflow-x-hidden pr-4 space-y-4 mb-4 p-4 bg-muted/30 rounded-lg"
          onWheel={preventScrollPropagation}
        >
          {displayMessages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={cn(
                  "max-w-[80%] break-words rounded-lg px-4 py-3 text-sm shadow-sm",
                  message.isUser ? "bg-primary text-primary-foreground" : "bg-background border"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] break-words rounded-lg px-4 py-3 text-sm bg-primary/50 text-primary-foreground shadow-sm">
                {transcript}
              </div>
            </div>
          )}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-3 text-sm bg-background border shadow-sm flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing your request...
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full space-y-4">
          {/* Mic button */}
          <div className="relative w-full h-16 flex items-center justify-center">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={toggleListening}
              className={cn(
                "absolute rounded-full w-16 h-16 flex items-center justify-center transition-all",
                isListening && "animate-pulse"
              )}
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              <span className="sr-only">{isListening ? "Stop listening" : "Start listening"}</span>
            </Button>
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <textarea
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isListening}
              ref={textAreaRef}
              className="flex-1 w-full resize-none overflow-hidden rounded border px-3 py-2"
              rows={1}
              style={{ minHeight: "40px", overflow: "hidden", height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <Button type="submit" disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </CardFooter>
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Card>
  )
}
