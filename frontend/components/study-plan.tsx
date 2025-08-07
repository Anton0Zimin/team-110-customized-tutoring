import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Student } from "@/app/page"
import { BookOpen, Clock, Target, Lightbulb } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchWithApi } from "@/lib/fetchWithToken"
import { API_BASE } from "@/lib/constants"

interface StudyPlanProps {
  student: Student
}

interface StudyPlanData {
  overview: string;
  strategies: string[];
  activities: string[];
  subjectAdaptations: { subject: string; recommendation: string }[];
  accommodations: string[];
}

export function StudyPlan({ student }: StudyPlanProps) {
  const [studyPlanData, setStudyPlanData] = useState<StudyPlanData>({
    overview: "⌛ Loading personalized study plan...",
    strategies: [],
    activities: [],
    subjectAdaptations: [],
    accommodations: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudyPlan() {
      if (!student.student_id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchWithApi(`${API_BASE}/api/chat/${student.student_id}/summary`);
        const json = await response.json();
        
        const parsedData = parseStudyPlanResponse(json.summary || json.response);
        setStudyPlanData(parsedData);
      } catch (error) {
        console.error("Error fetching study plan:", error);
        setStudyPlanData({
          overview: "Error loading study plan. Please try again later.",
          strategies: [],
          activities: [],
          subjectAdaptations: [],
          accommodations: []
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudyPlan();
  }, [student.student_id]);

  // Parse the LLM response into structured data
  function parseStudyPlanResponse(response: string): StudyPlanData {
    const sections = {
      overview: "",
      strategies: [] as string[],
      activities: [] as string[],
      subjectAdaptations: [] as { subject: string; recommendation: string }[],
      accommodations: [] as string[]
    };

    const lines = response.split('\n').filter(line => line.trim());
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('PERSONALIZED LEARNING OVERVIEW') || trimmedLine.includes('**PERSONALIZED LEARNING OVERVIEW**')) {
        currentSection = 'overview';
        continue;
      } else if (trimmedLine.includes('CORE LEARNING STRATEGIES') || trimmedLine.includes('**CORE LEARNING STRATEGIES**')) {
        currentSection = 'strategies';
        continue;
      } else if (trimmedLine.includes('RECOMMENDED ACTIVITIES') || trimmedLine.includes('**RECOMMENDED ACTIVITIES**')) {
        currentSection = 'activities';
        continue;
      } else if (trimmedLine.includes('SUBJECT-SPECIFIC ADAPTATIONS') || trimmedLine.includes('**SUBJECT-SPECIFIC ADAPTATIONS**')) {
        currentSection = 'subjectAdaptations';
        continue;
      } else if (trimmedLine.includes('ACCOMMODATION IMPLEMENTATION') || trimmedLine.includes('**ACCOMMODATION IMPLEMENTATION**')) {
        currentSection = 'accommodations';
        continue;
      }

      // Skip empty lines and headers
      if (!trimmedLine || trimmedLine.startsWith('**') || trimmedLine.startsWith('#')) {
        continue;
      }

      // Parse content based on current section
      if (currentSection === 'overview' && trimmedLine) {
        sections.overview += (sections.overview ? ' ' : '') + trimmedLine;
      } else if (currentSection === 'strategies' && trimmedLine.startsWith('-')) {
        sections.strategies.push(trimmedLine.substring(1).trim());
      } else if (currentSection === 'activities' && trimmedLine.startsWith('-')) {
        sections.activities.push(trimmedLine.substring(1).trim());
      } else if (currentSection === 'subjectAdaptations') {
        if (trimmedLine.startsWith('-')) {
          sections.accommodations.push(trimmedLine.substring(1).trim());
        } else if (trimmedLine.includes(':')) {
          const [subject, recommendation] = trimmedLine.split(':', 2);
          sections.subjectAdaptations.push({
            subject: subject.trim(),
            recommendation: recommendation.trim()
          });
        }
      } else if (currentSection === 'accommodations' && trimmedLine.startsWith('-')) {
        sections.accommodations.push(trimmedLine.substring(1).trim());
      }
    }

    // If parsing fails, extract basic content
    if (!sections.overview && !sections.strategies.length) {
      sections.overview = response.length > 500 ? response.substring(0, 500) + "..." : response;
    }

    return sections;
  }

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
          <p className="font-serif text-blue-700 mb-3">{studyPlanData.overview}</p>
          <p className="font-serif text-blue-600 text-sm">
            This plan is tailored for {student.primary_disability} with{" "}
            {student.learning_preferences?.style.toLowerCase()} learning style in a{" "}
            {student.learning_preferences?.format.toLowerCase()} format.
          </p>
        </CardContent>
      </Card>

      {/* Learning Strategies */}
      {studyPlanData.strategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-[#8B1538] flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Core Learning Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {studyPlanData.strategies.map((strategy, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#8B1538] rounded-full mt-2 flex-shrink-0" />
                  <span className="font-serif text-sm">{strategy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Learning Activities */}
      {studyPlanData.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-[#8B1538] flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Recommended Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {studyPlanData.activities.map((activity, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="font-serif text-sm">{activity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Subject-Specific Adaptations */}
      {studyPlanData.subjectAdaptations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-[#8B1538] flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Subject-Specific Adaptations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studyPlanData.subjectAdaptations.map((adaptation, index) => (
                <div key={index} className="border-l-4 border-[#8B1538] pl-3">
                  <Badge className="mb-2 font-serif">{adaptation.subject}</Badge>
                  <p className="font-serif text-sm text-gray-600">
                    {adaptation.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-[#8B1538] flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Subject Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.preferred_subjects?.map((subject) => (
                <div key={subject} className="border-l-4 border-[#8B1538] pl-3">
                  <Badge className="mb-2 font-serif">{subject}</Badge>
                  <p className="font-serif text-sm text-gray-600">
                    Personalized strategies for {subject} will be included in your detailed study plan.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accommodation Implementation */}
      {studyPlanData.accommodations.length > 0 ? (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="font-serif text-yellow-800">Accommodation Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {studyPlanData.accommodations.map((accommodation, index) => (
                <li key={index} className="font-serif text-sm text-yellow-800">
                  • {accommodation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="font-serif text-yellow-800">Required Accommodations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {student.accommodations_needed?.map((accommodation) => (
                <Badge key={accommodation} variant="outline" className="font-serif text-xs">
                  {accommodation}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
