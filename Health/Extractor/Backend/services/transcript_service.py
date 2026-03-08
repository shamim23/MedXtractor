from crews.transcript_crew import build_transcript_crew

def analyze_transcript(transcript: str):

    crew = build_transcript_crew(transcript)

    result = crew.kickoff()

    return result