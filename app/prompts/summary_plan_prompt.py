kb_prompt = """
Answer the provided question using only the provided documents:
$search_results$

Format the response in JSON according to schema.

<schema>
{
    "overview": "overview section",
    "strategies": [
        "item1",
        "item2",
        "item3"
    ],
    "activities": [
        "item1",
        "item2",
        "item3"
    ],
    "subjectAdaptations": [
        {
            "subject": "subject1",
            "recommendation": "recommendation1"
        },
        {
            "subject": "subject2",
            "recommendation": "recommendation2"
        },
        {
            "subject": "subject3",
            "recommendation": "recommendation3"
        }
    ],
    "accommodations": [
        "item1",
        "item2",
        "item3"
    ]
}
</schema>
"""