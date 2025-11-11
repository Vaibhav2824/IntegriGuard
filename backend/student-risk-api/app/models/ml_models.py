import joblib
import numpy as np
from pathlib import Path

MODEL_PATH = Path("saved_models")

class RiskPredictor:
    def __init__(self):
        self.poly = joblib.load(MODEL_PATH / "poly_features.joblib")
        self.scaler = joblib.load(MODEL_PATH / "scaler.joblib")
        self.model = joblib.load(MODEL_PATH / "stacked_model.joblib")

    def predict(self, features: np.ndarray) -> dict:
        features_poly = self.poly.transform(features)
        features_scaled = self.scaler.transform(features_poly)
        risk_score = float(self.model.predict(features_scaled)[0])
        
        return self._format_prediction(features[0], risk_score)

    def _format_prediction(self, raw_features, risk_score):
        flags = self._generate_flags(raw_features)
        risk_level = self._determine_risk_level(risk_score)
        
        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "behavioral_flags": flags
        }

    @staticmethod
    def _determine_risk_level(score):
        if score < 50:
            return "Low Risk"
        elif score < 75:
            return "Medium Risk"
        return "High Risk"

    @staticmethod
    def _generate_flags(features):
        flags = []
        thresholds = {
            "mouse_erratic": (70, "Suspicious Mouse Movement"),
            "typing_speed": (300, "Unusually Fast Typing"),
            "typing_consistency": (40, "Inconsistent Typing Pattern"),
            "unnatural_pauses": (40, "Frequent Unnatural Pauses"),
            "window_switches": (30, "Excessive Tab Switching")
        }
        
        for (i, (_, message)) in enumerate(thresholds.items()):
            if features[i] > thresholds[list(thresholds.keys())[i]][0]:
                flags.append(message)
                
        return flags

predictor = RiskPredictor()

def predict_risk_score(features):
    return predictor.predict(features)