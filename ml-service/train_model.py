import numpy as np
import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Define realistic agronomic parameter ranges for 22 crops
CROP_PROFILES = {
    'rice': {'N': (60, 100), 'P': (35, 60), 'K': (35, 45), 'temp': (20, 27), 'humidity': (80, 90), 'ph': (5.0, 7.0), 'rainfall': (180, 300)},
    'maize': {'N': (60, 100), 'P': (35, 60), 'K': (15, 25), 'temp': (18, 27), 'humidity': (55, 70), 'ph': (5.5, 7.0), 'rainfall': (60, 110)},
    'chickpea': {'N': (20, 60), 'P': (55, 80), 'K': (75, 85), 'temp': (17, 21), 'humidity': (15, 20), 'ph': (5.5, 9.0), 'rainfall': (65, 95)},
    'kidneybeans': {'N': (0, 40), 'P': (55, 80), 'K': (15, 25), 'temp': (15, 25), 'humidity': (18, 25), 'ph': (5.5, 6.0), 'rainfall': (60, 150)},
    'pigeonpeas': {'N': (0, 40), 'P': (55, 80), 'K': (15, 25), 'temp': (18, 37), 'humidity': (30, 70), 'ph': (4.5, 7.5), 'rainfall': (90, 200)},
    'mothbeans': {'N': (0, 40), 'P': (35, 60), 'K': (15, 25), 'temp': (24, 30), 'humidity': (40, 65), 'ph': (3.5, 10.0), 'rainfall': (30, 75)},
    'mungbean': {'N': (0, 40), 'P': (35, 60), 'K': (15, 25), 'temp': (27, 36), 'humidity': (80, 90), 'ph': (6.2, 7.2), 'rainfall': (36, 60)},
    'blackgram': {'N': (20, 60), 'P': (55, 80), 'K': (15, 25), 'temp': (25, 35), 'humidity': (60, 70), 'ph': (6.5, 7.8), 'rainfall': (60, 75)},
    'lentil': {'N': (0, 40), 'P': (55, 80), 'K': (15, 25), 'temp': (18, 30), 'humidity': (60, 70), 'ph': (5.9, 6.9), 'rainfall': (35, 55)},
    'pomegranate': {'N': (0, 40), 'P': (5, 30), 'K': (35, 45), 'temp': (18, 25), 'humidity': (85, 92), 'ph': (5.5, 7.5), 'rainfall': (100, 112)},
    'banana': {'N': (80, 120), 'P': (70, 95), 'K': (45, 55), 'temp': (25, 29), 'humidity': (75, 85), 'ph': (5.5, 6.5), 'rainfall': (90, 110)},
    'mango': {'N': (0, 40), 'P': (15, 40), 'K': (25, 35), 'temp': (27, 36), 'humidity': (45, 55), 'ph': (4.5, 7.0), 'rainfall': (85, 105)},
    'grapes': {'N': (0, 40), 'P': (120, 145), 'K': (195, 205), 'temp': (10, 40), 'humidity': (80, 85), 'ph': (5.5, 6.5), 'rainfall': (65, 75)},
    'watermelon': {'N': (80, 120), 'P': (5, 30), 'K': (45, 55), 'temp': (24, 27), 'humidity': (80, 90), 'ph': (6.0, 7.0), 'rainfall': (40, 60)},
    'muskmelon': {'N': (80, 120), 'P': (5, 30), 'K': (45, 55), 'temp': (27, 30), 'humidity': (90, 95), 'ph': (6.0, 6.8), 'rainfall': (20, 30)},
    'apple': {'N': (0, 40), 'P': (120, 145), 'K': (195, 205), 'temp': (21, 24), 'humidity': (90, 95), 'ph': (5.5, 6.5), 'rainfall': (100, 125)},
    'orange': {'N': (0, 40), 'P': (5, 30), 'K': (5, 15), 'temp': (10, 35), 'humidity': (90, 95), 'ph': (6.0, 8.0), 'rainfall': (100, 120)},
    'papaya': {'N': (30, 70), 'P': (45, 70), 'K': (45, 55), 'temp': (23, 44), 'humidity': (90, 95), 'ph': (6.5, 7.0), 'rainfall': (240, 250)},
    'coconut': {'N': (0, 40), 'P': (5, 30), 'K': (25, 35), 'temp': (25, 30), 'humidity': (90, 95), 'ph': (5.0, 6.5), 'rainfall': (130, 230)},
    'cotton': {'N': (100, 140), 'P': (35, 60), 'K': (15, 25), 'temp': (22, 26), 'humidity': (75, 85), 'ph': (5.8, 8.0), 'rainfall': (60, 100)},
    'jute': {'N': (60, 100), 'P': (35, 60), 'K': (35, 45), 'temp': (23, 27), 'humidity': (70, 90), 'ph': (6.0, 7.0), 'rainfall': (150, 200)},
    'coffee': {'N': (80, 120), 'P': (15, 40), 'K': (25, 35), 'temp': (23, 28), 'humidity': (50, 65), 'ph': (6.0, 7.2), 'rainfall': (140, 190)}
}

def generate_dataset(samples_per_crop=100, file_path='crop_recommendation.csv'):
    print(f"Generating synthetic crop recommendation dataset ({samples_per_crop} samples/crop)...")
    np.random.seed(42)
    data = []
    
    for crop, bounds in CROP_PROFILES.items():
        for _ in range(samples_per_crop):
            # Generate feature values within bounds with a slight gaussian noise
            n = float(np.clip(np.random.normal(loc=np.mean(bounds['N']), scale=(bounds['N'][1] - bounds['N'][0]) / 4), bounds['N'][0], bounds['N'][1]))
            p = float(np.clip(np.random.normal(loc=np.mean(bounds['P']), scale=(bounds['P'][1] - bounds['P'][0]) / 4), bounds['P'][0], bounds['P'][1]))
            k = float(np.clip(np.random.normal(loc=np.mean(bounds['K']), scale=(bounds['K'][1] - bounds['K'][0]) / 4), bounds['K'][0], bounds['K'][1]))
            temp = float(np.clip(np.random.normal(loc=np.mean(bounds['temp']), scale=(bounds['temp'][1] - bounds['temp'][0]) / 4), bounds['temp'][0], bounds['temp'][1]))
            hum = float(np.clip(np.random.normal(loc=np.mean(bounds['humidity']), scale=(bounds['humidity'][1] - bounds['humidity'][0]) / 4), bounds['humidity'][0], bounds['humidity'][1]))
            ph = float(np.clip(np.random.normal(loc=np.mean(bounds['ph']), scale=(bounds['ph'][1] - bounds['ph'][0]) / 4), bounds['ph'][0], bounds['ph'][1]))
            rain = float(np.clip(np.random.normal(loc=np.mean(bounds['rainfall']), scale=(bounds['rainfall'][1] - bounds['rainfall'][0]) / 4), bounds['rainfall'][0], bounds['rainfall'][1]))
            
            data.append([
                round(n, 1),
                round(p, 1),
                round(k, 1),
                round(temp, 2),
                round(hum, 2),
                round(ph, 2),
                round(rain, 2),
                crop
            ])
            
    df = pd.DataFrame(data, columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'])
    df.to_csv(file_path, index=False)
    print(f"Dataset saved to {file_path}. Total records: {len(df)}")
    return df

def train_model():
    dataset_path = 'crop_recommendation.csv'
    if not os.path.exists(dataset_path):
        df = generate_dataset()
    else:
        df = pd.read_csv(dataset_path)
        
    X = df.drop(columns=['label'])
    y = df['label']
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=15)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    
    # Save the model
    model_file = 'crop_recommendator.joblib'
    joblib.dump(model, model_file)
    print(f"Model successfully saved to {model_file}")
    
    # Output evaluation summary
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

if __name__ == '__main__':
    train_model()
