from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import re
import os
from datetime import datetime, timedelta
import dateparser
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Todo AI Service", description="Japanese NLP service for todo task processing", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy Japanese model
try:
    nlp = spacy.load("ja_core_news_sm")
    print("✅ Japanese spaCy model loaded successfully!")
except OSError:
    print("❌ Japanese spaCy model not found. Run: python -m spacy download ja_core_news_sm")
    nlp = None

class TextInput(BaseModel):
    text: str

class AnalysisResult(BaseModel):
    task: str
    dueDate: str
    priority: str
    entities: list
    sentiment: list
    originalText: str
    note: str = ""

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "todo-ai-service"}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_text(input_data: TextInput):
    if not input_data.text or not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Text input is required")
    
    text = input_data.text.strip()
    
    if nlp is None:
        # Fallback without spaCy
        return AnalysisResult(
            task=text,
            dueDate="",
            priority="medium",
            entities=[],
            sentiment=[],
            originalText=text,
            note="spaCy model not available, using basic processing"
        )
    
    try:
        # Process with spaCy
        doc = nlp(text)
        
        # Extract entities from spaCy
        spacy_entities = [(ent.text, ent.label_) for ent in doc.ents]
        
        # Extract date
        due_date = extract_japanese_date(text, doc)
        
        # Determine priority
        priority = determine_priority_from_keywords(text)
        
        # Extract and clean task
        clean_task = extract_clean_task(text, due_date, doc)
        
        return AnalysisResult(
            task=clean_task or text,
            dueDate=due_date,
            priority=priority,
            entities=spacy_entities,
            sentiment=[],  # Not using sentiment for now
            originalText=text
        )
        
    except Exception as error:
        print(f"Error in spaCy processing: {error}")
        
        # Fallback to basic processing
        return AnalysisResult(
            task=text,
            dueDate="",
            priority="medium",
            entities=[],
            sentiment=[],
            originalText=text,
            note=f"Processing error: {str(error)}"
        )

def extract_japanese_date(text: str, doc) -> str:
    """Extract and convert Japanese dates"""
    
    # Custom Japanese date patterns
    japanese_date_patterns = {
        "今日": datetime.now().strftime("%Y-%m-%d"),
        "明日": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
        "明後日": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "来週": (datetime.now() + timedelta(weeks=1)).strftime("%Y-%m-%d"),
        "来月": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
    }
    
    # Check custom patterns first
    for jp_date, iso_date in japanese_date_patterns.items():
        if jp_date in text:
            return iso_date
    
    # Check spaCy entities for dates
    for ent in doc.ents:
        if ent.label_ == "DATE":
            try:
                # Use dateparser with Japanese language support
                parsed_date = dateparser.parse(ent.text, languages=['ja'])
                if parsed_date:
                    return parsed_date.strftime("%Y-%m-%d")
            except:
                continue
    
    return ""

def determine_priority_from_keywords(text: str) -> str:
    """Determine task priority based on Japanese keywords"""
    
    high_priority_keywords = ["急ぎ", "緊急", "重要", "すぐ", "至急"]
    low_priority_keywords = ["後で", "いつか", "暇な時", "時間がある時"]
    
    if any(keyword in text for keyword in high_priority_keywords):
        return "high"
    
    if any(keyword in text for keyword in low_priority_keywords):
        return "low"
    
    return "medium"

def extract_clean_task(text: str, extracted_date: str, doc) -> str:
    """Extract and clean task text using spaCy analysis"""
    
    # Remove date patterns
    task_text = text
    
    # Remove Japanese date words
    date_words = ["今日", "明日", "明後日", "来週", "来月"]
    for date_word in date_words:
        task_text = task_text.replace(date_word, "")
    
    # Remove spaCy detected date entities
    for ent in doc.ents:
        if ent.label_ == "DATE":
            task_text = task_text.replace(ent.text, "")
    
    # Remove Japanese particles and common endings
    particles_to_remove = [
        "を", "に", "で", "は", "が", "まで", "から", 
        "する", "中に", "終わらせる", "ために"
    ]
    
    for particle in particles_to_remove:
        task_text = task_text.replace(particle, "")
    
    # Clean up extra spaces and characters
    task_text = re.sub(r'\s+', ' ', task_text).strip()
    
    # If task is too short, try to extract main noun from spaCy
    if len(task_text) < 2:
        nouns = [token.text for token in doc if token.pos_ == "NOUN"]
        if nouns:
            task_text = "".join(nouns)
    
    return task_text

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 3003)))