import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.linear_model import RidgeCV
from sklearn.ensemble import StackingRegressor
import joblib
from pathlib import Path

def train_model():
    # Create saved_models directory if it doesn't exist
    Path("saved_models").mkdir(exist_ok=True)
    
    # Load and prepare data
    df = pd.read_csv("data/student_risk_dataset.csv")
    X = df.drop(columns=["Risk_Score"])
    y = df["Risk_Score"]

    # Feature engineering
    poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
    X_poly = poly.fit_transform(X)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_poly)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Create and train stacked model
    estimators = [
        ('xgb', XGBRegressor(n_estimators=300, learning_rate=0.05, 
                            max_depth=6, random_state=42)),
        ('rf', RandomForestRegressor(n_estimators=200, random_state=42))
    ]
    
    stacked_model = StackingRegressor(
        estimators=estimators,
        final_estimator=RidgeCV(),
        n_jobs=-1
    )

    # Train model
    stacked_model.fit(X_train, y_train)

    # Save models
    joblib.dump(poly, 'saved_models/poly_features.joblib')
    joblib.dump(scaler, 'saved_models/scaler.joblib')
    joblib.dump(stacked_model, 'saved_models/stacked_model.joblib')

if __name__ == "__main__":
    train_model()