from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import numpy as np

app = FastAPI(title="Legal Clause Classification API")

CLASS_MAPPING = {
    '0': 'Adjustments', '1': 'Agreements', '2': 'Amendments', '3': 'Anti-Corruption Laws', 
    '4': 'Applicable Laws', '5': 'Approvals', '6': 'Arbitration', '7': 'Assignments', 
    '8': 'Assigns', '9': 'Authority', '10': 'Authorizations', '11': 'Base Salary', 
    '12': 'Benefits', '13': 'Binding Effects', '14': 'Books', '15': 'Brokers', 
    '16': 'Capitalization', '17': 'Change In Control', '18': 'Closings', 
    '19': 'Compliance With Laws', '20': 'Confidentiality', '21': 'Consent To Jurisdiction', 
    '22': 'Consents', '23': 'Construction', '24': 'Cooperation', '25': 'Costs', 
    '26': 'Counterparts', '27': 'Death', '28': 'Defined Terms', '29': 'Definitions', 
    '30': 'Disability', '31': 'Disclosures', '32': 'Duties', '33': 'Effective Dates', 
    '34': 'Effectiveness', '35': 'Employment', '36': 'Enforceability', '37': 'Enforcements', 
    '38': 'Entire Agreements', '39': 'Erisa', '40': 'Existence', '41': 'Expenses', 
    '42': 'Fees', '43': 'Financial Statements', '44': 'Forfeitures', '45': 'Further Assurances', 
    '46': 'General', '47': 'Governing Laws', '48': 'Headings', '49': 'Indemnifications', 
    '50': 'Indemnity', '51': 'Insurances', '52': 'Integration', '53': 'Intellectual Property', 
    '54': 'Interests', '55': 'Interpretations', '56': 'Jurisdictions', '57': 'Liens', 
    '58': 'Litigations', '59': 'Miscellaneous', '60': 'Modifications', '61': 'No Conflicts', 
    '62': 'No Defaults', '63': 'No Waivers', '64': 'Non-Disparagement', '65': 'Notices', 
    '66': 'Organizations', '67': 'Participations', '68': 'Payments', '69': 'Positions', 
    '70': 'Powers', '71': 'Publicity', '72': 'Qualifications', '73': 'Records', 
    '74': 'Releases', '75': 'Remedies', '76': 'Representations', '77': 'Sales', 
    '78': 'Sanctions', '79': 'Severability', '80': 'Solvency', '81': 'Specific Performance', 
    '82': 'Submission To Jurisdiction', '83': 'Subsidiaries', '84': 'Successors', 
    '85': 'Survival', '86': 'Tax Withholdings', '87': 'Taxes', '88': 'Terminations', 
    '89': 'Terms', '90': 'Titles', '91': 'Transactions With Affiliates', '92': 'Use Of Proceeds', 
    '93': 'Vacations', '94': 'Venues', '95': 'Vesting', '96': 'Waiver Of Jury Trials', 
    '97': 'Waivers', '98': 'Warranties', '99': 'Withholdings'
}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model and vectorizer
# The script is run from the project root usually, so paths are relative to root.
MODEL_PATH = "model/logistic_regression_pso.pkl"
VECTORIZER_PATH = "model/tfidf_vectorizer.pkl"

model = None
vectorizer = None

@app.on_event("startup")
async def load_model():
    global model, vectorizer
    try:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        print("Model and vectorizer loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

class PredictRequest(BaseModel):
    text: str

class PredictionResult(BaseModel):
    class_name: str
    confidence: float
    probabilities: dict

@app.post("/predict", response_model=PredictionResult)
async def predict(request: PredictRequest):
    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
    
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
        
    try:
        # Preprocess and vectorize
        X = vectorizer.transform([request.text])
        
        # Predict class and probabilities
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        # Map probabilities to class names
        classes = model.classes_
        prob_dict = {str(classes[i]): float(probabilities[i]) for i in range(len(classes))}
        
        # Get top predictions
        # Sort by probability descending
        sorted_probs = dict(sorted(prob_dict.items(), key=lambda item: item[1], reverse=True))
        
        # Confidence score of the predicted class
        confidence = prob_dict[str(prediction)]
        
        # Map IDs to names in the sorted_probs
        readable_probs = {CLASS_MAPPING.get(k, k): v for k, v in sorted_probs.items()}
        
        return PredictionResult(
            class_name=CLASS_MAPPING.get(str(prediction), str(prediction)),
            confidence=confidence,
            probabilities=readable_probs
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
