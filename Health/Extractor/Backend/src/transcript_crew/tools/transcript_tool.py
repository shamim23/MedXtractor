"""Tool for extracting transcripts from videos."""

import os
import uuid
import json
from datetime import datetime
from typing import Optional
from crewai.tools import BaseTool
from pydantic import Field

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled
import whisper


# Load Whisper Model once (lazy loading)
_model = None

def get_whisper_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base")
    return _model


# Paths
TRANSCRIPTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "transcripts")
os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)


def cleanup(file_path: str):
    """Deletes the temporary audio file after processing."""
    if os.path.exists(file_path):
        os.remove(file_path)


def save_transcript(source: str, url: str, transcript: str, video_id: str = None) -> str:
    """Saves transcript to a file in the transcripts folder."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    if video_id:
        filename = f"{video_id}_{timestamp}.json"
    else:
        unique_id = uuid.uuid4().hex[:8]
        filename = f"{unique_id}_{timestamp}.json"
    
    file_path = os.path.join(TRANSCRIPTS_DIR, filename)
    
    data = {
        "source": source,
        "url": url,
        "video_id": video_id,
        "timestamp": datetime.now().isoformat(),
        "transcript": transcript
    }
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return file_path


def download_audio(url: str) -> str:
    """Downloads audio from a URL using yt-dlp."""
    filename = f"temp_audio_{uuid.uuid4().hex}"
    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        'outtmpl': f'{filename}.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return f"{filename}.mp3"


def get_youtube_id(url: str):
    """Extracts Video ID from various YouTube URL formats."""
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info = ydl.extract_info(url, download=False)
        return info.get('id')


def extract_transcript(url: str) -> dict:
    """
    Extracts transcript from a video URL.
    Returns a dict with source, transcript, video_id, and saved_to path.
    """
    # --- STRATEGY 1: Try YouTube Native Transcript ---
    if "youtube.com" in url or "youtu.be" in url:
        try:
            video_id = get_youtube_id(url)
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            full_text = " ".join([t['text'] for t in transcript_list])
            
            # Save transcript to file
            file_path = save_transcript("youtube_api", url, full_text, video_id)
            
            return {
                "source": "youtube_api",
                "video_id": video_id,
                "transcript": full_text,
                "saved_to": file_path
            }
        except (NoTranscriptFound, TranscriptsDisabled, Exception):
            # If native transcript fails, fall back to Whisper (Strategy 2)
            pass

    # --- STRATEGY 2: AI Transcription (Facebook, Reels, or YT without captions) ---
    # Download audio
    audio_file = download_audio(url)
    
    try:
        # Transcribe using Whisper
        model = get_whisper_model()
        result = model.transcribe(audio_file)
        
        # Save transcript to file
        file_path = save_transcript("ai_whisper", url, result['text'].strip())
        
        return {
            "source": "ai_whisper",
            "url": url,
            "transcript": result['text'].strip(),
            "saved_to": file_path
        }
    finally:
        # Cleanup audio file
        cleanup(audio_file)


class TranscriptExtractionTool(BaseTool):
    """Tool for extracting transcripts from video URLs."""
    
    name: str = "Video Transcript Extractor"
    description: str = """
    Extracts transcripts from video URLs including YouTube, Facebook, Instagram, 
    and other platforms. Uses YouTube's native API when available, or Whisper AI 
    for transcription when needed.
    """
    
    def _run(self, url: str) -> str:
        """Extract transcript from the given URL.
        
        Args:
            url: Video URL to extract transcript from
            
        Returns:
            The extracted transcript text
        """
        result = extract_transcript(url)
        return result['transcript']
