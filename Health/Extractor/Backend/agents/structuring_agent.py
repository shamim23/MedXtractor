from crewai import Agent
from config.llm import get_llm

def create_structuring_agent():

    return Agent(
        role="Health Knowledge Structuring Specialist",
        goal="Convert extracted transcript information into structured JSON",
        backstory="""
        You organize health insights into structured formats suitable
        for databases and knowledge graphs.
        """,
        llm=get_llm(),
        verbose=True
    )