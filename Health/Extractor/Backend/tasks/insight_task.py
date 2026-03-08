from crewai import Task

def create_insight_task(agent, transcript):

    return Task(
        description=f"""
        Extract the key health insights from the transcript.

        Transcript:
        {transcript}

        Focus on:
        - major health claims
        - longevity techniques
        - therapies
        - interventions
        """,
        expected_output="""
        A list of the key insights discussed in the transcript.
        """,
        agent=agent
    )