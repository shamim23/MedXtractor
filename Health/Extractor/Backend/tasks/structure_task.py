from crewai import Task

def create_structure_task(agent):

    return Task(
        description="""
        Convert the previously extracted insights and topics
        into structured JSON.

        The JSON should contain:
        - topics
        - key insights
        - interventions
        """,
        expected_output="""
        A structured JSON summary of the transcript.
        """,
        agent=agent
    )