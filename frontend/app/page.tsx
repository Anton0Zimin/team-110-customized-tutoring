"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/login-screen"
import { StudentView } from "@/components/student-view"
import { TutorView } from "@/components/tutor-view"
import { RegistrationSuccessModal } from "@/components/registration-success-modal"
import { fetchWithApi, setAccessToken } from "@/lib/fetchWithToken"
import { API_BASE } from "@/lib/constants"

export type UserRole = "student" | "tutor" | null

export interface Student {
  student_id: string
  display_name: string
  email: string
  primary_disability: string
  accommodations_needed: string[]
  learning_preferences: {
    style: string
    format: string
    modality: string
  }
  availability: Array<{
    day: string
    start_time: string
    end_time: string
  }>
  preferred_subjects: string[]
  additional_info: string
  uploaded_files?: File[]
}

export default function Home() {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleLogin = (role: UserRole) => {
    setUserRole(role)
  }

  const handleStudentRegistration = async (studentData: Student) => {
    try {
      const response = await fetchWithApi(API_BASE + `/api/students/${studentData.student_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error submitting student registration:', errorData);
        alert('Registration failed: ' + (errorData.message || JSON.stringify(errorData)));
        return;
      }

      setStudents((prev) => [...prev, studentData]);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Network error submitting student registration:', error);
      alert('Registration failed due to a network error. Please try again.');
    }
  }

  const handleLogout = () => {
    setAccessToken("");
    setUserRole(null);
    setCurrentStudent(null);
  }

  if (!userRole) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (userRole === "student") {
    return (
      <>
        <StudentView onRegistration={handleStudentRegistration} onLogout={handleLogout} />
        <RegistrationSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      </>
    )
  }

  return (
    <TutorView
      students2={students}
      currentStudent={currentStudent}
      onStudentSelect={setCurrentStudent}
      onLogout={handleLogout}
    />
  )
}
