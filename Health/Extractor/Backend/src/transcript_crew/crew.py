"""Transcript Crew definition with @CrewBase decorator."""

from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List


@CrewBase
class TranscriptCrew:
    """TranscriptCrew for analyzing health-related transcripts.
    
    This crew extracts topics, insights, and creates structured reports
    from health and medical discussion transcripts.
    """
    
    agents: List[BaseAgent]
    tasks: List[Task]
    
    @agent
    def topic_extractor(self) -> Agent:
        """Agent for extracting health topics from transcripts."""
        return Agent(
            config=self.agents_config['topic_extractor'],
            verbose=True
        )
    
    @agent
    def insight_extractor(self) -> Agent:
        """Agent for extracting actionable insights from transcripts."""
        return Agent(
            config=self.agents_config['insight_extractor'],
            verbose=True
        )
    
    @agent
    def structure_specialist(self) -> Agent:
        """Agent for structuring content into professional reports."""
        return Agent(
            config=self.agents_config['structure_specialist'],
            verbose=True
        )
    
    @task
    def topic_extraction_task(self) -> Task:
        """Task to extract health topics from the transcript."""
        return Task(
            config=self.tasks_config['topic_extraction_task']
        )
    
    @task
    def insight_extraction_task(self) -> Task:
        """Task to extract actionable insights from the transcript."""
        return Task(
            config=self.tasks_config['insight_extraction_task']
        )
    
    @task
    def structure_report_task(self) -> Task:
        """Task to create a structured report from extracted information."""
        return Task(
            config=self.tasks_config['structure_report_task'],
            output_file='output/report.md'
        )
    
    @crew
    def crew(self) -> Crew:
        """Creates the TranscriptCrew with sequential process.
        
        The crew works sequentially:
        1. Topic extraction
        2. Insight extraction (uses topic context)
        3. Report structuring (uses both previous outputs)
        """
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
