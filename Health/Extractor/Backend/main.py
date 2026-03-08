import os
import uuid
import json
from datetime import datetime
import whisper
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled
import yt_dlp

# Ensure transcripts directory exists
TRANSCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "transcripts")
os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

app = FastAPI(title="Video Transcript Extractor")

# Load Whisper Model (Base is fast and relatively accurate)
# Options: 'tiny', 'base', 'small', 'medium', 'large'
model = whisper.load_model("base")

class URLRequest(BaseModel):
    url: str

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

@app.post("/transcript")
async def extract_transcript(request: URLRequest, background_tasks: BackgroundTasks):
    url = request.url
    
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
    try:
        # Download audio
        audio_file = download_audio(url)
        
        # Schedule deletion of file after the request is done
        background_tasks.add_task(cleanup, audio_file)

        # Transcribe using Whisper
        result = model.transcribe(audio_file)
        
        # Save transcript to file
        file_path = save_transcript("ai_whisper", url, result['text'].strip())
        
        return {
            "source": "ai_whisper",
            "url": url,
            "transcript": result['text'].strip(),
            "saved_to": file_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)