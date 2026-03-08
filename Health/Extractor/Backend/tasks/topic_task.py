from crewai import Task

def create_topic_task(agent, transcript):

    return Task(
        description=f"""
        Analyze the transcript and extract the main health topics.

        Transcript:
        {transcript}

        Extract:
        - Main health topics
        - Technologies mentioned
        - Biological mechanisms
        """,
        expected_output="""
        A clear list of the main health topics discussed.
        """,
        agent=agent
    )