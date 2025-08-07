"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface StudentChatbotProps {
  studentId: string;
  authToken: string;
}

export function StudentChatbot({ studentId, authToken }: StudentChatbotProps) {
  const conversationStarters = [
    "How will I be matched with a tutor?",
    "What accommodations are available?", 
    "How do I schedule tutoring sessions?",
    "What if I need to change my availability?",
    "How do I contact my tutor?",
    "What study strategies work best for my learning style?"
  ];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm here to help with your tutoring experience. Here are some things you can ask me about:",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue;
    setInputValue("")

    // Show typing indicator
    const typingMessage: Message = {
      id: "typing",
      text: "Typing...",
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, typingMessage])

    try {
      const botResponseText = await generateBotResponse(currentInput);
      
      // Remove typing indicator and add real response
      setMessages((prev) => {
        const withoutTyping = prev.filter(msg => msg.id !== "typing");
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          sender: "bot",
          timestamp: new Date(),
        }
        return [...withoutTyping, botResponse];
      });
    } catch (error) {
      // Remove typing indicator and show error
      setMessages((prev) => {
        const withoutTyping = prev.filter(msg => msg.id !== "typing");
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble right now. Please contact support at support@fhda.edu.",
          sender: "bot",
          timestamp: new Date(),
        }
        return [...withoutTyping, errorMessage];
      });
    }
  }

  const generateBotResponse = async (userInput: string): Promise<string> => {
    try {
      const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://customized-training.org';
      const response = await fetch(`${apiBase}/api/chat/${studentId}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: userInput,
          subject: "General"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting bot response:', error);
      return "I'm having trouble connecting right now. Please try again or contact support at support@fhda.edu for immediate assistance.";
    }
  }

  return (
    <div className="space-y-4">
      <div className="h-64 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "bot" && (
              <div className="w-8 h-8 bg-[#8B1538] rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <Card
              className={`max-w-xs ${
                message.sender === "user" ? "bg-[#8B1538] text-white" : "bg-white border-gray-200"
              }`}
            >
              <CardContent className="p-3">
                <p className="font-serif text-sm">{message.text}</p>
              </CardContent>
            </Card>
            {message.sender === "user" && (
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 p-2">
        {conversationStarters.map((starter, index) => (
          <button
            key={index}
            onClick={() => {
              setInputValue(starter);
            }}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full border text-gray-700 transition-colors"
          >
            {starter}
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything about your tutoring experience..."
          className="font-serif"
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button onClick={handleSendMessage} className="bg-[#8B1538] hover:bg-[#7A1230] text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
