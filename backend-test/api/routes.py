from flask import Blueprint, request, jsonify, current_app
from models.anomaly_detector import AnomalyDetector
from models.water_analyzer import WaterAnalyzer
from models.ai_advisor import AiAdvisor
import os

# Create blueprints
analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')
detection_bp = Blueprint('detection', __name__, url_prefix='/api/detection')
training_bp = Blueprint('training', __name__, url_prefix='/api/training')
advisor_bp = Blueprint('advisor', __name__, url_prefix='/api/advisor')

# Global instances
anomaly_detector = AnomalyDetector()
water_analyzer = None
ai_advisor = AiAdvisor()

def initialize_analyzer(app):
    """Initialize water analyzer with config thresholds"""
    global water_analyzer
    thresholds = app.config.get('WATER_QUALITY_THRESHOLDS', {})
    water_analyzer = WaterAnalyzer(thresholds)

# ==================== ANALYSIS ROUTES ====================

@analysis_bp.route('/sample', methods=['POST'])
def analyze_sample():
    """
    Analyze a single water sample
    Expected JSON: {
        "temperature": float,
        "pH": float,
        "dissolved_oxygen": float,
        "turbidity": float,
        "conductivity": float,
        "nitrates": float,
        "phosphates": float,
        "chlorine": float
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if water_analyzer is None:
            initialize_analyzer(current_app)
        
        # Analyze water sample
        analysis_result = water_analyzer.analyze_sample(data)
        
        return jsonify(analysis_result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/trend', methods=['GET'])
def get_trend_analysis():
    """Get trend analysis over history window"""
    try:
        if water_analyzer is None:
            initialize_analyzer(current_app)
        
        trend = water_analyzer.get_trend_analysis()
        return jsonify(trend), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/history', methods=['GET'])
def get_history():
    """Get analysis history"""
    try:
        if water_analyzer is None:
            initialize_analyzer(current_app)
        
        limit = request.args.get('limit', 10, type=int)
        history_list = list(water_analyzer.history)[-limit:]
        
        return jsonify({'count': len(history_list), 'history': history_list}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/clear', methods=['POST'])
def clear_history():
    """Clear analysis history"""
    try:
        if water_analyzer is None:
            initialize_analyzer(current_app)
        
        water_analyzer.clear_history()
        return jsonify({'message': 'History cleared successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== DETECTION ROUTES ====================

@detection_bp.route('/anomaly', methods=['POST'])
def detect_anomaly():
    """
    Detect anomalies in water sample
    Expected JSON: same as analysis/sample
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Load model if not already loaded
        if not anomaly_detector.is_trained:
            model_path = current_app.config.get('MODEL_PATH')
            scaler_path = current_app.config.get('SCALER_PATH')
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                anomaly_detector.load_model(model_path, scaler_path)
            else:
                return jsonify({
                    'error': 'Anomaly detection model not trained',
                    'message': 'Please train the model first using /api/training/train'
                }), 503
        
        # Detect anomaly
        detection_result = anomaly_detector.detect(data)
        
        return jsonify(detection_result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@detection_bp.route('/threshold', methods=['GET'])
def get_thresholds():
    """Get current quality thresholds"""
    try:
        thresholds = current_app.config.get('WATER_QUALITY_THRESHOLDS', {})
        return jsonify({'thresholds': thresholds}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== TRAINING ROUTES ====================

@training_bp.route('/train', methods=['POST'])
def train_model():
    """
    Train anomaly detection model
    Expected JSON: {
        "training_data": [
            {"temperature": float, "pH": float, ...},
            ...
        ],
        "contamination": float (0-1, default: 0.1)
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'training_data' not in data:
            return jsonify({'error': 'training_data is required'}), 400
        
        training_data_list = data['training_data']
        contamination = data.get('contamination', 0.1)
        
        if not isinstance(training_data_list, list) or len(training_data_list) == 0:
            return jsonify({'error': 'training_data must be a non-empty list'}), 400
        
        # Convert to DataFrame
        import pandas as pd
        training_df = pd.DataFrame(training_data_list)
        
        # Train model
        success = anomaly_detector.train(training_df, contamination=contamination)
        
        if success:
            # Save model
            model_path = current_app.config.get('MODEL_PATH')
            scaler_path = current_app.config.get('SCALER_PATH')
            anomaly_detector.save_model(model_path, scaler_path)
            
            return jsonify({
                'message': 'Model trained and saved successfully',
                'samples_trained': len(training_data_list),
                'contamination_rate': contamination
            }), 200
        else:
            return jsonify({'error': 'Failed to train model'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@training_bp.route('/status', methods=['GET'])
def get_training_status():
    """Get model training status"""
    try:
        status = {
            'is_trained': anomaly_detector.is_trained,
            'model_available': os.path.exists(current_app.config.get('MODEL_PATH', '')),
            'feature_count': len(anomaly_detector.feature_names),
            'features': anomaly_detector.feature_names,
            'anomaly_threshold': anomaly_detector.anomaly_threshold
        }
        return jsonify(status), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== AI ADVISOR ROUTES ====================

@advisor_bp.route('/quick-insights', methods=['POST'])
def quick_insights():
    """
    Get quick insights for dashboard
    Expected JSON: {
        "analysis_result": {...},
        "anomaly_result": {...} (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'analysis_result' not in data:
            return jsonify({'error': 'analysis_result is required'}), 400
        
        analysis_result = data['analysis_result']
        anomaly_result = data.get('anomaly_result')
        
        insights = ai_advisor.generate_quick_insights(analysis_result, anomaly_result)
        
        return jsonify(insights), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@advisor_bp.route('/recommendations', methods=['POST'])
def recommendations():
    """
    Get AI recommendations
    Expected JSON: {
        "analysis_result": {...},
        "trend_data": {...} (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'analysis_result' not in data:
            return jsonify({'error': 'analysis_result is required'}), 400
        
        analysis_result = data['analysis_result']
        trend_data = data.get('trend_data')
        
        recommendations = ai_advisor.get_ai_recommendations(analysis_result, trend_data)
        
        return jsonify(recommendations), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@advisor_bp.route('/dashboard-summary', methods=['POST'])
def dashboard_summary():
    """
    Get comprehensive dashboard summary
    Expected JSON: {
        "analysis_result": {...},
        "anomaly_result": {...} (optional),
        "trend_data": {...} (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'analysis_result' not in data:
            return jsonify({'error': 'analysis_result is required'}), 400
        
        analysis_result = data['analysis_result']
        anomaly_result = data.get('anomaly_result')
        trend_data = data.get('trend_data')
        
        summary = ai_advisor.generate_dashboard_summary(
            analysis_result, anomaly_result, trend_data
        )
        
        return jsonify(summary), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== HEALTH CHECK ====================

@analysis_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'analyzer_initialized': water_analyzer is not None,
        'detector_trained': anomaly_detector.is_trained,
        'advisor_initialized': ai_advisor is not None
    }), 200
