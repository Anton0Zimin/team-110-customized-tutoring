from langchain.prompts import PromptTemplate
from services.langchain_service import LangChainService

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

    def get_questions(self):
        lang_chain_service = LangChainService()

        with open('content/24.1_says_law_and_the_macroeconomics_of_supply.txt', 'r', encoding='utf-8') as file:
            content = file.read()

        with open('content/question_example.json', 'r', encoding='utf-8') as file:
            example = file.read()

        prompt = self._prompt.format(textbook_content = content, example = example)

        return lang_chain_service.invoke_model(prompt)