from pydantic import BaseModel, Field

class StudentBehavior(BaseModel):
    mouse_erratic_behavior: float = Field(..., ge=0, le=100)
    mouse_inactivity_time: float = Field(..., ge=0)
    typing_speed: float = Field(..., ge=0)
    typing_consistency: float = Field(..., ge=0, le=100)
    unnatural_pauses: float = Field(..., ge=0)
    window_switches: float = Field(..., ge=0)

class RiskPrediction(BaseModel):
    risk_score: float
    risk_level: str
    behavioral_flags: list[str]