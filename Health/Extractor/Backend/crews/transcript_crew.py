from crewai import Crew, Process

from agents.topic_agent import create_topic_agent
from agents.insight_agent import create_insight_agent
from agents.structuring_agent import create_structuring_agent

from tasks.topic_task import create_topic_task
from tasks.insight_task import create_insight_task
from tasks.structure_task import create_structure_task


def build_transcript_crew(transcript):

    topic_agent = create_topic_agent()
    insight_agent = create_insight_agent()
    struct_agent = create_structuring_agent()

    topic_task = create_topic_task(topic_agent, transcript)
    insight_task = create_insight_task(insight_agent, transcript)
    structure_task = create_structure_task(struct_agent)

    crew = Crew(
        agents=[topic_agent, insight_agent, struct_agent],
        tasks=[topic_task, insight_task, structure_task],
        process=Process.sequential,
        verbose=True
    )

    return crew