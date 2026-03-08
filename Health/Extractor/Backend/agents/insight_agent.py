from crewai import Agent
from config.llm import get_llm

def create_insight_agent():

    return Agent(
        role="Health Insight Analyst",
        goal="Extract important insights, claims, and interventions from transcripts",
        backstory="""
        You analyze health interviews and identify the most important
        health insights, interventions, therapies, and biological
        mechanisms discussed.
        """,
        llm=get_llm(),
        verbose=True
    )