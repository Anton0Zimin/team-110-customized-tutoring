from langchain.prompts import PromptTemplate
from services.langchain_service import LangChainService
from services.content_service import ContentService

class QuestionService:
    def __init__(self):
        self._prompt = PromptTemplate(
            input_variables = ["textbook_content"],
            template = """
                Human: Generate 3 multiple-choice questions (MCQs) with one correct answer and distractors. Return result in JSON.

                <example>
                {example}
                </example>
                <context>
                {textbook_content}
                </context>
                Assistant:
                """
                )

    def get_questions(self, section_id):
        lang_chain_service = LangChainService()

        content = ContentService().read_section(section_id)

        with open('content/question_example.json', 'r', encoding='utf-8') as file:
            example = file.read()

        prompt = self._prompt.format(textbook_content = content, example = example)

        return lang_chain_service.invoke_model(prompt)