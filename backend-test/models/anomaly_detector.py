import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import joblib
import os
from datetime import datetime

class AnomalyDetector:
    """ML Model for detecting water quality anomalies"""
    
    def __init__(self, anomaly_threshold=0.7):
        self.anomaly_threshold = anomaly_threshold
        self.model = None
        self.scaler = None
        self.feature_names = [
            'temperature', 'pH', 'dissolved_oxygen', 'turbidity',
            'conductivity', 'nitrates', 'phosphates', 'chlorine'
        ]
        self.is_trained = False
    
    def train(self, training_data, contamination=0.1):
        """
        Train the Isolation Forest model for anomaly detection
        
        Args:
            training_data (pd.DataFrame): Training data with water quality features
            contamination (float): Expected proportion of anomalies
        """
        try:
            # Initialize scaler and normalize data
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(training_data[self.feature_names])
            
            # Train Isolation Forest model
            self.model = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=100
            )
            self.model.fit(X_scaled)
            
            self.is_trained = True
            print(f"[{datetime.now()}] Anomaly detector trained successfully")
            return True
        except Exception as e:
            print(f"Error training anomaly detector: {str(e)}")
            return False
    
    def detect(self, water_sample):
        """
        Detect anomalies in a water sample
        
        Args:
            water_sample (dict): Water quality measurements
            
        Returns:
            dict: Detection results with anomaly score and flag
        """
        if not self.is_trained or self.model is None:
            return {
                'is_anomaly': False,
                'anomaly_score': 0.0,
                'error': 'Model not trained'
            }
        
        try:
            # Prepare features
            sample_df = pd.DataFrame([water_sample])
            X_scaled = self.scaler.transform(sample_df[self.feature_names])
            
            # Get anomaly score (-1 for anomaly, 1 for normal)
            prediction = self.model.predict(X_scaled)[0]
            anomaly_score = abs(self.model.score_samples(X_scaled)[0])
            
            # Normalize score to 0-1 range
            normalized_score = 1 / (1 + np.exp(-anomaly_score))
            
            return {
                'is_anomaly': normalized_score > self.anomaly_threshold,
                'anomaly_score': float(normalized_score),
                'raw_prediction': int(prediction),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error detecting anomaly: {str(e)}")
            return {
                'is_anomaly': False,
                'anomaly_score': 0.0,
                'error': str(e)
            }
    
    def save_model(self, model_path, scaler_path):
        """Save trained model and scaler"""
        try:
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)
            print(f"Model saved to {model_path}")
            return True
        except Exception as e:
            print(f"Error saving model: {str(e)}")
            return False
    
    def load_model(self, model_path, scaler_path):
        """Load pre-trained model and scaler"""
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.is_trained = True
            print(f"Model loaded from {model_path}")
            return True
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
