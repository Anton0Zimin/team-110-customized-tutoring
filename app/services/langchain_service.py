import boto3
from langchain.prompts import PromptTemplate
from langchain_aws import ChatBedrock
from langchain_core.output_parsers import StrOutputParser
from fastapi import HTTPException
import botocore.exceptions

class LangChainService:
    def __init__(self):
        self._bedrock_client = boto3.client("bedrock-runtime", region_name="us-west-2")

        model_id = "anthropic.claude-3-5-sonnet-20241022-v2:0"
        model_kwargs = {
            "temperature": 0,
            "top_p": 1,
            "anthropic_version": "bedrock-2023-05-31",
        }

        # LangChain class for chat
        self._chat_model = ChatBedrock(
            client = self._bedrock_client,
            model_id = model_id,
            model_kwargs = model_kwargs,
        )

    def invoke_model(self, prompt):
        try:
            # invoke
            response = self._chat_model.invoke(prompt)

            # Configure a Chain to parse output
            chain = StrOutputParser()
            formatted_response = chain.invoke(response)
            return formatted_response
        except botocore.exceptions.ClientError as error:
            error_code = error.response['Error']['Code']
            raise HTTPException(status_code=500, detail=f"Error invoking model: {error_code}") from error
