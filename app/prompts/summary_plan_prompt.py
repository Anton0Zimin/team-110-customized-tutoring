# Optimized Study Plan Prompt - Concise and Focused
kb_prompt = """
Create a personalized study plan using the provided documents:
$search_results$

Student Profile: {disability} | {learning_style} | {format} | {accommodations}
Subject: {subject}

Return JSON with:
- overview: 2-sentence learning approach summary
- strategies: 4 disability-specific teaching methods
- activities: 4 accessible learning activities
- subjectAdaptations: subject-specific modifications
- accommodations: practical implementation steps

Be concise and specific. Return only relevant information without extra dialogue or fluff.

<schema>
{
    "overview": "concise learning approach",
    "strategies": ["strategy1", "strategy2", "strategy3", "strategy4"],
    "activities": ["activity1", "activity2", "activity3", "activity4"],
    "subjectAdaptations": [
        {"subject": "subject", "recommendation": "specific adaptation"}
    ],
    "accommodations": ["step1", "step2", "step3"]
}
</schema>
"""