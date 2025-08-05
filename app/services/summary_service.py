from langchain.prompts import PromptTemplate
from services.langchain_service import LangChainService
from services.content_service import ContentService

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

    def get_summary(self, section_id):
        lang_chain_service = LangChainService()

        content = ContentService().read_section(section_id)
        prompt = self._summary_prompt.format(textbook_content = content)

        return lang_chain_service.invoke_model(prompt)

    def get_full(self, section_id):
        return ContentService().read_section(section_id)