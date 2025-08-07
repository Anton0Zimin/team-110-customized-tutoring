"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Student } from "@/app/page"
import { Upload, X } from "lucide-react"
import { fetchWithApi } from "@/lib/fetchWithToken"
import { getUserId } from "@/lib/globals"
import { API_BASE } from "@/lib/constants"

interface StudentRegistrationFormProps {
  onSubmit: (student: Student) => void
}

const DISABILITIES = [
  "Dyslexia",
  "ADHD",
  "Autism Spectrum Disorder",
  "Visual Impairment",
  "Hearing Impairment",
  "Physical Disability",
  "Learning Disability",
  "Other",
]

const ACCOMMODATIONS = [
  "Extended time for assignments",
  "Alternative assessment formats",
  "Flexible scheduling",
  "Note-taking assistance",
  "Audio recordings of lectures",
  "Large print materials",
  "Sign language interpreter",
  "Assistive technology",
]

const LEARNING_STYLES = ["Visual Learning", "Auditory Learning", "Hands-on Learning", "Reading/Writing", "Combination"]

const LEARNING_FORMATS = ["1-on-1", "Small Group", "Study Group"]

const MODALITIES = ["In-person", "Online", "Hybrid"]

const SUBJECTS = ["Math", "English", "Science", "History", "Computer Science"]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function StudentRegistrationForm({ onSubmit }: StudentRegistrationFormProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    student_id: "",
    display_name: "",
    email: "",
    accommodations_needed: [],
    learning_preferences: {
      style: "",
      format: "",
      modality: "",
    },
    availability: [],
    preferred_subjects: [],
    additional_info: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Validation state for FHDA ID
  const isFhdaIdValid = formData.student_id && formData.student_id.length === 8 && /^\d{8}$/.test(formData.student_id)

  const handleAccommodationChange = (accommodation: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      accommodations_needed: checked
        ? [...(prev.accommodations_needed || []), accommodation]
        : (prev.accommodations_needed || []).filter((a) => a !== accommodation),
    }))
  }

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferred_subjects: checked
        ? [...(prev.preferred_subjects || []), subject]
        : (prev.preferred_subjects || []).filter((s) => s !== subject),
    }))
  }

  const handleAvailabilityChange = (day: string, field: "start_time" | "end_time", value: string) => {
    setFormData((prev) => {
      const availability = prev.availability || []
      const existingIndex = availability.findIndex((a) => a.day === day)

      if (existingIndex >= 0) {
        const updated = [...availability]
        updated[existingIndex] = { ...updated[existingIndex], [field]: value }
        return { ...prev, availability: updated }
      } else {
        const newAvailability = { day, start_time: "", end_time: "" }
        newAvailability[field] = value
        return {
          ...prev,
          availability: [...availability, newAvailability],
        }
      }
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate FHDA ID is exactly 8 digits
    if (!formData.student_id || formData.student_id.length !== 8 || !/^\d{8}$/.test(formData.student_id)) {
      alert('Please enter a valid 8-digit FHDA ID')
      return
    }

    if (formData.primary_disability && formData.learning_preferences?.style) {
      onSubmit({
        ...formData,
        uploaded_files: uploadedFiles,
      } as Student)
    }
  }

  async function fetchStudentInfo() {
    const studentId = getUserId();
    const response = await fetchWithApi(`${API_BASE}/api/students/${studentId}`);
    const json = await response.json();
    setFormData(json);
  }

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-primary">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="student_id" className="font-serif">
              FHDA ID
            </Label>
            <Input
              id="student_id"
              value={formData.student_id}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                setFormData((prev) => ({ ...prev, student_id: value }));
              }}
              className={`font-serif ${isFhdaIdValid ? 'border-green-500 focus:border-green-500' : formData.student_id ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="Enter your 8-digit FHDA ID"
              maxLength={8}
              pattern="[0-9]{8}"
              title="Please enter exactly 8 digits"
              required
            />
            <p className={`text-sm font-serif mt-1 ${isFhdaIdValid ? 'text-green-600' : formData.student_id ? 'text-red-600' : 'text-gray-500'}`}>
              {isFhdaIdValid
                ? '✓ Valid FHDA ID'
                : formData.student_id
                  ? 'Please enter exactly 8 digits'
                  : 'Your FHDA ID is an 8-digit number assigned by the college'
              }
            </p>
          </div>

          <div>
            <Label htmlFor="display_name" className="font-serif">
              Display Name (Preferred Name to be Called)
            </Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
              className="font-serif"
              placeholder="Enter your preferred display name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="font-serif">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="font-serif"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div>
            <Label className="font-serif">Primary Disability *</Label>
            <Select
              value={formData.primary_disability}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, primary_disability: value }))}
              required
            >
              <SelectTrigger className="font-serif">
                <SelectValue placeholder="Select your primary disability" />
              </SelectTrigger>
              <SelectContent>
                {DISABILITIES.map((disability) => (
                  <SelectItem key={disability} value={disability} className="font-serif">
                    {disability}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-primary">Accommodations Needed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACCOMMODATIONS.map((accommodation) => (
              <div key={accommodation} className="flex items-center space-x-2">
                <Checkbox
                  id={accommodation}
                  checked={(formData.accommodations_needed || []).includes(accommodation)}
                  onCheckedChange={(checked) => handleAccommodationChange(accommodation, checked as boolean)}
                />
                <Label htmlFor={accommodation} className="font-serif text-sm">
                  {accommodation}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-primary">Learning Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="font-serif font-medium">Learning Style *</Label>
            <RadioGroup
              value={formData.learning_preferences?.style}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  learning_preferences: { ...prev.learning_preferences!, style: value },
                }))
              }
              className="mt-2"
            >
              {LEARNING_STYLES.map((style) => (
                <div key={style} className="flex items-center space-x-2">
                  <RadioGroupItem value={style} id={style} />
                  <Label htmlFor={style} className="font-serif">
                    {style}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="font-serif font-medium">Learning Format *</Label>
            <RadioGroup
              value={formData.learning_preferences?.format}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  learning_preferences: { ...prev.learning_preferences!, format: value },
                }))
              }
              className="mt-2"
            >
              {LEARNING_FORMATS.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <RadioGroupItem value={format} id={format} />
                  <Label htmlFor={format} className="font-serif">
                    {format}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="font-serif font-medium">Modality Preference *</Label>
            <RadioGroup
              value={formData.learning_preferences?.modality}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  learning_preferences: { ...prev.learning_preferences!, modality: value },
                }))
              }
              className="mt-2"
            >
              {MODALITIES.map((modality) => (
                <div key={modality} className="flex items-center space-x-2">
                  <RadioGroupItem value={modality} id={modality} />
                  <Label htmlFor={modality} className="font-serif">
                    {modality}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-primary">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label className="font-serif font-medium">{day}</Label>
                <div>
                  <Label htmlFor={`${day}-start`} className="font-serif text-sm">
                    Start Time
                  </Label>
                  <Input
                    id={`${day}-start`}
                    type="time"
                    value={(formData.availability || []).find((a) => a.day === day)?.start_time || ""}
                    onChange={(e) => handleAvailabilityChange(day, "start_time", e.target.value)}
                    className="font-serif"
                  />
                </div>
                <div>
                  <Label htmlFor={`${day}-end`} className="font-serif text-sm">
                    End Time
                  </Label>
                  <Input
                    id={`${day}-end`}
                    type="time"
                    value={(formData.availability || []).find((a) => a.day === day)?.end_time || ""}
                    onChange={(e) => handleAvailabilityChange(day, "end_time", e.target.value)}
                    className="font-serif"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-primary">Preferred Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject}
                  checked={(formData.preferred_subjects || []).includes(subject)}
                  onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                />
                <Label htmlFor={subject} className="font-serif">
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-primary">Upload Materials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="font-serif text-gray-600 mb-2">Drag and drop homework or lecture materials here</p>
            <Input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
            <Label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 font-serif"
            >
              Choose Files
            </Label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="font-serif font-medium">Uploaded Files:</Label>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-serif text-sm">{file.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-primary">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Please share any additional learning needs, goals, or challenges..."
            value={formData.additional_info}
            onChange={(e) => setFormData((prev) => ({ ...prev, additional_info: e.target.value }))}
            className="font-serif min-h-[100px]"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif px-8 py-2">
            Submit Registration
          </Button>
        </div>
        <p className="text-sm text-gray-600 font-serif text-center">
          By submitting this form, I consent to the collection and use of my personal data, including disability-related information and learning preferences,
          for the sole purpose of matching me with appropriate tutoring services and creating personalized study plans.
          This data will be shared only with assigned tutors and authorized college staff.
        </p>
      </div>
    </form>
  )
}
