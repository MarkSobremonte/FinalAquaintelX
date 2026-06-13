import pandas as pd
import numpy as np

def generate_sample_training_data(num_samples=500):
    """
    Generate synthetic water quality training data for model initialization
    """
    np.random.seed(42)
    
    data = {
        'temperature': np.random.normal(25, 3, num_samples),
        'pH': np.random.normal(7.2, 0.5, num_samples),
        'dissolved_oxygen': np.random.normal(7.8, 1.2, num_samples),
        'turbidity': np.random.normal(2.5, 1.0, num_samples),
        'conductivity': np.random.normal(350, 50, num_samples),
        'nitrates': np.random.normal(20, 10, num_samples),
        'phosphates': np.random.normal(0.5, 0.2, num_samples),
        'chlorine': np.random.normal(0.8, 0.3, num_samples)
    }
    
    # Add some anomalies
    anomaly_indices = np.random.choice(num_samples, size=int(0.1 * num_samples), replace=False)
    for idx in anomaly_indices:
        data['pH'][idx] = np.random.choice([5.0, 9.5])
        data['dissolved_oxygen'][idx] = np.random.uniform(1, 3)
        data['turbidity'][idx] = np.random.uniform(8, 15)
    
    return pd.DataFrame(data)

def validate_water_sample(sample, required_fields=None):
    """
    Validate water sample data
    """
    if required_fields is None:
        required_fields = [
            'temperature', 'pH', 'dissolved_oxygen', 'turbidity',
            'conductivity', 'nitrates', 'phosphates', 'chlorine'
        ]
    
    missing_fields = [f for f in required_fields if f not in sample]
    if missing_fields:
        return False, f"Missing fields: {', '.join(missing_fields)}"
    
    for field in required_fields:
        try:
            float(sample[field])
        except (TypeError, ValueError):
            return False, f"Field '{field}' must be numeric"
    
    return True, None
