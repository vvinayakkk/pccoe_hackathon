from flask import Flask, request, jsonify
import requests
import json
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

# Dictionary of supported languages with their codes
LANGUAGES = {
    "English": "en",
    "Hindi": "hi",
    "Bengali": "bn",
    "Tamil": "ta",
    "Telugu": "te",
    "Marathi": "mr",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Punjabi": "pa",
    "Urdu": "ur",
    "Assamese": "as",
    "Bodo": "brx",
    "Dogri": "doi",
    "Kashmiri": "ks",
    "Konkani": "gom",
    "Maithili": "mai",
    "Manipuri": "mni",
    "Nepali": "ne",
    "Odia": "or",
    "Sanskrit": "sa",
    "Santali": "sat",
    "Sindhi": "sd",
}

# Function to translate text
def translate_text(source_lang, message, target_lang, service_id):
    """Translate text using Bhashini's translation API"""
    url = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline'
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': os.getenv("AUTHORIZATION_TOKEN"),
    }
    
    payload = {
        "inputData": {
            "input": [
                {
                    "source": message
                }
            ]
        },
        "pipelineTasks": [
            {
                "taskType": "translation",
                "config": {
                    "language": {
                        "sourceLanguage": source_lang,
                        "targetLanguage": target_lang
                    },
                    "serviceId": service_id
                }
            }
        ]
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# Function to extract translated text from response
def extract_translation(response):
    """Extract the translated text from the API response"""
    try:
        return response["pipelineResponse"][0]["output"][0]["target"]
    except (KeyError, IndexError, TypeError) as e:
        return {"error": f"Error extracting translation: {e}", "response": response}

@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.json
    source_language = data.get('source_language')
    target_language = data.get('target_language')
    text_to_translate = data.get('text')
    service_id = data.get('service_id', os.getenv("DEFAULT_SERVICE_ID"))

    if not source_language or not target_language or not text_to_translate:
        return jsonify({"error": "Please provide source_language, target_language, and text"}), 400

    result = translate_text(source_language, text_to_translate, target_language, service_id)
    
    if "error" in result:
        return jsonify(result), 500

    translated_text = extract_translation(result)
    
    if "error" in translated_text:
        return jsonify(translated_text), 500

    return jsonify({"translated_text": translated_text})

if __name__ == '__main__':
    app.run(debug=True, port=6004)
