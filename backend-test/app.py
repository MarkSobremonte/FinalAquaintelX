#!/usr/bin/env python3
"""
AquaIntelX AI Backend - Main Application Entry Point

This application provides real-time water quality analysis and anomaly detection
using machine learning models and rule-based analysis.
"""

import os
import sys
from api import create_app
from api.routes import initialize_analyzer
from config import config

def main():
    """Initialize and run the Flask application"""
    
    # Determine environment
    env = os.getenv('FLASK_ENV', 'development')
    print(f"[*] Starting AquaIntelX AI Backend in {env} mode")
    
    # Create Flask app
    app = create_app(env)
    
    # Initialize analyzer
    with app.app_context():
        initialize_analyzer(app)
    
    # Get configuration
    cfg = config[env]
    host = cfg.API_HOST
    port = cfg.API_PORT
    
    print(f"[*] API running on http://{host}:{port}")
    print(f"[*] API Documentation: http://{host}:{port}/")
    
    # Run application
    app.run(host=host, port=port, debug=cfg.DEBUG)

if __name__ == '__main__':
    main()
