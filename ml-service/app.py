from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

MODEL_FILE = 'crop_recommendator.joblib'
model = None

# Try loading the model on startup
if os.path.exists(MODEL_FILE):
    try:
        model = joblib.load(MODEL_FILE)
        print(f"Loaded ML model successfully from {MODEL_FILE}")
    except Exception as e:
        print(f"Error loading model: {str(e)}")
else:
    print(f"Warning: Model file {MODEL_FILE} not found. Please run train_model.py first.")

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'AgriAI ML Service is running successfully.'
    }), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    global model
    
    # Reload model if it's not loaded yet
    if model is None:
        if os.path.exists(MODEL_FILE):
            try:
                model = joblib.load(MODEL_FILE)
            except Exception as e:
                return jsonify({'error': f'Failed to load model: {str(e)}'}), 500
        else:
            return jsonify({'error': 'Prediction model is not trained yet.'}), 500
            
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request body, expected JSON'}), 400
            
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        # Parse inputs as floats
        try:
            n = float(data['N'])
            p = float(data['P'])
            k = float(data['K'])
            temp = float(data['temperature'])
            hum = float(data['humidity'])
            ph = float(data['ph'])
            rain = float(data['rainfall'])
        except (ValueError, TypeError):
            return jsonify({'error': 'All inputs must be numeric values'}), 400
            
        # Format input for prediction
        input_features = np.array([[n, p, k, temp, hum, ph, rain]])
        
        # Predict crop label
        predicted_crop = model.predict(input_features)[0]
        
        # Calculate confidence score
        probabilities = model.predict_proba(input_features)[0]
        class_index = np.where(model.classes_ == predicted_crop)[0][0]
        confidence = float(probabilities[class_index])
        
        return jsonify({
            'success': True,
            'prediction': predicted_crop,
            'confidence': round(confidence * 100, 2),
            'inputs': {
                'N': n,
                'P': p,
                'K': k,
                'temperature': temp,
                'humidity': hum,
                'ph': ph,
                'rainfall': rain
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting ML microservice on port {port}...")
    app.run(host='0.0.0.0', port=port)
