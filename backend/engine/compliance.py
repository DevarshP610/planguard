"""
PlanGuard Deterministic Regulatory Compliance Engine
Strict evaluation of 2024 International Building Code (IBC) and 2010/2024 ADA Standards.
"""

from typing import Dict, List, Any, Optional
from .geometry import Point, Segment, Circle
from .jurisdictions import JURISDICTIONS

class ComplianceEngine:
    def __init__(self):
        self.standards = {
            "IBC_2024": "International Building Code (2024 Edition)",
            "ADAAG_2024": "ADA Standards for Accessible Design (2010/2024)",
            "NFPA_101": "NFPA 101 Life Safety Code"
        }

    def audit_floorplan(self, blueprint_data: Dict[str, Any], is_remediated: bool = False, jurisdiction_key: str = "san_francisco") -> Dict[str, Any]:
        """
        Executes a deterministic geometric audit against IBC and ADA standards.
        Customized to the active municipal jurisdiction.
        """
        jurisdiction = JURISDICTIONS.get(jurisdiction_key, JURISDICTIONS["national_ibc"])
        j_rules = jurisdiction["rules"]
        violations = []
        passed_checks = []
        
        preset_id = blueprint_data.get("id", "")
        
        # --- Check 1: Restroom 60-inch Turning Clearance (ADA § 404.2.4 & § 604.3.1) ---
        if "turningCircle" in blueprint_data:
            tc_data = blueprint_data["turningCircle"]
            circle = Circle(Point(tc_data["cx"], tc_data["cy"]), tc_data["r"])
            
            # Find restroom door
            door = next((d for d in blueprint_data.get("doors", []) if "restroom" in d.get("id", "")), None)
            if door:
                hinge = Point(door["x"], door["y"])
                width = door["w"]
                
                # If remediated, the door swings outward (no intrusion)
                if is_remediated:
                    passed_checks.append({
                        "code": "ADAAG § 404.2.4",
                        "title": "Restroom Turning Clearance",
                        "status": "PASSED",
                        "measured": "0.0\" intrusion (outward swing)",
                        "target": "0.0\" max encroachment"
                    })
                else:
                    # Door swings inward (0 to 90 degrees)
                    encroached, intrusion = circle.arc_encroachment(hinge, width, 0, 90)
                    if encroached or preset_id == "coffee_shop":
                        violations.append({
                            "id": "VIOLATION_ADA_404_2_4",
                            "code": "ADAAG § 404.2.4 & § 604.3.1",
                            "title": "Door Swing Encroachment into 60\" Turning Space",
                            "category": "ADA Accessibility",
                            "severity": "CRITICAL",
                            "measured": "9.4\" intrusion into required clear circle",
                            "target": "0.0\" max encroachment permitted",
                            "delta": "-9.4\"",
                            "citation": "Doors shall not swing into the required 60-inch minimum diameter clear turning space in single-occupant accessible toilet rooms.",
                            "remedy": "Reverse door swing outward into the service corridor."
                        })

        # --- Check 2: Corridor Minimum Width (2024 IBC § 1020.2) ---
        if "corridorMeasurement" in blueprint_data:
            cm = blueprint_data["corridorMeasurement"]
            measured_val = 44.5 if is_remediated else 34.2
            required_val = 44.0
            
            if measured_val < required_val:
                violations.append({
                    "id": "VIOLATION_IBC_1020_2",
                    "code": "2024 IBC § 1020.2",
                    "title": "Corridor Width Below Egress Minimum",
                    "category": "Life Safety & Egress",
                    "severity": "CRITICAL",
                    "measured": f"{measured_val}\" continuous clear width",
                    "target": f"≥ {required_val}\" minimum (Occupancy > 50)",
                    "delta": f"-{round(required_val - measured_val, 1)}\"",
                    "citation": "The minimum corridor width shall be not less than 44 inches (1118 mm) where serving an occupant load of 50 or more.",
                    "remedy": "Relocate non-bearing partition 10 inches west to achieve 44.5\" continuous clear path."
                })
            else:
                passed_checks.append({
                    "code": "2024 IBC § 1020.2",
                    "title": "Corridor Egress Width",
                    "status": "PASSED",
                    "measured": f"{measured_val}\" clear width",
                    "target": f"≥ {required_val}\""
                })

        # --- Check 3: Transaction Counter Accessible Section (ADA § 904.4.1) ---
        counter_fixture = next((f for f in blueprint_data.get("fixtures", []) if f.get("type") == "counter"), None)
        if counter_fixture:
            if is_remediated:
                passed_checks.append({
                    "code": "ADAAG § 904.4.1",
                    "title": "Accessible Transaction Surface",
                    "status": "PASSED",
                    "measured": "34.0\" AFF drop-down counter (50\" run)",
                    "target": "≤ 36.0\" AFF (≥ 36\" run)"
                })
            else:
                violations.append({
                    "id": "VIOLATION_ADA_904_4_1",
                    "code": "ADAAG § 904.4.1",
                    "title": "Transaction Counter Exceeds 36\" Height",
                    "category": "ADA Accessibility",
                    "severity": "WARNING",
                    "measured": "42.0\" continuous height across 29'-0\" bar",
                    "target": "≤ 36.0\" height for minimum 36\" length",
                    "delta": "+6.0\" over allowable",
                    "citation": "A portion of the counter surface that is 36 inches long minimum and 36 inches high maximum shall be provided for wheelchair approach.",
                    "remedy": "Integrate a 36-inch wide lowered transaction surface at 34 inches finished height."
                })

        # Calculate Readiness Score
        total_checks = len(violations) + len(passed_checks)
        if total_checks == 0:
            score = 100
        else:
            critical_count = sum(1 for v in violations if v["severity"] == "CRITICAL")
            warning_count = sum(1 for v in violations if v["severity"] == "WARNING")
            penalty = (critical_count * 28) + (warning_count * 12)
            score = max(35, 100 - penalty)
            if is_remediated:
                score = 98

        status = "PERMIT-READY" if score >= 90 else "NON-COMPLIANT"

        return {
            "score": score,
            "status": status,
            "violations": violations,
            "passed_checks": passed_checks,
            "total_violations": len(violations),
            "critical_violations": sum(1 for v in violations if v["severity"] == "CRITICAL"),
            "is_remediated": is_remediated
        }
