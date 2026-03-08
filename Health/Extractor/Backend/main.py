"""FastAPI entry point with Transcript Crew integration."""

import os
import sys

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional

from transcript_crew.crew import TranscriptCrew
from transcript_crew.tools.transcript_tool import extract_transcript

app = FastAPI(
    title="Video Transcript Extractor with CrewAI",
    description="Extract and analyze video transcripts using AI agents",
    version="0.2.0"
)


class URLRequest(BaseModel):
    url: str = Field(..., description="URL of the video to process")


class TranscriptRequest(BaseModel):
    transcript: str = Field(..., description="Direct transcript text to analyze")


class AnalysisResponse(BaseModel):
    source: str
    video_id: Optional[str] = None
    transcript: str
    saved_to: Optional[str] = None
    analysis: Optional[str] = None


@app.post("/extract", response_model=AnalysisResponse)
async def extract_only(request: URLRequest):
    """Extract transcript from video URL without CrewAI analysis."""
    try:
        result = extract_transcript(request.url)
        return AnalysisResponse(
            source=result['source'],
            video_id=result.get('video_id'),
            transcript=result['transcript'],
            saved_to=result.get('saved_to')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.post("/analyze")
async def analyze_transcript(request: TranscriptRequest):
    """Analyze a transcript using the Transcript Crew."""
    try:
        # Create output directory
        os.makedirs('output', exist_ok=True)
        
        inputs = {'transcript': request.transcript}
        
        # Run the crew
        result = TranscriptCrew().crew().kickoff(inputs=inputs)
        
        return JSONResponse(content={
            "analysis": result.raw,
            "report_saved_to": "output/report.md"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/process")
async def full_pipeline(request: URLRequest, background_tasks: BackgroundTasks):
    """Full pipeline: Extract transcript + CrewAI analysis."""
    try:
        # Step 1: Extract transcript
        extraction = extract_transcript(request.url)
        
        # Step 2: Run CrewAI analysis
        os.makedirs('output', exist_ok=True)
        inputs = {'transcript': extraction['transcript']}
        crew_result = TranscriptCrew().crew().kickoff(inputs=inputs)
        
        return JSONResponse(content={
            "source": extraction['source'],
            "video_id": extraction.get('video_id'),
            "transcript_saved_to": extraction.get('saved_to'),
            "transcript_preview": extraction['transcript'][:500] + "..." if len(extraction['transcript']) > 500 else extraction['transcript'],
            "analysis": crew_result.raw,
            "report_saved_to": "output/report.md"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "Video Transcript Extractor with CrewAI",
        "endpoints": {
            "/extract": "Extract transcript from URL",
            "/analyze": "Analyze transcript with CrewAI",
            "/process": "Full pipeline: extract + analyze"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
