from datetime import datetime

class AiAdvisor:
    """AI Advisor for Quick Insights and Actionable Recommendations"""
    
    def __init__(self):
        self.insights_cache = []
        self.risk_levels = {
            'CRITICAL': {'score': 3, 'color': '#FF4444', 'icon': '🔴'},
            'WARNING': {'score': 2, 'color': '#FFA500', 'icon': '🟠'},
            'GOOD': {'score': 1, 'color': '#4CAF50', 'icon': '🟢'}
        }
    
    def generate_quick_insights(self, analysis_result, anomaly_result=None):
        """
        Generate quick insights for the dashboard
        
        Args:
            analysis_result (dict): Result from WaterAnalyzer
            anomaly_result (dict): Result from AnomalyDetector
            
        Returns:
            dict: Quick insights with AI recommendations
        """
        insights = {
            'timestamp': datetime.now().isoformat(),
            'summary': '',
            'quick_insights': [],
            'risk_level': analysis_result.get('overall_status', 'GOOD'),
            'health_score': analysis_result.get('health_score', 100),
            'anomaly_detected': False,
            'anomaly_score': 0.0,
            'primary_actions': [],
            'secondary_actions': []
        }
        
        # Check for anomalies
        if anomaly_result and anomaly_result.get('is_anomaly', False):
            insights['anomaly_detected'] = True
            insights['anomaly_score'] = anomaly_result.get('anomaly_score', 0.0)
            insights['quick_insights'].append({
                'type': 'ANOMALY_ALERT',
                'message': f"Anomalous water pattern detected (confidence: {anomaly_result.get('anomaly_score', 0)*100:.1f}%)",
                'severity': 'HIGH'
            })
        
        # Generate summary
        status = analysis_result.get('overall_status', 'GOOD')
        health = analysis_result.get('health_score', 100)
        
        if status == 'CRITICAL':
            insights['summary'] = f"⚠️ CRITICAL: Water quality requires immediate attention. Health Score: {health:.1f}%"
        elif status == 'WARNING':
            insights['summary'] = f"⚠️ WARNING: Water quality issues detected. Health Score: {health:.1f}%"
        else:
            insights['summary'] = f"✅ GOOD: Water quality is within acceptable parameters. Health Score: {health:.1f}%"
        
        # Generate insights from violations
        violations = analysis_result.get('violations', [])
        parameters_affected = {}
        
        for violation in violations:
            param = violation.get('parameter')
            if param not in parameters_affected:
                parameters_affected[param] = []
            parameters_affected[param].append(violation)
        
        # Create quick insights for each affected parameter
        for param, violations_list in parameters_affected.items():
            insight_text = self._create_parameter_insight(param, violations_list, analysis_result.get('parameters', {}))
            if insight_text:
                insights['quick_insights'].append({
                    'type': 'PARAMETER_ALERT',
                    'parameter': param,
                    'message': insight_text,
                    'severity': self._get_severity(param)
                })
        
        # Sort suggestions by priority and urgency
        suggestions = analysis_result.get('suggestions', [])
        
        # Primary actions (immediate/high priority)
        primary = [s for s in suggestions if s.get('urgency') in ['IMMEDIATE', 'HIGH']]
        insights['primary_actions'] = primary[:3]  # Top 3 primary actions
        
        # Secondary actions (soon/medium priority)
        secondary = [s for s in suggestions if s.get('urgency') not in ['IMMEDIATE', 'HIGH']]
        insights['secondary_actions'] = secondary[:2]  # Top 2 secondary actions
        
        return insights
    
    def _create_parameter_insight(self, param, violations, parameters):
        """
        Create a human-readable insight for a parameter violation
        """
        if not violations:
            return None
        
        violation = violations[0]  # Primary violation
        current_value = violation.get('value')
        violation_type = violation.get('violation_type')
        
        insights_map = {
            'pH': {
                'BELOW_MIN': f"pH too acidic ({current_value}). Add alkaline treatment.",
                'ABOVE_MAX': f"pH too alkaline ({current_value}). Add acidic treatment."
            },
            'dissolved_oxygen': {
                'BELOW_MIN': f"Oxygen critically low ({current_value} mg/L). Urgent aeration needed."
            },
            'turbidity': {
                'ABOVE_MAX': f"Water is cloudy ({current_value} NTU). Need filtration."
            },
            'temperature': {
                'BELOW_MIN': f"Water too cold ({current_value}°C). Consider heating.",
                'ABOVE_MAX': f"Water too warm ({current_value}°C). Increase cooling."
            },
            'conductivity': {
                'ABOVE_MAX': f"High salt content detected ({current_value} µS/cm)."
            },
            'nitrates': {
                'ABOVE_MAX': f"Nitrates elevated ({current_value} mg/L). Check for pollution."
            },
            'phosphates': {
                'ABOVE_MAX': f"Phosphates high ({current_value} mg/L). Risk of eutrophication."
            },
            'chlorine': {
                'ABOVE_MAX': f"Chlorine residual too high ({current_value} mg/L).",
                'BELOW_MIN': f"Chlorine residual too low ({current_value} mg/L). Increase dosage."
            }
        }
        
        if param in insights_map:
            if violation_type in insights_map[param]:
                return insights_map[param][violation_type]
        
        return f"{param}: {current_value} - Exceeds threshold"
    
    def _get_severity(self, param):
        """
        Determine severity level for a parameter
        """
        critical_params = ['dissolved_oxygen', 'pH']
        high_params = ['nitrates', 'phosphates']
        
        if param in critical_params:
            return 'CRITICAL'
        elif param in high_params:
            return 'HIGH'
        else:
            return 'MEDIUM'
    
    def get_ai_recommendations(self, analysis_result, trend_data=None):
        """
        Get AI-powered recommendations based on current state and trends
        
        Args:
            analysis_result (dict): Current analysis result
            trend_data (dict): Trend analysis data
            
        Returns:
            dict: Recommendations with reasoning
        """
        recommendations = {
            'timestamp': datetime.now().isoformat(),
            'recommendations': [],
            'predictive_alerts': [],
            'maintenance_tips': []
        }
        
        suggestions = analysis_result.get('suggestions', [])
        
        # Convert suggestions to recommendations with AI reasoning
        for suggestion in suggestions:
            recommendation = {
                'action': suggestion.get('action'),
                'parameter': suggestion.get('parameter'),
                'priority': suggestion.get('priority'),
                'urgency': suggestion.get('urgency'),
                'reasoning': suggestion.get('issue'),
                'estimated_impact': self._estimate_impact(suggestion.get('parameter'))
            }
            recommendations['recommendations'].append(recommendation)
        
        # Predictive alerts based on trends
        if trend_data:
            predictive = self._generate_predictive_alerts(trend_data)
            recommendations['predictive_alerts'] = predictive
        
        # Maintenance tips
        recommendations['maintenance_tips'] = self._get_maintenance_tips(
            analysis_result.get('parameters', {})
        )
        
        return recommendations
    
    def _estimate_impact(self, parameter):
        """
        Estimate the impact of the parameter on water quality
        """
        impact_map = {
            'dissolved_oxygen': {'score': 10, 'description': 'Critical for aquatic life'},
            'pH': {'score': 8, 'description': 'Affects chemical reactions and ecosystems'},
            'temperature': {'score': 7, 'description': 'Affects organism metabolism and DO'},
            'turbidity': {'score': 6, 'description': 'Affects light penetration and visibility'},
            'nitrates': {'score': 8, 'description': 'Nutrient pollution risk'},
            'phosphates': {'score': 8, 'description': 'Eutrophication risk'},
            'conductivity': {'score': 5, 'description': 'Indicates water mineralization'},
            'chlorine': {'score': 7, 'description': 'Disinfection effectiveness'}
        }
        
        return impact_map.get(parameter, {'score': 5, 'description': 'Parameter affects water quality'})
    
    def _generate_predictive_alerts(self, trend_data):
        """
        Generate predictive alerts based on trends
        """
        alerts = []
        
        for param, trend_info in trend_data.items():
            trend = trend_info.get('trend')
            
            if trend == 'increasing' and param in ['temperature', 'turbidity', 'nitrates', 'phosphates']:
                alerts.append({
                    'parameter': param,
                    'alert': f"{param} is increasing. Monitor closely for deterioration.",
                    'confidence': 'HIGH'
                })
            elif trend == 'decreasing' and param in ['dissolved_oxygen', 'pH']:
                alerts.append({
                    'parameter': param,
                    'alert': f"{param} is decreasing. Action may be needed soon.",
                    'confidence': 'HIGH'
                })
        
        return alerts
    
    def _get_maintenance_tips(self, parameters):
        """
        Get maintenance tips based on current parameters
        """
        tips = []
        
        # General maintenance tips
        if parameters.get('temperature', 25) > 30:
            tips.append({
                'tip': 'High temperature detected. Ensure adequate water circulation and cooling systems are operational.',
                'category': 'Temperature Management'
            })
        
        if parameters.get('pH', 7.2) < 6.5 or parameters.get('pH', 7.2) > 8.5:
            tips.append({
                'tip': 'pH is out of optimal range. Check and calibrate pH adjustment systems.',
                'category': 'Chemical Treatment'
            })
        
        if parameters.get('turbidity', 2) > 3:
            tips.append({
                'tip': 'Elevated turbidity. Schedule filter cleaning or replacement if necessary.',
                'category': 'Filtration Maintenance'
            })
        
        if parameters.get('conductivity', 350) > 500:
            tips.append({
                'tip': 'High conductivity indicates mineral buildup. Consider water softening or ion exchange.',
                'category': 'Water Treatment'
            })
        
        # Check sensor maintenance
        tips.append({
            'tip': 'Schedule regular sensor calibration and maintenance to ensure accuracy.',
            'category': 'Sensor Maintenance'
        })
        
        return tips
    
    def generate_dashboard_summary(self, analysis_result, anomaly_result=None, trend_data=None):
        """
        Generate a comprehensive dashboard summary combining all insights
        
        Args:
            analysis_result (dict): Analysis result
            anomaly_result (dict): Anomaly detection result
            trend_data (dict): Trend analysis data
            
        Returns:
            dict: Complete dashboard summary
        """
        quick_insights = self.generate_quick_insights(analysis_result, anomaly_result)
        recommendations = self.get_ai_recommendations(analysis_result, trend_data)
        
        dashboard = {
            'timestamp': datetime.now().isoformat(),
            'overall_health': {
                'status': analysis_result.get('overall_status', 'GOOD'),
                'score': analysis_result.get('health_score', 100),
                'icon': self.risk_levels[analysis_result.get('overall_status', 'GOOD')]['icon'],
                'color': self.risk_levels[analysis_result.get('overall_status', 'GOOD')]['color']
            },
            'quick_summary': quick_insights['summary'],
            'quick_insights': quick_insights['quick_insights'],
            'primary_actions': quick_insights['primary_actions'],
            'secondary_actions': quick_insights['secondary_actions'],
            'all_recommendations': recommendations['recommendations'],
            'predictive_alerts': recommendations['predictive_alerts'],
            'maintenance_tips': recommendations['maintenance_tips'],
            'anomaly_info': {
                'detected': quick_insights['anomaly_detected'],
                'confidence': quick_insights['anomaly_score'],
                'message': 'Anomaly detected - Review immediately' if quick_insights['anomaly_detected'] else 'Normal pattern'
            },
            'parameters': analysis_result.get('parameters', {}),
            'trends': trend_data or {}
        }
        
        return dashboard
