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

export function StudentChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm here to help answer any questions about your tutoring experience. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("tutor") || input.includes("match")) {
      return "Great question! Based on your registration, we'll match you with a tutor who has experience with your specific disability and learning preferences. This usually takes 1-2 business days."
    }

    if (input.includes("schedule") || input.includes("time")) {
      return "Your tutor will work with your availability preferences that you provided. You can always update your schedule by contacting us or through your tutor directly."
    }

    if (input.includes("accommodation")) {
      return "All our tutors are trained in disability accommodations. Your specific needs have been noted and will be shared with your matched tutor to ensure the best learning experience."
    }

    if (input.includes("help") || input.includes("support")) {
      return "I'm here to help! You can also reach out to our support team at support@fhda.edu or visit the Disability Support Services office on campus."
    }

    return "That's a great question! While I work on getting you a more detailed answer, feel free to contact our support team at support@fhda.edu for immediate assistance."
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
