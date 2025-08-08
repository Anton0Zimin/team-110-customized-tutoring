"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Bot, User } from "lucide-react"
import type { Student } from "@/app/page"
import { getChatSessionId, setChatSessionId } from "@/lib/globals"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface TutorChatbotProps {
  student: Student
  authToken?: string
  tutorId?: string
}

export function TutorChatbot({ student, authToken, tutorId }: TutorChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi! I'm here to help you understand ${student.display_name}'s learning needs and answer any questions about their accommodations or preferences. What would you like to know?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Conversation starters for tutors
  const conversationStarters = [
    "What accommodations does this student need?",
    "How should I adapt my teaching style for this student?",
    "What are this student's learning preferences?",
    "Can you suggest teaching strategies for this student's disability?",
    "What subjects is this student most interested in?",
    "When is this student available for sessions?"
  ]

  const handleSendMessage = async (messageText?: string) => {
    const userInput = messageText || inputValue
    if (!userInput.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const botResponse = await generateBotResponse(userInput)
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, responseMessage])
    } catch (error) {
      console.error('Error getting bot response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateBotResponse = async (userInput: string): Promise<string> => {
    try {
      const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://customized-training.org';

      const response = await fetch(`${apiBase}/api/chat/${student.student_id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: userInput,
          subject: "General",
          session_id: getChatSessionId()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      setChatSessionId(data.session_id);

      return data.response || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      console.error('API call failed:', error);
      return getFallbackResponse(userInput, student);
    }
  }

  const getFallbackResponse = (userInput: string, student: Student): string => {
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
      {/* Conversation Starters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {conversationStarters.map((starter, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs font-serif h-8 px-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => handleSendMessage(starter)}
            disabled={isLoading}
          >
            {starter}
          </Button>
        ))}
      </div>

      <div className="h-64 overflow-y-auto space-y-3 p-4 bg-muted rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "bot" && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <Card
              className={`max-w-xs ${
                message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card border-border"
              }`}
            >
              <CardContent className="p-3">
                <p className="font-serif text-sm">{message.text}</p>
              </CardContent>
            </Card>
            {message.sender === "user" && (
              <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted" />
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
        <Button
          onClick={() => handleSendMessage()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
