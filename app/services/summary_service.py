from langchain.prompts import PromptTemplate
from services.langchain_service import LangChainService

class SummaryService:
    def __init__(self):
        self._summary_prompt = PromptTemplate(
            input_variables = ["textbook_content"],
            template = """
                Human: Generate 6 sentences summary of the text. Return result in JSON.

                <context>
                {textbook_content}
                </context>
                Assistant:
                """
                )

    def get_summary(self):
        lang_chain_service = LangChainService()

        with open('content/24.1_says_law_and_the_macroeconomics_of_supply.txt', 'r', encoding='utf-8') as file:
            content = file.read()

        prompt = self._summary_prompt.format(textbook_content = content)

        return lang_chain_service.invoke_model(prompt)

    def get_full(self):
        with open('content/24.1_says_law_and_the_macroeconomics_of_supply.txt', 'r', encoding='utf-8') as file:
            content = file.read()
            return content