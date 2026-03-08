#!/usr/bin/env python
"""Main entry point for Transcript Crew."""

import os
import sys
from typing import Optional

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from transcript_crew.crew import TranscriptCrew


def run(transcript: Optional[str] = None) -> str:
    """Run the transcript crew with the provided transcript.
    
    Args:
        transcript: The transcript text to analyze
        
    Returns:
        The final structured report as a string
    """
    # Create output directory
    os.makedirs('output', exist_ok=True)
    
    # Default transcript for testing
    if transcript is None:
        transcript = """
        In this episode, Dr. Smith discusses the benefits of intermittent fasting 
        for longevity. He explains that autophagy is triggered after 16-18 hours 
        of fasting, which helps clear damaged cellular components. He recommends 
        starting with a 16:8 fasting schedule and gradually extending to 18:6. 
        He also mentions that NAD+ levels decline with age, and supplements like 
        NMN and NR can help boost NAD+ production. For exercise, he suggests 
        resistance training 3-4 times per week combined with zone 2 cardio for 
        optimal mitochondrial health.
        """
    
    inputs = {
        'transcript': transcript
    }
    
    # Create and run the crew
    result = TranscriptCrew().crew().kickoff(inputs=inputs)
    
    print("\n\n=== FINAL REPORT ===\n\n")
    print(result.raw)
    print("\n\nReport has been saved to output/report.md")
    
    return result.raw


def run_with_video_url(url: str) -> str:
    """Extract transcript from URL and run the crew.
    
    Args:
        url: Video URL (YouTube, Facebook, etc.)
        
    Returns:
        The final structured report as a string
    """
    from transcript_crew.tools.transcript_tool import extract_transcript
    
    print(f"Extracting transcript from: {url}")
    result = extract_transcript(url)
    
    print(f"Transcript extracted using: {result['source']}")
    print(f"Transcript length: {len(result['transcript'])} characters")
    
    return run(transcript=result['transcript'])


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Run Transcript Crew')
    parser.add_argument('--url', '-u', help='Video URL to extract transcript from')
    parser.add_argument('--file', '-f', help='Path to transcript text file')
    
    args = parser.parse_args()
    
    if args.url:
        run_with_video_url(args.url)
    elif args.file:
        with open(args.file, 'r') as f:
            transcript = f.read()
        run(transcript)
    else:
        # Run with default/test transcript
        run()
