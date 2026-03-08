# Transcript Crew Backend

CrewAI-powered video transcript extraction and analysis system.

## Structure

This follows the official CrewAI project structure:

```
Backend/
├── pyproject.toml              # Project dependencies & metadata
├── .env                        # API keys (copy from .env.example)
├── .env.example                # Example environment file
├── main.py                     # FastAPI entry point
├── transcripts/                # Saved transcripts
├── output/                     # CrewAI reports
└── src/
    └── transcript_crew/
        ├── __init__.py
        ├── main.py             # CLI entry point
        ├── crew.py             # Crew definition with @CrewBase
        ├── config/
        │   ├── agents.yaml     # Agent configurations
        │   └── tasks.yaml      # Task configurations
        └── tools/
            ├── __init__.py
            └── transcript_tool.py  # Transcript extraction tool
```

## Setup

1. **Install dependencies:**
   ```bash
   cd Backend
   pip install -r requirements.txt
   # OR using crewai:
   crewai install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

## Usage

### CLI

Run with default test transcript:
```bash
cd Backend/src
transcript_crew
# OR
python -m transcript_crew.main
```

Run with a video URL:
```bash
cd Backend/src
python -m transcript_crew.main --url "https://www.youtube.com/watch?v=..."
```

Run with a transcript file:
```bash
cd Backend/src
python -m transcript_crew.main --file /path/to/transcript.txt
```

### FastAPI Server

Start the server with hot reload:
```bash
cd Backend
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /extract` | Extract transcript from URL |
| `POST /analyze` | Analyze transcript with CrewAI |
| `POST /process` | Full pipeline: extract + analyze |

### Example API Calls

Extract only:
```bash
curl -X POST "http://localhost:8000/extract" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

Full pipeline (extract + CrewAI analysis):
```bash
curl -X POST "http://localhost:8000/process" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

Analyze existing transcript:
```bash
curl -X POST "http://localhost:8000/analyze" \
     -H "Content-Type: application/json" \
     -d '{"transcript": "Your transcript text here..."}'
```

## CrewAI Agents

1. **Topic Extractor** - Identifies health topics, technologies, biological mechanisms
2. **Insight Extractor** - Extracts actionable insights and recommendations
3. **Structure Specialist** - Creates professional reports from extracted data

## Output

- Transcripts are saved to `transcripts/` as JSON
- CrewAI reports are saved to `output/report.md`
