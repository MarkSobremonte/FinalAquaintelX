"""AquaIntelX API Package"""
from flask import Flask
from flask_cors import CORS
from flask_restx import Api
from .routes import analysis_bp, detection_bp, training_bp, advisor_bp

def create_app(config_name='development'):
    """Create and configure Flask app"""
    app = Flask(__name__)
    
    # Load configuration
    from config import config
    app.config.from_object(config[config_name])
    
    # Enable CORS
    CORS(app)
    
    # Initialize API
    api = Api(app, version='1.0', title='AquaIntelX AI API',
              description='Real-time water quality analysis and anomaly detection')
    
    # Register blueprints
    app.register_blueprint(analysis_bp)
    app.register_blueprint(detection_bp)
    app.register_blueprint(training_bp)
    app.register_blueprint(advisor_bp)
    
    return app
