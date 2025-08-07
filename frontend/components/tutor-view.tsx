"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TutorChatbot } from "@/components/tutor-chatbot"
import { StudyPlan } from "@/components/study-plan"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { Student } from "@/app/page"
import { LogOut, User, Clock, BookOpen, Brain } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchWithApi } from "@/lib/fetchWithToken"
import { API_BASE } from "@/lib/constants"

interface TutorViewProps {
  students2: Student[]
  currentStudent: Student | null
  onStudentSelect: (student: Student) => void
  onLogout: () => void
}

export function TutorView({ students2, currentStudent, onStudentSelect, onLogout }: TutorViewProps) {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // 1. Create an async function inside the effect
    const fetchData = async () => {
      try {
        const response = await fetchWithApi(API_BASE + "/api/students/");

        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
        else {
          console.error('Error fetching data:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // 2. Call the async function
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">O&L</span>
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold">Owl & Lion Access</h1>
              <p className="text-sm opacity-90">Tutor Dashboard</p>
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

      <main className="max-w-7xl mx-auto p-6">
        {!currentStudent ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-bold text-primary">Your Tutees</h2>
              <p className="text-muted-foreground font-serif">Select a student to view their profile and create study plans</p>
            </div>

            {students.length === 0 ? (
              <Card className="text-center p-8">
                <CardContent>
                  <User className="w-12 h-12 mx-auto text-muted mb-4" />
                  <h3 className="text-lg font-serif font-medium text-muted-foreground mb-2">No Students Yet</h3>
                  <p className="text-muted-foreground font-serif">
                    Students will appear here once they register and are matched with you.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <Card
                    key={student.student_id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary bg-card"
                    onClick={() => onStudentSelect(student)}
                  >
                    <CardHeader>
                      <CardTitle className="font-serif text-primary flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        {student.display_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-muted-foreground" />
                        <span className="font-serif text-sm">{student.primary_disability}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="font-serif text-sm">{student.learning_preferences?.style}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {student.preferred_subjects.slice(0, 3).map((subject) => (
                          <Badge key={subject} variant="secondary" className="font-serif text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {student.preferred_subjects.length > 3 && (
                          <Badge variant="secondary" className="font-serif text-xs">
                            +{student.preferred_subjects.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-serif">
                          {student.learning_preferences?.modality} • {student.learning_preferences?.format}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <Button onClick={() => onStudentSelect(null as any)} variant="outline" className="font-serif">
              ← Back to Students
            </Button>

            {/* Student Profile Summary */}
            <Card className="border-2 border-[#8B1538] dark:border-primary">
              <CardHeader className="bg-[#8B1538] dark:bg-primary text-white">
                <CardTitle className="font-serif flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Student Profile: {currentStudent.display_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-serif font-medium text-[#8B1538] dark:text-primary mb-2">Disability & Accommodations</h4>
                    <p className="font-serif text-sm mb-2">
                      <strong>Primary:</strong> {currentStudent.primary_disability}
                    </p>
                    <div className="space-y-1">
                      {currentStudent.accommodations_needed.map((acc) => (
                        <Badge key={acc} variant="outline" className="font-serif text-xs mr-1 mb-1">
                          {acc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif font-medium text-[#8B1538] dark:text-primary mb-2">Learning Preferences</h4>
                    <div className="space-y-1 font-serif text-sm">
                      <p>
                        <strong>Style:</strong> {currentStudent.learning_preferences?.style}
                      </p>
                      <p>
                        <strong>Format:</strong> {currentStudent.learning_preferences?.format}
                      </p>
                      <p>
                        <strong>Modality:</strong> {currentStudent.learning_preferences?.modality}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif font-medium text-[#8B1538] dark:text-primary mb-2">Subjects & Availability</h4>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {currentStudent.preferred_subjects.map((subject) => (
                          <Badge key={subject} className="font-serif text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                      <p className="font-serif text-xs text-muted-foreground">
                        {currentStudent.availability.length} time slots available
                      </p>
                    </div>
                  </div>
                </div>

                {currentStudent.additional_info && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-serif font-medium text-[#8B1538] dark:text-primary mb-2">Additional Information</h4>
                    <p className="font-serif text-sm text-muted-foreground">{currentStudent.additional_info}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 50/50 Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Study Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-[#8B1538] dark:text-primary">AI-Generated Study Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <StudyPlan student={currentStudent} />
                </CardContent>
              </Card>

              {/* Chatbot */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-[#8B1538] dark:text-primary">Clarifications & Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <TutorChatbot student={currentStudent} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
