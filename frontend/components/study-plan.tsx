import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Student } from "@/app/page"
import { BookOpen, Clock, Target, Lightbulb } from "lucide-react"

interface StudyPlanProps {
  student: Student
}

export function StudyPlan({ student }: StudyPlanProps) {
  // Generate AI study plan based on student data
  const generateStudyPlan = () => {
    const plans = {
      Dyslexia: {
        strategies: [
          "Use multi-sensory learning approaches",
          "Break down complex information into smaller chunks",
          "Provide visual aids and graphic organizers",
          "Allow extra time for reading and processing",
        ],
        activities: [
          "Audio recordings of key concepts",
          "Color-coded notes and materials",
          "Interactive reading exercises",
          "Mind mapping for comprehension",
        ],
      },
      ADHD: {
        strategies: [
          "Create structured, predictable routines",
          "Use frequent breaks and movement",
          "Provide clear, step-by-step instructions",
          "Minimize distractions in learning environment",
        ],
        activities: [
          "Pomodoro technique for focused study",
          "Interactive and hands-on learning",
          "Goal-setting and progress tracking",
          "Fidget tools during study sessions",
        ],
      },
      "Autism Spectrum Disorder": {
        strategies: [
          "Maintain consistent routines and structure",
          "Use clear, literal communication",
          "Provide advance notice of changes",
          "Incorporate special interests into learning",
        ],
        activities: [
          "Visual schedules and checklists",
          "Social stories for new concepts",
          "Sensory-friendly learning environment",
          "Special interest-based examples",
        ],
      },
    }

    return (
      plans[student.primary_disability as keyof typeof plans] || {
        strategies: [
          "Personalized learning approach based on individual needs",
          "Regular assessment and adjustment of methods",
          "Collaborative goal setting",
          "Strength-based learning strategies",
        ],
        activities: [
          "Customized study materials",
          "Regular progress check-ins",
          "Adaptive learning techniques",
          "Peer support integration",
        ],
      }
    )
  }

  const plan = generateStudyPlan()

  return (
    <div className="space-y-4">
      {/* Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="font-serif text-blue-800 flex items-center text-lg">
            <Target className="w-5 h-5 mr-2" />
            Personalized Learning Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-serif text-blue-700 text-sm">
            This plan is tailored for {student.primary_disability} with{" "}
            {student.learning_preferences?.style.toLowerCase()}
            learning style in a {student.learning_preferences.format.toLowerCase()} format.
          </p>
        </CardContent>
      </Card>

      {/* Learning Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-[#8B1538] flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            Recommended Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {plan.strategies.map((strategy, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-[#8B1538] rounded-full mt-2 flex-shrink-0" />
                <span className="font-serif text-sm">{strategy}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Learning Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-[#8B1538] flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Suggested Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {plan.activities.map((activity, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="font-serif text-sm">{activity}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Subject-Specific Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-[#8B1538] flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Subject Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {student.preferred_subjects.map((subject) => (
              <div key={subject} className="border-l-4 border-[#8B1538] pl-3">
                <Badge className="mb-2 font-serif">{subject}</Badge>
                <p className="font-serif text-sm text-gray-600">
                  {getSubjectRecommendation(subject, student.primary_disability)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accommodation Reminders */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="font-serif text-yellow-800">Accommodation Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {student.accommodations_needed.map((accommodation) => (
              <Badge key={accommodation} variant="outline" className="font-serif text-xs">
                {accommodation}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getSubjectRecommendation(subject: string, disability: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    Math: {
      Dyslexia: "Use visual representations and manipulatives. Break word problems into steps.",
      ADHD: "Provide frequent breaks and use interactive problem-solving methods.",
      "Autism Spectrum Disorder": "Use consistent notation and step-by-step procedures.",
      default: "Focus on conceptual understanding with multiple representation methods.",
    },
    English: {
      Dyslexia: "Use audio books and text-to-speech tools. Focus on comprehension over spelling.",
      ADHD: "Break reading into shorter segments with discussion breaks.",
      "Autism Spectrum Disorder": "Use graphic organizers and visual story maps.",
      default: "Emphasize multiple ways to express understanding and ideas.",
    },
    Science: {
      Dyslexia: "Use hands-on experiments and visual diagrams to explain concepts.",
      ADHD: "Incorporate movement and interactive demonstrations.",
      "Autism Spectrum Disorder": "Provide clear procedures and predictable lab routines.",
      default: "Use inquiry-based learning with multiple modalities.",
    },
  }

  return (
    recommendations[subject]?.[disability] ||
    recommendations[subject]?.["default"] ||
    "Adapt teaching methods to match individual learning preferences and needs."
  )
}
