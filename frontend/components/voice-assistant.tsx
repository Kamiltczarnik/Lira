"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send, MessageSquare, Volume2, VolumeX, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Speech recognition setup
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)
  // New ref to store the text present when mic starts
  const initialInputRef = useRef("")
  
  // Create a ref for the textarea
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Speech synthesis setup
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null

  // Add this ref to track message count
  const prevMessageCount = useRef(displayMessages.length);

  // Initialize welcome message when userData changes
  useEffect(() => {
    const welcomeMessage = userData 
      ? `Hello ${userData.first_name}! I'm your AI banking assistant. How can I help you today?`
      : "Hello! I'm your AI banking assistant. How can I help you today?"
    
    setMessages([{ role: "assistant", content: welcomeMessage }])
    setDisplayMessages([{ 
      text: welcomeMessage, 
      isUser: false, 
      id: `welcome-${Date.now()}` 
    }])
  }, [userData])

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
  }, [isListening])
  }, [synth])

  // Handle transcript changes
  useEffect(() => {
    if (!isListening || !transcript) return

    // If we have a final transcript, send it
    const finalTranscript = transcript
    if (finalTranscript && !isProcessing) {
      handleUserMessage(finalTranscript)
      setTranscript("")
    }
  }, [transcript, isListening, isProcessing])


  const toggleListening = () => {
  if (isListening) {
    // Stop listening
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    isListeningRef.current = false;

    // If we have a transcript, send it
    if (transcript) {
      handleUserMessage(transcript);
      setTranscript("");
    }
  } else {
    // Start listening
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;

        // Store current input value so new speech appends to it
        initialInputRef.current = inputMessage;
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    } else {
      console.error("Speech recognition not supported");
    }
  }
};


  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking)
    
    // If turning off speech, stop any current audio
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      if (synth) {
        synth.cancel()
      }
    }
  }

  const speakWithBrowser = (text: string) => {
    if (!isSpeaking || !synth) return
    
    // Cancel any ongoing speech
    synth.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    synth.speak(utterance)
  }

  const speakResponse = (text: string, audioUrl?: string) => {
    if (!isSpeaking) return
    
    // If we have an audio URL from the server, use that
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err)
          // Fallback to browser speech synthesis
          speakWithBrowser(text)
        })
      } else {
        // Create audio element if it doesn't exist
        const audio = new Audio(audioUrl)
        audio.play().catch(err => {
          console.error("Error playing audio:", err)
          // Fallback to browser speech synthesis
          speakWithBrowser(text)
        })
      }
    } else {
      // Use browser speech synthesis
      speakWithBrowser(text)
    }
  }

// Improved preventScrollPropagation function
const preventScrollPropagation = (e: React.WheelEvent) => {
  // This ensures the scroll event doesn't bubble up to the main page
  e.stopPropagation();
}

// Combined handleUserMessage function
const handleUserMessage = async (text: string) => {
  if (!text.trim()) return;

  // Create a unique ID for this message
  const userMessageId = `user-${Date.now()}`;

  // Create message objects
  const userMessage = { role: "user", content: text };
  const userDisplayMessage = { text, isUser: true, id: userMessageId };

  // Update state with user message
  setMessages((prevMessages) => [...prevMessages, userMessage]);
  setDisplayMessages((prevDisplayMessages) => [...prevDisplayMessages, userDisplayMessage]);
  setIsProcessing(true);

  try {
    // If an environment variable is set to simulate the response, use simulated logic
    if (process.env.NEXT_PUBLIC_SIMULATE_AI_RESPONSE === "true") {
      // Simulated AI response (from voice-activation branch)
      setTimeout(() => {
        const simulatedResponse = "I'm sorry, I don't understand that query.";
        setMessages((prev) => [...prev, { role: "assistant", content: simulatedResponse }]);
        setDisplayMessages((prev) => [
          ...prev,
          { text: simulatedResponse, isUser: false, id: `ai-${Date.now()}` },
        ]);
        setIsProcessing(false);
      }, 1000);
    } else {
      // Use the API call from the gpt-connector/feature branch
      // Get the current messages including the new user message
      const currentMessages = [...messages, userMessage];

      // Call the backend API
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: currentMessages,
          user_data: userData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const aiReply = data.reply;

      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
      setDisplayMessages((prev) => [
        ...prev,
        { text: aiReply, isUser: false, id: `ai-${Date.now()}` },
      ]);
      setIsProcessing(false);
    }
  } catch (error) {
    console.error("Error in handleUserMessage:", error);
    setIsProcessing(false);
  }
};


      const data = await response.json()
      
      // Create a unique ID for the assistant message
      const assistantMessageId = `assistant-${Date.now()}`
      
      // Create the assistant message
      const assistantMessage = { role: "assistant", content: data.reply }
      const assistantDisplayMessage = { text: data.reply, isUser: false, id: assistantMessageId }
      
      // Update state with the assistant's response
      setMessages(prevMessages => [...prevMessages, assistantMessage])
      setDisplayMessages(prevDisplayMessages => [...prevDisplayMessages, assistantDisplayMessage])
      
      // Speak the response if speech is enabled
      if (isSpeaking) {
        speakResponse(data.reply, data.audio_url)
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      
      // Add an error message with a unique ID
      const errorMessageId = `error-${Date.now()}`
      setDisplayMessages(prevDisplayMessages => [
        ...prevDisplayMessages, 
        { 
          text: "Sorry, I encountered an error processing your request. Please try again.", 
          isUser: false,
          id: errorMessageId
        }
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputMessage.trim()) return;

  handleUserMessage(inputMessage);
  setInputMessage("");
  setTranscript("");
  
  // Reset the textarea height by accessing the ref
  if (textAreaRef.current) {
    textAreaRef.current.style.height = "40px"; // Or your desired min height
  }
}


  // Replace lines 293-297 with this enhanced scrollToBottom function
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && chatContainerRef.current) {
        // Use scrollIntoView with block: "end" to prevent page scrolling
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "end",
          inline: "nearest"
        });
      }
    };
    
    // Scroll when messages or processing state changes
    scrollToBottom();
  }, [displayMessages, isProcessing]);

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
        {/* Render message content here, for example: */}
        <p>{message.text}</p>
      </div>
    ))}
  </div>
</CardContent>
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
 {/* Display a bubble with either transcript or inputMessage */}
    {(transcript || inputMessage) && (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg px-4 py-3 text-sm bg-primary/50 text-primary-foreground shadow-sm">
          {transcript ? transcript : inputMessage}
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
