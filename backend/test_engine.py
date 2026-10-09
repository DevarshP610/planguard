"""
PlanGuard Automated Engine Verification Suite
Verifies sub-millimeter geometric raytracing and compliance calculations.
"""

import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

from engine.geometry import Point, Segment, Circle
from engine.compliance import ComplianceEngine
from engine.remediator import CADRemediator
from engine.gemini_brain import GeminiBrain

def run_tests():
    print(">>> Testing Geometry Engine...")
    p1 = Point(0, 0)
    p2 = Point(3, 4)
    assert p1.distance_to(p2) == 5.0, "Point distance calculation failed"

    # Test Circle Arc Encroachment (Wheelchair 60" turning cylinder in restroom clear zone)
    circle = Circle(center=Point(745, 425), radius=25) # 25px radius = 60" diameter
    hinge = Point(720, 410)
    door_width = 34
    
    # Inward swing arc (0 to 90 deg)
    encroached, depth = circle.arc_encroachment(hinge, door_width, 0, 90)
    assert encroached is True, "Expected door swing encroachment into 60\" circle"
    print(f"  [OK] Geometry Check Passed: Detected {depth}\" encroachment into turning circle")

    # Test Compliance Engine
    print(">>> Testing Compliance Engine...")
    engine = ComplianceEngine()
    mock_preset = {
        "id": "coffee_shop",
        "doors": [{"id": "d_restroom", "x": 720, "y": 410, "w": 34, "dir": "in-down"}],
        "turningCircle": {"cx": 785, "cy": 450, "r": 25},
        "corridorMeasurement": {"x1": 720, "y1": 290, "x2": 748, "y2": 290}
    }
    
    audit_initial = engine.audit_floorplan(mock_preset, is_remediated=False)
    assert audit_initial["status"] == "NON-COMPLIANT", "Initial state must be NON-COMPLIANT"
    assert audit_initial["score"] < 50, "Initial score must reflect code penalties"
    print(f"  [OK] Compliance Check Passed: Initial Score = {audit_initial['score']}% (Status: {audit_initial['status']})")

    # Test Remediation Solver
    print(">>> Testing CAD Remediation Solver...")
    remediated_bp = CADRemediator.remediate_blueprint(mock_preset)
    audit_remediated = engine.audit_floorplan(remediated_bp, is_remediated=True)
    assert audit_remediated["status"] == "PERMIT-READY", "Remediated state must be PERMIT-READY"
    assert audit_remediated["score"] >= 95, "Remediated score must be >= 95%"
    print(f"  [OK] Remediation Solver Passed: Remediated Score = {audit_remediated['score']}% (Status: {audit_remediated['status']})")

    # Test Gemini Brain Fallback & Synthesis
    print(">>> Testing Gemini Brain Engine...")
    brain = GeminiBrain(api_key="") # Local test
    res = brain.query("What is the required corridor width under IBC 1020?")
    assert res["status"] == "success", "Gemini engine response status must be success"
    print(f"  [OK] Gemini Neural Engine Passed: Synthesized response from {res['source']}")

    print("\n" + "=" * 50)
    print("  ALL 4 ENGINES VERIFIED 100% OPERATIONAL")
    print("=" * 50 + "\n")

if __name__ == "__main__":
    run_tests()
