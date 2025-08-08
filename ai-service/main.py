from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import re
import os
from datetime import datetime, timedelta
import dateparser
import pytz
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

# Load spaCy models
nlp_ja = None
nlp_en = None

try:
    nlp_ja = spacy.load("ja_core_news_sm")
    print("✅ Japanese spaCy model loaded successfully!")
except OSError:
    print("❌ Japanese spaCy model not found. Run: python -m spacy download ja_core_news_sm")

try:
    nlp_en = spacy.load("en_core_web_sm")
    print("✅ English spaCy model loaded successfully!")
except OSError:
    print("❌ English spaCy model not found. Run: python -m spacy download en_core_web_sm")

# Use Japanese model as primary, fallback to English
nlp = nlp_ja or nlp_en

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
        # Detect if text contains Japanese characters
        has_japanese = bool(re.search(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]', text))
        
        print(f"Processing text: '{text}', has_japanese: {has_japanese}")
        
        # Choose appropriate spaCy model
        if has_japanese and nlp_ja:
            print("Using Japanese spaCy model")
            doc = nlp_ja(text)
        elif nlp_en:
            print("Using English spaCy model")
            doc = nlp_en(text)
        elif nlp:
            print("Using fallback spaCy model")
            doc = nlp(text)
        else:
            # No spaCy models available
            print("No spaCy models available")
            return AnalysisResult(
                task=text,
                dueDate="",
                priority="medium",
                entities=[],
                sentiment=[],
                originalText=text,
                note="spaCy models not available, using basic processing"
            )
        
        # Extract entities from spaCy
        spacy_entities = [(ent.text, ent.label_) for ent in doc.ents]
        
        # Extract date
        due_date = extract_date(text, doc)
        print(f"Extracted due_date: '{due_date}'")
        print(f"Detected entities: {spacy_entities}")
        
        # Extract and clean task
        clean_task = extract_clean_task(text, due_date, doc)
        
        return AnalysisResult(
            task=clean_task or text,
            dueDate=due_date,
            priority="medium",  # Default priority, not analyzed
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

def extract_date(text: str, doc) -> str:
    """Extract and convert dates using dateparser with Japanese and English support"""
    
    # Use Asia/Tokyo timezone for consistent date parsing
    jst = pytz.timezone('Asia/Tokyo')
    now_jst = datetime.now(jst)
    print(f"Date extraction for: '{text}', now_jst: {now_jst}")
    
    # Try dateparser with simple settings
    try:
        parsed_date = dateparser.parse(text, languages=['ja', 'en'], settings={
            'PREFER_DATES_FROM': 'future',
            'RELATIVE_BASE': now_jst,
            'TIMEZONE': 'Asia/Tokyo'
        })
        
        print(f"Dateparser result: {parsed_date}")
        if parsed_date:
            # Convert to JST and format as date only
            if parsed_date.tzinfo is None:
                parsed_date = jst.localize(parsed_date)
            else:
                parsed_date = parsed_date.astimezone(jst)
            result = parsed_date.strftime("%Y-%m-%d")
            print(f"Formatted date: {result}")
            return result
    except Exception as e:
        print(f"Dateparser error: {e}")
    
    # Check spaCy entities for dates as fallback
    print(f"spaCy entities found: {[(ent.text, ent.label_) for ent in doc.ents]}")
    for ent in doc.ents:
        if ent.label_ == "DATE":
            try:
                parsed_date = dateparser.parse(ent.text, languages=['ja', 'en'], settings={
                    'RELATIVE_BASE': now_jst,
                    'TIMEZONE': 'Asia/Tokyo'
                })
                print(f"spaCy entity '{ent.text}' parsed as: {parsed_date}")
                if parsed_date:
                    if parsed_date.tzinfo is None:
                        parsed_date = jst.localize(parsed_date)
                    else:
                        parsed_date = parsed_date.astimezone(jst)
                    result = parsed_date.strftime("%Y-%m-%d")
                    print(f"spaCy entity formatted: {result}")
                    return result
            except Exception as e:
                print(f"spaCy entity parsing error: {e}")
                continue
    
    # Japanese date words that spaCy doesn't tag as DATE entities
    japanese_date_words = ['今日', '明日', '明後日', '昨日', '来週', '来月']
    for token in doc:
        if token.text in japanese_date_words:
            try:
                parsed_date = dateparser.parse(token.text, languages=['ja'], settings={
                    'RELATIVE_BASE': now_jst,
                    'TIMEZONE': 'Asia/Tokyo'
                })
                print(f"Japanese token '{token.text}' parsed as: {parsed_date}")
                if parsed_date:
                    if parsed_date.tzinfo is None:
                        parsed_date = jst.localize(parsed_date)
                    else:
                        parsed_date = parsed_date.astimezone(jst)
                    result = parsed_date.strftime("%Y-%m-%d")
                    print(f"Japanese token formatted: {result}")
                    return result
            except Exception as e:
                print(f"Japanese token parsing error: {e}")
                continue
    
    print("No date found")
    return ""



def extract_clean_task(text: str, extracted_date: str, doc) -> str:
    """Extract and clean task text using spaCy analysis"""
    
    # Remove date patterns
    task_text = text
    
    # Remove Japanese and English date words
    date_words = [
        # Japanese
        "今日", "明日", "明後日", "来週", "来月",
        # English
        "today", "tomorrow", "tonight", "next week", "next month", 
        "this week", "this month", "yesterday"
    ]
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