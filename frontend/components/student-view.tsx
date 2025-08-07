"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentRegistrationForm } from "@/components/student-registration-form"
import { StudentChatbot } from "@/components/student-chatbot"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { Student } from "@/app/page"
import { LogOut } from "lucide-react"
import { getUserId } from "@/lib/globals"
import { getAccessToken } from "@/lib/fetchWithToken"

interface StudentViewProps {
  onRegistration: (student: Student) => void
  onLogout: () => void
}

export function StudentView({ onRegistration, onLogout }: StudentViewProps) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)

  const handleRegistrationComplete = (studentData: Student) => {
    onRegistration(studentData)
    setIsRegistered(true)
    setShowChatbot(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">O&L</span>
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold">Owl & Lion Access</h1>
              <p className="text-sm opacity-90">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button onClick={onLogout} variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {!isRegistered ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-bold text-primary">Student Registration</h2>
              <p className="text-muted-foreground font-serif">Help us understand your learning needs and preferences</p>
            </div>
            <StudentRegistrationForm onSubmit={handleRegistrationComplete} />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-2 border-accent bg-accent/10">
              <CardHeader>
                <CardTitle className="text-accent-foreground font-serif">Registration Complete!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-serif">
                  Thank you for registering. Your information has been submitted and you'll be matched with a suitable
                  tutor soon.
                </p>
              </CardContent>
            </Card>

            {showChatbot && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary font-serif">
                    Wondering what's next? Let's figure it out together.
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StudentChatbot 
                    studentId={getUserId() || ""} 
                    authToken={getAccessToken() || ""} 
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
