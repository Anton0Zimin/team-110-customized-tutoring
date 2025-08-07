"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Bot, User } from "lucide-react"
import type { Student } from "@/app/page"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface TutorChatbotProps {
  student: Student
}

export function TutorChatbot({ student }: TutorChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi! I'm here to help you understand ${student.display_name}'s learning needs and answer any questions about their accommodations or preferences. What would you like to know?`,
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
        text: generateBotResponse(inputValue, student),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const generateBotResponse = (userInput: string, student: Student): string => {
    const input = userInput.toLowerCase()

    if (input.includes("accommodation") || input.includes("need")) {
      return `${student.display_name} needs these accommodations: ${student.accommodations_needed.join(", ")}. Make sure to implement these consistently in your tutoring sessions.`
    }

    if (input.includes("learning style") || input.includes("prefer")) {
      return `This student learns best through ${student.learning_preferences?.style.toLowerCase()} methods in a ${student.learning_preferences.format.toLowerCase()} setting. They prefer ${student.learning_preferences.modality.toLowerCase()} sessions.`
    }

    if (input.includes("disability") || input.includes(student.primary_disability.toLowerCase())) {
      const tips = getDisabilityTips(student.primary_disability)
      return `For ${student.primary_disability}, here are some key tips: ${tips}`
    }

    if (input.includes("subject") || input.includes("topic")) {
      return `The student is interested in: ${student.preferred_subjects.join(", ")}. Focus on these areas and connect new concepts to their interests when possible.`
    }

    if (input.includes("time") || input.includes("schedule")) {
      const availableSlots = student.availability.filter((slot) => slot.start_time && slot.end_time)
      if (availableSlots.length > 0) {
        return `The student is available on: ${availableSlots.map((slot) => `${slot.day} ${slot.start_time}-${slot.end_time}`).join(", ")}.`
      }
      return "The student hasn't specified their availability yet. You may want to discuss scheduling directly with them."
    }

    if (input.includes("help") || input.includes("support")) {
      return "I can help you understand the student's needs, suggest teaching strategies, or clarify their accommodations. What specific aspect would you like to know more about?"
    }

    return "That's a great question! Based on the student's profile, I'd recommend focusing on their preferred learning style and ensuring all accommodations are met. Is there a specific aspect of their learning needs you'd like me to elaborate on?"
  }

  const getDisabilityTips = (disability: string): string => {
    const tips: Record<string, string> = {
      Dyslexia:
        "Use multi-sensory approaches, provide extra time for reading, use visual aids, and break information into smaller chunks.",
      ADHD: "Keep sessions structured but flexible, use frequent breaks, minimize distractions, and incorporate movement when possible.",
      "Autism Spectrum Disorder":
        "Maintain consistent routines, use clear and literal communication, provide advance notice of changes, and incorporate their special interests.",
      "Visual Impairment":
        "Use audio descriptions, tactile materials, and ensure good lighting. Describe visual content verbally.",
      "Hearing Impairment":
        "Face the student when speaking, use visual aids, write key points, and ensure good lighting for lip reading.",
      "Physical Disability":
        "Ensure accessible seating and materials, allow extra time for physical tasks, and adapt activities as needed.",
    }

    return (
      tips[disability] ||
      "Focus on the student's individual strengths and adapt your teaching methods to their specific needs and preferences."
    )
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
          placeholder="Ask about accommodations, learning preferences, or teaching strategies..."
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
