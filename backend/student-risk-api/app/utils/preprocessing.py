import numpy as np
from app.schemas.student import StudentBehavior

def preprocess_features(student: StudentBehavior) -> np.ndarray:
    return np.array([[
        student.mouse_erratic_behavior,
        student.mouse_inactivity_time,
        student.typing_speed,
        student.typing_consistency,
        student.unnatural_pauses,
        student.window_switches
    ]])