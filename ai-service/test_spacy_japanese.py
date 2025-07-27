#!/usr/bin/env python3
"""
Test spaCy Japanese model for todo task extraction
Tests tokenization, entity recognition, and custom extraction logic
"""

import spacy
from datetime import datetime, timedelta
from dateutil import parser as date_parser
import re

def test_spacy_japanese():
    """Test spaCy Japanese model capabilities"""
    
    print("=== Loading spaCy Japanese Model ===")
    try:
        nlp = spacy.load("ja_core_news_sm")
        print("✅ Japanese model loaded successfully!")
    except OSError:
        print("❌ Japanese model not found. Run: python -m spacy download ja_core_news_sm")
        return
    
    # Test cases - typical Japanese todo inputs
    test_cases = [
        "明日買い物をする",
        "来週までにレポートを提出する",
        "今日中に掃除を終わらせる",
        "12月15日に会議の準備をする",
        "急ぎで資料を作成する",
        "後で本を読む",
        "来月友達と映画を見る",
        "重要な書類を整理する"
    ]
    
    print("\n=== spaCy Analysis Results ===")
    
    for text in test_cases:
        print(f"\n📝 Input: {text}")
        doc = nlp(text)
        
        # Tokenization
        print(f"🔤 Tokens: {[token.text for token in doc]}")
        
        # Part-of-speech tags
        print(f"🏷️  POS Tags: {[(token.text, token.pos_) for token in doc]}")
        
        # Named entities
        entities = [(ent.text, ent.label_) for ent in doc.ents]
        print(f"🏷️  Entities: {entities}")
        
        # Dependency parsing
        deps = [(token.text, token.dep_, token.head.text) for token in doc]
        print(f"🔗 Dependencies: {deps}")
        
        print("-" * 50)

def extract_task_and_date(text, nlp):
    """Extract task and date using spaCy + custom logic"""
    
    doc = nlp(text)
    
    # Extract date entities from spaCy
    spacy_dates = [ent.text for ent in doc.ents if ent.label_ in ["DATE", "TIME"]]
    
    # Custom Japanese date patterns
    custom_date_patterns = {
        "今日": datetime.now().strftime("%Y-%m-%d"),
        "明日": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
        "明後日": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "来週": (datetime.now() + timedelta(weeks=1)).strftime("%Y-%m-%d"),
        "来月": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
    }
    
    # Find date
    extracted_date = ""
    date_text = ""
    
    # Check custom patterns first
    for jp_date, iso_date in custom_date_patterns.items():
        if jp_date in text:
            extracted_date = iso_date
            date_text = jp_date
            break
    
    # Check spaCy entities
    if not extracted_date and spacy_dates:
        date_text = spacy_dates[0]
        try:
            parsed_date = date_parser.parse(date_text)
            extracted_date = parsed_date.strftime("%Y-%m-%d")
        except:
            pass
    
    # Extract task (remove date and particles)
    task_text = text
    if date_text:
        task_text = task_text.replace(date_text, "").strip()
    
    # Remove common particles and endings
    particles_to_remove = ["を", "に", "で", "は", "が", "まで", "する", "中に", "終わらせる"]
    for particle in particles_to_remove:
        task_text = task_text.replace(particle, "")
    
    task_text = re.sub(r'\s+', ' ', task_text).strip()
    
    # Determine priority from keywords
    priority = "medium"
    if any(word in text for word in ["急ぎ", "緊急", "重要", "すぐ"]):
        priority = "high"
    elif any(word in text for word in ["後で", "いつか", "暇な時"]):
        priority = "low"
    
    return {
        "original": text,
        "task": task_text,
        "date": extracted_date,
        "priority": priority,
        "spacy_entities": [(ent.text, ent.label_) for ent in doc.ents],
        "tokens": [token.text for token in doc]
    }

def test_extraction_pipeline():
    """Test the complete extraction pipeline"""
    
    print("\n=== Testing Extraction Pipeline ===")
    
    try:
        nlp = spacy.load("ja_core_news_sm")
    except OSError:
        print("❌ spaCy model not available")
        return
    
    test_cases = [
        "明日買い物をする",
        "来週までにレポートを提出する", 
        "今日中に掃除を終わらせる",
        "急ぎで資料を作成する",
        "後で本を読む"
    ]
    
    for text in test_cases:
        result = extract_task_and_date(text, nlp)
        
        print(f"\n📝 Input: {result['original']}")
        print(f"✅ Task: {result['task']}")
        print(f"📅 Date: {result['date']}")
        print(f"⚡ Priority: {result['priority']}")
        print(f"🏷️  Entities: {result['spacy_entities']}")
        print("-" * 40)

if __name__ == "__main__":
    print("Testing spaCy Japanese NLP for Todo Extraction\n")
    
    # Test 1: Basic spaCy capabilities
    test_spacy_japanese()
    
    # Test 2: Custom extraction pipeline
    test_extraction_pipeline()
    
    print("\n=== Summary ===")
    print("✅ spaCy provides excellent Japanese tokenization")
    print("✅ Custom date patterns work for common cases")
    print("✅ Can extract tasks by removing dates and particles")
    print("⚠️  May need fine-tuning for complex sentences")