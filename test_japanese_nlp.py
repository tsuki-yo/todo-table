#!/usr/bin/env python3
"""
Test script for Japanese NLP extraction
Tests if spaCy Japanese model can extract tasks and dates
"""

def test_basic_parsing():
    """Test basic text parsing without AI first"""
    test_cases = [
        "明日買い物をする",
        "来週までにレポートを提出する", 
        "今日中に掃除を終わらせる",
        "12月15日に会議の準備をする"
    ]
    
    print("=== Basic Pattern Matching Test ===")
    
    # Simple date patterns
    import re
    from datetime import datetime, timedelta
    
    def extract_basic(text):
        # Japanese date patterns
        date_patterns = {
            "今日": datetime.now().strftime("%Y-%m-%d"),
            "明日": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
            "来週": (datetime.now() + timedelta(weeks=1)).strftime("%Y-%m-%d"),
        }
        
        extracted_date = ""
        task_text = text
        
        for jp_date, iso_date in date_patterns.items():
            if jp_date in text:
                extracted_date = iso_date
                task_text = text.replace(jp_date, "").strip()
                break
        
        # Remove common particles
        task_text = re.sub(r'(まで|に|を|する|中に|終わらせる)', '', task_text).strip()
        
        return {
            "original": text,
            "task": task_text,
            "date": extracted_date,
            "method": "basic_patterns"
        }
    
    for test_text in test_cases:
        result = extract_basic(test_text)
        print(f"Input: {result['original']}")
        print(f"Task: {result['task']}")
        print(f"Date: {result['date']}")
        print("-" * 40)

def test_spacy_if_available():
    """Test spaCy if it's available"""
    try:
        import spacy
        print("\n=== spaCy Test ===")
        
        # Try to load Japanese model
        try:
            nlp = spacy.load("ja_core_news_sm")
            print("✅ Japanese spaCy model loaded successfully!")
            
            test_text = "明日買い物をする"
            doc = nlp(test_text)
            
            print(f"Text: {test_text}")
            print("Tokens:", [token.text for token in doc])
            print("Entities:", [(ent.text, ent.label_) for ent in doc.ents])
            
        except OSError:
            print("❌ Japanese spaCy model not found")
            print("To install: python -m spacy download ja_core_news_sm")
            
    except ImportError:
        print("\n❌ spaCy not installed")
        print("To install: pip install spacy")

def test_dateutil_if_available():
    """Test dateutil if available"""
    try:
        from dateutil import parser as date_parser
        from datetime import datetime
        
        print("\n=== dateutil Test ===")
        
        # Test various date formats
        test_dates = [
            "2025-01-15",
            "15/01/2025", 
            "January 15, 2025"
        ]
        
        for date_str in test_dates:
            try:
                parsed = date_parser.parse(date_str)
                print(f"{date_str} → {parsed.strftime('%Y-%m-%d')}")
            except:
                print(f"{date_str} → Failed to parse")
                
    except ImportError:
        print("\n❌ dateutil not installed")
        print("To install: pip install python-dateutil")

if __name__ == "__main__":
    print("Testing Japanese NLP Extraction\n")
    
    # Always test basic patterns
    test_basic_parsing()
    
    # Test advanced libraries if available
    test_spacy_if_available()
    test_dateutil_if_available()
    
    print("\n=== Summary ===")
    print("Basic pattern matching works without any libraries")
    print("For better accuracy, install spaCy + Japanese model")
    print("For better date parsing, install python-dateutil")