from fastapi import APIRouter
from schemas.transcript_schema import TranscriptRequest
from services.transcript_service import analyze_transcript

router = APIRouter()

@router.post("/analyze-transcript")
async def analyze(data: TranscriptRequest):
    result = analyze_transcript(data.transcript)
    return resultfrom fastapi import APIRouter
from schemas.transcript_schema import TranscriptRequest
from services.transcript_service import analyze_transcript

router = APIRouter()

@router.post("/analyze-transcript")
async def analyze(data: TranscriptRequest):
    result = analyze_transcript(data.transcript)
    return result