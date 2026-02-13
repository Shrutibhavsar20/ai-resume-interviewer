"""
Test script to verify Gemini API configuration
Run this before starting your FastAPI server
"""

import google.generativeai as genai
import os

def test_gemini_connection():
    """Test if Gemini API is configured correctly"""
    
    # Check if API key is set
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY environment variable not set!")
        print("\nTo fix this:")
        print("1. Get your API key from https://makersuite.google.com/app/apikey")
        print("2. Set it as environment variable:")
        print("   - Windows: set GEMINI_API_KEY=your_api_key_here")
        print("   - Linux/Mac: export GEMINI_API_KEY=your_api_key_here")
        print("   - Or create a .env file with: GEMINI_API_KEY=your_api_key_here")
        return False
    
    print(f"✓ API Key found (length: {len(api_key)})")
    
    # Configure genai
    genai.configure(api_key=api_key)
    
    # List available models
    print("\n📋 Listing available models...")
    try:
        available_models = []
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                available_models.append(model.name)
                print(f"  ✓ {model.name}")
        
        if not available_models:
            print("  ❌ No models found!")
            return False
            
    except Exception as e:
        print(f"  ❌ Error listing models: {str(e)}")
        return False
    
    # Test generating content
    print("\n🧪 Testing content generation...")
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content("Say 'Hello, I am working!'")
        print(f"  ✓ Response: {response.text}")
        print("\n✅ SUCCESS! Gemini API is working correctly.")
        return True
    except Exception as e:
        print(f"  ❌ Error generating content: {str(e)}")
        
        # Try alternative model
        print("\n🔄 Trying gemini-1.5-flash-latest...")
        try:
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = model.generate_content("Say 'Hello, I am working!'")
            print(f"  ✓ Response: {response.text}")
            print("\n✅ SUCCESS! Use 'gemini-1.5-flash-latest' model in your code.")
            return True
        except Exception as e2:
            print(f"  ❌ Also failed: {str(e2)}")
            return False

if __name__ == "__main__":
    print("=" * 60)
    print("GEMINI API CONNECTION TEST")
    print("=" * 60)
    
    success = test_gemini_connection()
    
    if not success:
        print("\n" + "=" * 60)
        print("TROUBLESHOOTING TIPS:")
        print("=" * 60)
        print("1. Verify your API key is correct")
        print("2. Check if you have API quota remaining")
        print("3. Ensure you're using the latest google-generativeai package:")
        print("   pip install --upgrade google-generativeai")
        print("4. Visit https://ai.google.dev/ for documentation")
