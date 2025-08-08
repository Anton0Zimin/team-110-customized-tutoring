"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentRegistrationForm } from "@/components/student-registration-form"
import { StudentChatbot } from "@/components/student-chatbot"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { Student } from "@/app/page"
import { LogOut, GraduationCap, Star, Clock } from "lucide-react"
import { getUserId } from "@/lib/globals"
import { getAccessToken } from "@/lib/fetchWithToken"
import Confetti from "react-confetti"

interface StudentViewProps {
  onRegistration: (student: Student) => Promise<Student>
  onLogout: () => void
}

type ViewState = 'registration' | 'loading' | 'matched' | 'chatbot'

interface TutorMatch {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  bio: string
  matchReason: string
}

export function StudentView({ onRegistration, onLogout }: StudentViewProps) {
  const [viewState, setViewState] = useState<ViewState>('registration')
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [tutorMatch, setTutorMatch] = useState<TutorMatch | null>(null)
  const [isMatching, setIsMatching] = useState(false)

  const handleRegistrationComplete = async (studentData: Student) => {
    setViewState('loading')
    setIsMatching(true)

    const minLoadingTime = 5000 // 5 seconds minimum

    try {
      // Call the parent's onRegistration which handles the API call
      const updatedStudentData = await onRegistration(studentData)

      // Check if tutor data was returned from the API
      if (updatedStudentData.tutor_id && updatedStudentData.tutor_name) {
        console.log('Using tutor match from API:', updatedStudentData.tutor_id, updatedStudentData.tutor_name)

        // Transform the tutor data to frontend format
        const transformedTutor: TutorMatch = {
          id: updatedStudentData.tutor_id,
          name: updatedStudentData.tutor_name,
          specialty: "Personalized Tutoring",
          experience: "Experienced Tutor",
          rating: 4.8,
          bio: "Dedicated tutor committed to helping you succeed with personalized learning strategies.",
          matchReason: "Perfect match found based on your learning preferences and needs!"
        }

        setTutorMatch(transformedTutor)

        // Show loading for the full 10 seconds
        setTimeout(() => {
          setViewState('matched')
          setShowConfetti(true)
          setIsMatching(false)

          // Hide confetti after 5 seconds
          setTimeout(() => {
            setShowConfetti(false)
          }, 5000)
        }, minLoadingTime)

      } else {
        console.log('No tutor data in API response, using fallback')
        // Fallback if no tutor data
        handleFallbackMatch(minLoadingTime)
      }
    } catch (error) {
      console.error('Error during registration:', error)
      handleFallbackMatch(minLoadingTime)
    }
  }

  const handleFallbackMatch = (remainingTime: number) => {
    const fallbackTutor: TutorMatch = {
      id: "tutor_fallback",
      name: "Dr. Sarah Martinez",
      specialty: "Mathematics & Learning Disabilities",
      experience: "8 years",
      rating: 4.9,
      bio: "Specialized in teaching students with learning differences, particularly in STEM subjects. PhD in Special Education.",
      matchReason: "Perfect match based on your preferences!"
    }

    setTutorMatch(fallbackTutor)

    setTimeout(() => {
      setViewState('matched')
      setShowConfetti(true)
      setIsMatching(false)

      setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
    }, Math.max(0, remainingTime))
  }

  // Get window dimensions for confetti
  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

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
        {/* Confetti Animation */}
        {showConfetti && (
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={300}
            gravity={0.3}
          />
        )}

        {viewState === 'registration' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-bold text-primary">Student Registration</h2>
              <p className="text-muted-foreground font-serif">Help us understand your learning needs and preferences</p>
            </div>
            <StudentRegistrationForm onSubmit={handleRegistrationComplete} />
          </div>
        )}

        {viewState === 'loading' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[60vh]">
            {/* Loading Animation Section */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Success Modal */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-bold text-green-800 mb-2">Registration Successful!</h3>
                <p className="text-green-700 font-serif">Just wait while we find your perfect tutor match...</p>
              </div>

              {/* Large Emphasized Loading Animation */}
              <div className="relative">
                <div className="w-64 h-64 rounded-full border-4 border-primary/20 flex items-center justify-center bg-primary/5">
                  <img
                    src="/assets/loading_match.gif"
                    alt="Finding your tutor match"
                    className="w-48 h-48 object-contain"
                    onError={(e) => {
                      console.error('Failed to load GIF:', e);
                      // Hide the image and show fallback animation
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  {/* Fallback CSS Animation */}
                  <div className="hidden w-48 h-48 items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-primary/30 border-b-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                    </div>
                  </div>
                </div>
                {/* Pulsing ring animation */}
                <div className="absolute inset-0 w-64 h-64 rounded-full border-4 border-primary/40 animate-pulse"></div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-primary font-serif font-medium">
                  {isMatching ? "Finding your perfect tutor match..." : "Analyzing your preferences..."}
                </p>
                <p className="text-sm text-muted-foreground font-serif">
                  This process takes approximately 10 seconds
                </p>
              </div>
            </div>

            {/* Chatbot Section */}
            <div className="flex flex-col justify-start">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary font-serif">
                    While you wait, feel free to ask questions!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StudentChatbot
                    studentId={getUserId() || ""}
                    authToken={getAccessToken() || ""}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {viewState === 'matched' && tutorMatch && (
          <div className="space-y-6">
            {/* Match Found Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4">
                <GraduationCap className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-4xl font-serif font-bold text-primary">Perfect Match Found!</h2>
              <p className="text-lg text-muted-foreground font-serif">{tutorMatch.matchReason}</p>
            </div>

            {/* Tutor Profile Card */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">SM</span>
                </div>
                <CardTitle className="text-2xl font-serif text-primary">{tutorMatch.name}</CardTitle>
                <p className="text-lg font-serif text-muted-foreground">{tutorMatch.specialty}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Clock className="w-6 h-6 text-primary" />
                    <span className="text-sm font-serif text-muted-foreground">Experience</span>
                    <span className="font-serif font-medium">{tutorMatch.experience}</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                    <span className="text-sm font-serif text-muted-foreground">Rating</span>
                    <span className="font-serif font-medium">{tutorMatch.rating}/5.0</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    <span className="text-sm font-serif text-muted-foreground">Students</span>
                    <span className="font-serif font-medium">150+</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-serif font-semibold mb-2 text-primary">About Your Tutor</h3>
                  <p className="font-serif text-muted-foreground leading-relaxed">{tutorMatch.bio}</p>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 mt-4">
                  <p className="font-serif text-sm text-center text-primary font-medium">
                    🎉 Your tutor will contact you within 24 hours to schedule your first session!
                  </p>
                </div>
                <Button
                  onClick={() => setViewState('chatbot')}
                  className="w-full mt-6 text-lg font-serif py-3"
                >
                  What's Next?
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {viewState === 'chatbot' && tutorMatch && (
          <div className="space-y-6">
            {/* Quick Summary Card */}
            <Card className="border-2 border-accent bg-accent/10">
              <CardHeader>
                <CardTitle className="text-accent-foreground font-serif">You're All Set!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-serif">
                  You've been matched with {tutorMatch.name}. While you wait for them to contact you,
                  continue chatting below!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary font-serif">
                  Continue your conversation here
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StudentChatbot
                  studentId={getUserId() || ""}
                  authToken={getAccessToken() || ""}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}