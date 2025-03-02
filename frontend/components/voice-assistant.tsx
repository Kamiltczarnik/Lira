"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, Loader2 } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

// Define types for our user data
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

interface VoiceAssistantProps {
  userData: UserData | null
}

export default function VoiceAssistant({ userData }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)
  // New ref to store the text present when mic starts
  const initialInputRef = useRef("")
  
  // Create a ref for the textarea
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Speech synthesis setup
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null

  // Initialize welcome message when userData changes
  useEffect(() => {
    if (userData) {
      setMessages([
        { 
          text: `Hello ${userData.first_name}! I'm your AI banking assistant. How can I help you today?`, 
          isUser: false 
        }
      ])
    } else {
      setMessages([
        { 
          text: "Hello! I'm your AI banking assistant. How can I help you today?", 
          isUser: false 
        }
      ])
    }
  }, [userData])

  // Initialize speech recognition only once
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interimTranscript += event.results[i][0].transcript;
        }
        // Clean up the new speech input
        const trimmedInterim = interimTranscript.trim();
        let appendedText = "";
        if (initialInputRef.current) {
          if (trimmedInterim) {
            // If the base text doesn't end in a space, add one
            const separator = initialInputRef.current.endsWith(" ") ? "" : " ";
            appendedText = separator + trimmedInterim.charAt(0).toLowerCase() + trimmedInterim.slice(1);
          }
        } else {
          appendedText = trimmedInterim;
        }
        // Update inputMessage with the base plus new appended text
        setInputMessage(initialInputRef.current + appendedText);
      };
      
      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          recognitionRef.current.start()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synth) {
        synth.cancel()
      }
    }
  }, [synth])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      isListeningRef.current = false
      recognitionRef.current?.stop()
      setTranscript("")
    } else {
      setIsListening(true)
      isListeningRef.current = true
      // Store current input value so new speech appends to it
      initialInputRef.current = inputMessage
      recognitionRef.current?.start()
    }
  }

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking)
    if (isSpeaking && synth) {
      synth.cancel()
    }
  }

  const speakResponse = (text: string) => {
    if (synth && isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      synth.speak(utterance)
    }
  }

  // Simulated AI response handler (customize as needed)
  const handleUserMessage = (text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [...prev, { text, isUser: true }])
    setIsProcessing(true)

    setTimeout(() => {
      let response = "I'm sorry, I don't understand that query."
      // Your logic for generating a response goes here...

      setMessages((prev) => [...prev, { text: response, isUser: false }])
      setIsProcessing(false)
      speakResponse(response)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    handleUserMessage(inputMessage)
    setInputMessage("")
    setTranscript("")
    // Reset the textarea height by accessing the ref
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px" // Or your desired min height
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <MessageSquare className="mr-2 h-5 w-5" />
          AI Banking Voice Assistant
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleSpeech} className="h-8 w-8">
            {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="sr-only">{isSpeaking ? "Mute voice" : "Enable voice"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
          {messages.map((message, index) => (
            <div key={index} className={cn("flex", message.isUser ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-3 text-sm shadow-sm",
                  message.isUser ? "bg-primary text-primary-foreground" : "bg-background border"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          {/* Display the input text (blue bubble) */}
          {inputMessage && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg px-4 py-3 text-sm bg-primary/50 text-primary-foreground shadow-sm">
                {inputMessage}
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
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
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
    </Card>
  )
}
