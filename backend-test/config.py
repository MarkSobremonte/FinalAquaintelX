import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration for AquaIntelX AI Backend"""
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', False)
    API_PORT = int(os.getenv('API_PORT', 5000))
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    
    # Model paths
    MODEL_PATH = os.getenv('MODEL_PATH', './models/water_anomaly_detector.h5')
    SCALER_PATH = os.getenv('SCALER_PATH', './models/scaler.pkl')
    ANOMALY_THRESHOLD = float(os.getenv('ANOMALY_THRESHOLD', 0.7))
    
    # Real-time analysis
    ANALYSIS_WINDOW_SIZE = int(os.getenv('ANALYSIS_WINDOW_SIZE', 60))
    REAL_TIME_UPDATE_INTERVAL = int(os.getenv('REAL_TIME_UPDATE_INTERVAL', 5))
    
    # Water quality thresholds
    WATER_QUALITY_THRESHOLDS = {
        'pH': {
            'min': float(os.getenv('PH_MIN', 6.5)),
            'max': float(os.getenv('PH_MAX', 8.5))
        },
        'dissolved_oxygen': {
            'min': float(os.getenv('DO_MIN', 5.0))
        },
        'turbidity': {
            'max': float(os.getenv('TURBIDITY_MAX', 5.0))
        },
        'temperature': {
            'min': float(os.getenv('TEMPERATURE_MIN', 0)),
            'max': float(os.getenv('TEMPERATURE_MAX', 35))
        }
    }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
