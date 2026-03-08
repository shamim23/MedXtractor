from crewai import Agent
from config.llm import get_llm

def create_topic_agent():

    return Agent(
        role="Health Topic Extraction Specialist",
        goal="Identify the main health topics discussed in transcripts",
        backstory="""
        You are an expert in biomedical and longevity research analysis.
        You specialize in identifying key health themes discussed in
        podcasts, interviews, and medical discussions.
        """,
        llm=get_llm(),
        verbose=True
    )