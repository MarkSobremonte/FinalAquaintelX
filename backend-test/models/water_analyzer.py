import numpy as np
from datetime import datetime
from collections import deque

class WaterAnalyzer:
    """Real-time water quality analysis engine"""
    
    def __init__(self, thresholds, window_size=60):
        """
        Initialize the water analyzer
        
        Args:
            thresholds (dict): Quality thresholds for different parameters
            window_size (int): Number of samples to maintain for trend analysis
        """
        self.thresholds = thresholds
        self.window_size = window_size
        self.history = deque(maxlen=window_size)
        self.alerts = []
    
    def analyze_sample(self, water_sample):
        """
        Analyze a single water sample against thresholds
        
        Args:
            water_sample (dict): Water quality measurements
            
        Returns:
            dict: Analysis results with alerts and suggestions
        """
        analysis_result = {
            'timestamp': datetime.now().isoformat(),
            'parameters': water_sample.copy(),
            'violations': [],
            'suggestions': [],
            'overall_status': 'GOOD',
            'health_score': 100.0
        }
        
        # Check each parameter against thresholds
        violations_count = 0
        
        for param, value in water_sample.items():
            if param in self.thresholds:
                threshold = self.thresholds[param]
                
                # Check min threshold
                if 'min' in threshold and value < threshold['min']:
                    analysis_result['violations'].append({
                        'parameter': param,
                        'value': value,
                        'violation_type': 'BELOW_MIN',
                        'threshold': threshold['min']
                    })
                    violations_count += 1
                
                # Check max threshold
                if 'max' in threshold and value > threshold['max']:
                    analysis_result['violations'].append({
                        'parameter': param,
                        'violation_type': 'ABOVE_MAX',
                        'value': value,
                        'threshold': threshold['max']
                    })
                    violations_count += 1
        
        # Generate suggestions based on violations
        analysis_result['suggestions'] = self._generate_suggestions(
            analysis_result['violations'],
            water_sample
        )
        
        # Determine overall status and health score
        if violations_count == 0:
            analysis_result['overall_status'] = 'GOOD'
            analysis_result['health_score'] = 100.0
        elif violations_count <= 2:
            analysis_result['overall_status'] = 'WARNING'
            analysis_result['health_score'] = 70.0 - (violations_count * 10)
        else:
            analysis_result['overall_status'] = 'CRITICAL'
            analysis_result['health_score'] = 40.0 - (violations_count * 5)
        
        # Clamp health score
        analysis_result['health_score'] = max(0, min(100, analysis_result['health_score']))
        
        # Add to history
        self.history.append(analysis_result)
        
        return analysis_result
    
    def _generate_suggestions(self, violations, water_sample):
        """
        Generate actionable suggestions based on violations
        
        Args:
            violations (list): List of parameter violations
            water_sample (dict): Current water measurements
            
        Returns:
            list: List of suggestions
        """
        suggestions = []
        
        for violation in violations:
            param = violation['parameter']
            
            if param == 'pH':
                if violation['violation_type'] == 'BELOW_MIN':
                    suggestions.append({
                        'priority': 'HIGH',
                        'parameter': 'pH',
                        'issue': f"pH is too low ({violation['value']}). Optimal range: {self.thresholds['pH']['min']}-{self.thresholds['pH']['max']}",
                        'action': 'Add alkaline buffer or limestone to increase pH',
                        'urgency': 'IMMEDIATE'
                    })
                else:
                    suggestions.append({
                        'priority': 'HIGH',
                        'parameter': 'pH',
                        'issue': f"pH is too high ({violation['value']}). Optimal range: {self.thresholds['pH']['min']}-{self.thresholds['pH']['max']}",
                        'action': 'Add acidic buffer or CO2 to decrease pH',
                        'urgency': 'IMMEDIATE'
                    })
            
            elif param == 'dissolved_oxygen':
                suggestions.append({
                    'priority': 'CRITICAL',
                    'parameter': 'dissolved_oxygen',
                    'issue': f"Dissolved oxygen is critically low ({violation['value']} mg/L). Minimum: {self.thresholds['dissolved_oxygen']['min']} mg/L",
                    'action': 'Increase aeration immediately. Check for organic pollution or decomposition',
                    'urgency': 'IMMEDIATE'
                })
            
            elif param == 'turbidity':
                suggestions.append({
                    'priority': 'MEDIUM',
                    'parameter': 'turbidity',
                    'issue': f"Water turbidity is high ({violation['value']} NTU). Maximum: {self.thresholds['turbidity']['max']} NTU",
                    'action': 'Use filtration, sedimentation tanks, or coagulation to reduce suspended particles',
                    'urgency': 'SOON'
                })
            
            elif param == 'temperature':
                if violation['violation_type'] == 'BELOW_MIN':
                    suggestions.append({
                        'priority': 'MEDIUM',
                        'parameter': 'temperature',
                        'issue': f"Water temperature is too low ({violation['value']}°C). Range: {self.thresholds['temperature']['min']}-{self.thresholds['temperature']['max']}°C",
                        'action': 'Consider water heating systems or relocate to warmer environment',
                        'urgency': 'SOON'
                    })
                else:
                    suggestions.append({
                        'priority': 'MEDIUM',
                        'parameter': 'temperature',
                        'issue': f"Water temperature is too high ({violation['value']}°C). Range: {self.thresholds['temperature']['min']}-{self.thresholds['temperature']['max']}°C",
                        'action': 'Increase water circulation or cooling systems',
                        'urgency': 'SOON'
                    })
            
            elif param == 'conductivity':
                suggestions.append({
                    'priority': 'MEDIUM',
                    'parameter': 'conductivity',
                    'issue': f"Conductivity indicates high dissolved salts/minerals ({violation['value']} µS/cm)",
                    'action': 'Review source water quality and consider desalination or ion exchange',
                    'urgency': 'SOON'
                })
            
            elif param == 'nitrates':
                suggestions.append({
                    'priority': 'HIGH',
                    'parameter': 'nitrates',
                    'issue': f"Nitrate levels are elevated ({violation['value']} mg/L). Indicates possible pollution",
                    'action': 'Check for agricultural runoff or sewage contamination sources',
                    'urgency': 'HIGH'
                })
            
            elif param == 'phosphates':
                suggestions.append({
                    'priority': 'MEDIUM',
                    'parameter': 'phosphates',
                    'issue': f"Phosphate levels are high ({violation['value']} mg/L). May cause eutrophication",
                    'action': 'Implement phosphate removal treatment or identify pollution sources',
                    'urgency': 'SOON'
                })
            
            elif param == 'chlorine':
                if violation['violation_type'] == 'ABOVE_MAX':
                    suggestions.append({
                        'priority': 'MEDIUM',
                        'parameter': 'chlorine',
                        'issue': f"Chlorine residual is too high ({violation['value']} mg/L)",
                        'action': 'Reduce chlorine dosage or allow for natural dechlorination',
                        'urgency': 'SOON'
                    })
                else:
                    suggestions.append({
                        'priority': 'MEDIUM',
                        'parameter': 'chlorine',
                        'issue': f"Chlorine residual is too low ({violation['value']} mg/L). Insufficient disinfection",
                        'action': 'Increase chlorine dosage to maintain adequate disinfection',
                        'urgency': 'SOON'
                    })
        
        return suggestions
    
    def get_trend_analysis(self):
        """
        Analyze trends over the history window
        
        Returns:
            dict: Trend analysis results
        """
        if len(self.history) < 2:
            return {'message': 'Insufficient data for trend analysis'}
        
        trend_analysis = {}
        history_list = list(self.history)
        
        # Get all unique parameters
        all_params = set()
        for entry in history_list:
            all_params.update(entry['parameters'].keys())
        
        for param in all_params:
            values = [entry['parameters'].get(param, 0) for entry in history_list if param in entry['parameters']]
            
            if len(values) > 1:
                trend = 'stable'
                if values[-1] > values[0]:
                    trend = 'increasing'
                elif values[-1] < values[0]:
                    trend = 'decreasing'
                
                trend_analysis[param] = {
                    'current': values[-1],
                    'previous': values[0],
                    'trend': trend,
                    'average': np.mean(values),
                    'min': min(values),
                    'max': max(values)
                }
        
        return trend_analysis
    
    def clear_history(self):
        """Clear analysis history"""
        self.history.clear()
