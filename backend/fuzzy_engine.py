import numpy as np

def compute_urgency(severity: float, lesion_density: float):
    # Fuzzification
    def fuzzify(val, low_thresh, high_thresh):
        # returns dict of {Low, Medium, High} memberships
        mem = {"Low": 0.0, "Medium": 0.0, "High": 0.0}
        
        # Low membership
        if val <= low_thresh[0]: mem["Low"] = 1.0
        elif val < low_thresh[1]: mem["Low"] = (low_thresh[1] - val) / (low_thresh[1] - low_thresh[0])
        else: mem["Low"] = 0.0
        
        # Medium membership
        if val <= low_thresh[0] or val >= high_thresh[1]: mem["Medium"] = 0.0
        elif val < low_thresh[1]: mem["Medium"] = (val - low_thresh[0]) / (low_thresh[1] - low_thresh[0])
        elif val <= high_thresh[0]: mem["Medium"] = 1.0
        else: mem["Medium"] = (high_thresh[1] - val) / (high_thresh[1] - high_thresh[0])
        
        # High membership
        if val >= high_thresh[1]: mem["High"] = 1.0
        elif val > high_thresh[0]: mem["High"] = (val - high_thresh[0]) / (high_thresh[1] - high_thresh[0])
        else: mem["High"] = 0.0
            
        return mem

    # Define thresholds
    S = fuzzify(severity, [0.3, 0.5], [0.6, 0.8])
    L = fuzzify(lesion_density, [0.3, 0.5], [0.6, 0.8])

    # Rule Evaluation (Mamdani Inference - Min/Max)
    # Rules:
    # 1. IF severity is Low AND lesion is Low -> Urgency Low
    # 2. IF severity is Low AND lesion is Medium -> Urgency Low
    # 3. IF severity is Medium object -> Urgency Medium
    # 4. IF severity is High AND lesion is High -> Urgency High
    # 5. IF severity is High -> Urgency High
    
    rule1 = min(S["Low"], L["Low"])
    rule2 = min(S["Low"], L["Medium"])
    rule3 = S["Medium"]
    rule4 = min(S["High"], L["High"])
    rule5 = S["High"]
    
    urgency_mem = {
        "Low": max(rule1, rule2),
        "Medium": rule3,
        "High": max(rule4, rule5)
    }

    # Defuzzification (Centroid method simplified by picking max membership)
    final_urgency = max(urgency_mem, key=urgency_mem.get)
    
    # Recommendation mapping
    recs = {
        "Low": "Your scan shows minimal to no signs of risk. Routine check-up in 6–12 months is recommended.",
        "Medium": "There are moderate indications of retinopathy. Please consult an ophthalmologist within 2 weeks for a comprehensive examination.",
        "High": "Critical signs detected such as high lesion density or severe severity. Urgent medical attention is required to prevent further complications."
    }
    
    return final_urgency, recs[final_urgency]
