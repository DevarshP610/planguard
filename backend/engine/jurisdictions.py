"""
PlanGuard Municipal & State Jurisdictional Regulatory Matrix
Provides statutory building codes and amendments tailored to specific US cities and states.
"""

from typing import Dict, Any

JURISDICTIONS: Dict[str, Dict[str, Any]] = {
    "san_francisco": {
        "id": "san_francisco",
        "name": "San Francisco, CA",
        "state": "California",
        "authority": "San Francisco Department of Building Inspection (SFDBI)",
        "code_base": "California Building Code (CBC 2022 Title 24, Part 2)",
        "accessibility_standard": "CalDAG & 2022 CBC Chapter 11B",
        "rules": {
            "restroom_door": {
                "citation": "CBC Title 24 § 11B-604.3.1 & § 11B-404.2.4",
                "title": "Door Swing Encroachment into Turning Space",
                "standard": "No door swing into required 60\" turning space in single-user toilet rooms (strict California standard).",
                "remedy": "Reverse swing outward into corridor with approved latch clearance."
            },
            "corridor_width": {
                "citation": "2022 CBC § 1020.2 & SFDBI Information Sheet G-06",
                "title": "Continuous Egress Corridor Clearance",
                "standard": "Minimum 44 inches clear width required for occupant loads ≥ 50; 36 inches for < 50.",
                "remedy": "Shift interior non-bearing drywall partition 10 inches outward."
            },
            "counter_height": {
                "citation": "CBC Title 24 § 11B-904.4.1",
                "title": "Accessible Transaction Surface Elevation",
                "standard": "Maximum 34 inches finished height above floor (stricter than federal 36\" limit) for minimum 36\" length.",
                "remedy": "Lower transaction section to 34 inches AFF with compliant knee clearance."
            }
        }
    },
    "new_york_city": {
        "id": "new_york_city",
        "name": "New York City, NY",
        "state": "New York",
        "authority": "NYC Department of Buildings (DOB)",
        "code_base": "2022 NYC Building Code (Local Law 77 / Title 28)",
        "accessibility_standard": "2022 NYC BC Chapter 11 & ICC/ANSI A117.1",
        "rules": {
            "restroom_door": {
                "citation": "2022 NYC BC § 1109.2.1 & ANSI A117.1 § 604.3",
                "title": "Clear Floor Turning Space Intrusion",
                "standard": "Doors shall not encroach into 60\" turning space unless clear space of 30\"x48\" exists beyond arc.",
                "remedy": "Invert door swing or specify approved pocket sliding door with pull hardware."
            },
            "corridor_width": {
                "citation": "2022 NYC BC § 1020.2",
                "title": "NYC Means of Egress Corridor Width",
                "standard": "Minimum 44 inches clear unobstructed width required for Assembly and Business occupancies.",
                "remedy": "Relocate partition wall to achieve 44 inches continuous egress width."
            },
            "counter_height": {
                "citation": "2022 NYC BC § 1109.12.3",
                "title": "Customer Service Counter Reach Compliance",
                "standard": "Counter top maximum 36 inches AFF for minimum 36 inches continuous run.",
                "remedy": "Provide 36\" wide accessible counter tier at 34\" AFF."
            }
        }
    },
    "austin_tx": {
        "id": "austin_tx",
        "name": "Austin, TX",
        "state": "Texas",
        "authority": "City of Austin Development Services Department (DSD)",
        "code_base": "2021 International Building Code with Austin Local Amendments",
        "accessibility_standard": "Texas Accessibility Standards (TAS 2012 / TDLR)",
        "rules": {
            "restroom_door": {
                "citation": "TAS § 604.3.1 & City of Austin Ordinance No. 20210408-034",
                "title": "Single-Occupant Restroom Turning Clearance",
                "standard": "Door swing cannot encroach into the required 60-inch circular turning space.",
                "remedy": "Reverse door swing outward with TDLR compliant lever hardware."
            },
            "corridor_width": {
                "citation": "2021 IBC § 1020.2 (CoA Technical Criteria Manual)",
                "title": "Corridor Minimum Egress Width",
                "standard": "44 inches minimum clear span for occupant loads exceeding 50.",
                "remedy": "Widen corridor to 44 inches minimum clear opening."
            },
            "counter_height": {
                "citation": "TAS § 904.4.1",
                "title": "Accessible Sales & Service Counters",
                "standard": "36 inches max AFF for length of at least 36 inches.",
                "remedy": "Provide drop counter section at 34\" AFF."
            }
        }
    },
    "chicago_il": {
        "id": "chicago_il",
        "name": "Chicago, IL",
        "state": "Illinois",
        "authority": "City of Chicago Department of Buildings",
        "code_base": "Chicago Building Code (Title 14B)",
        "accessibility_standard": "Illinois Accessibility Code (IAC 71 Ill. Adm. Code 400)",
        "rules": {
            "restroom_door": {
                "citation": "Chicago Building Code § 14B-11-1109 & IAC § 400.310",
                "title": "Accessible Toilet Compartment Clearance",
                "standard": "Door swing shall not impede the 60\" turning circle within the accessible compartment.",
                "remedy": "Re-hang door to swing outward into circulation space."
            },
            "corridor_width": {
                "citation": "Chicago Building Code § 14B-10-1020.2",
                "title": "Exit Access Corridor Width",
                "standard": "Minimum 44 inches clear width in non-residential buildings.",
                "remedy": "Shift demising drywall partition outward to 44\" clear."
            },
            "counter_height": {
                "citation": "IAC § 400.310 (Service Counters)",
                "title": "Cashier & Transaction Counter Access",
                "standard": "Lowered transaction surface required at 34\"-36\" AFF.",
                "remedy": "Install 36\" wide lowered service counter."
            }
        }
    },
    "seattle_wa": {
        "id": "seattle_wa",
        "name": "Seattle, WA",
        "state": "Washington",
        "authority": "Seattle Dept of Construction & Inspections (SDCI)",
        "code_base": "2021 Seattle Building Code (SBC)",
        "accessibility_standard": "ICC/ANSI A117.1-2017 & WAC 51-50",
        "rules": {
            "restroom_door": {
                "citation": "2021 SBC § 1109.2.1 & WAC 51-50-1101",
                "title": "Water Closet Clearance & Door Swing",
                "standard": "Door swing cannot encroach into the required 60\" turning space.",
                "remedy": "Specify outward swinging egress door with closer delay."
            },
            "corridor_width": {
                "citation": "2021 SBC § 1020.2",
                "title": "Corridor Egress Minimum Width",
                "standard": "Minimum 44 inches unobstructed width for business and mercantile occupancies.",
                "remedy": "Relocate non-bearing partition 10 inches to provide 44 inches clear."
            },
            "counter_height": {
                "citation": "2021 SBC § 1109.12",
                "title": "Point-of-Sale Accessible Counter",
                "standard": "Maximum 36 inches above finished floor for minimum 36 inches length.",
                "remedy": "Lower transaction counter segment to 34 inches AFF."
            }
        }
    },
    "miami_fl": {
        "id": "miami_fl",
        "name": "Miami, FL",
        "state": "Florida",
        "authority": "Miami-Dade Regulatory and Economic Resources (RER)",
        "code_base": "2023 Florida Building Code (FBC 8th Edition)",
        "accessibility_standard": "Florida Accessibility Code for Building Construction (FACBC)",
        "rules": {
            "restroom_door": {
                "citation": "FACBC § 604.3.1 & FBC § 11-604",
                "title": "Single Occupant Restroom Door Clearance",
                "standard": "Door swing shall not encroach upon the required 60\" turning diameter.",
                "remedy": "Reverse door swing outward with hurricane-rated latch hardware."
            },
            "corridor_width": {
                "citation": "2023 FBC Building § 1020.2",
                "title": "Commercial Exit Corridor Dimension",
                "standard": "Minimum 44 inches clear width required for occupant load ≥ 50.",
                "remedy": "Widen corridor to 44 inches clear dimension."
            },
            "counter_height": {
                "citation": "FACBC § 904.4.1",
                "title": "Accessible Sales Counter Elevation",
                "standard": "Finished counter height not to exceed 36 inches AFF.",
                "remedy": "Provide accessible service section at 34 inches AFF."
            }
        }
    },
    "denver_co": {
        "id": "denver_co",
        "name": "Denver, CO",
        "state": "Colorado",
        "authority": "Denver Community Planning and Development (CPD)",
        "code_base": "2022 Denver Building and Fire Code (DBFC)",
        "accessibility_standard": "2010 ADA Standards & ICC A117.1",
        "rules": {
            "restroom_door": {
                "citation": "2022 DBFC § 1109.2 & ADA § 604.3.1",
                "title": "Restroom Turning Clearance Encroachment",
                "standard": "Doors shall not swing into the required 60-inch circular turning space.",
                "remedy": "Reverse door swing outward into the corridor."
            },
            "corridor_width": {
                "citation": "2022 DBFC § 1020.2",
                "title": "Exit Access Corridor Dimension",
                "standard": "Minimum 44 inches clear width for commercial and assembly suites.",
                "remedy": "Relocate demising wall outward to achieve 44 inches."
            },
            "counter_height": {
                "citation": "2022 DBFC § 1109.12",
                "title": "Public Counter Height",
                "standard": "Maximum 36 inches AFF for a continuous length of 36 inches.",
                "remedy": "Provide 34-inch AFF lowered transaction section."
            }
        }
    },
    "national_ibc": {
        "id": "national_ibc",
        "name": "National Standard (US)",
        "state": "Federal",
        "authority": "International Code Council (ICC) & US Access Board",
        "code_base": "2024 International Building Code (IBC Chapter 10)",
        "accessibility_standard": "2010 ADA Standards for Accessible Design",
        "rules": {
            "restroom_door": {
                "citation": "2010 ADA Standards § 404.2.4 & § 604.3.1",
                "title": "Door Swing Intrusion into Turning Space",
                "standard": "Doors shall not swing into required 60\" turning space in single-user toilet rooms.",
                "remedy": "Reverse door swing outward into the corridor."
            },
            "corridor_width": {
                "citation": "2024 IBC § 1020.2",
                "title": "Minimum Egress Corridor Width",
                "standard": "Minimum 44 inches required where occupant load exceeds 50.",
                "remedy": "Widen corridor clear width to minimum 44 inches."
            },
            "counter_height": {
                "citation": "2010 ADA Standards § 904.4.1",
                "title": "Accessible Counter Elevation",
                "standard": "Maximum 36 inches AFF for minimum 36 inches continuous length.",
                "remedy": "Provide accessible transaction counter section at 34\" AFF."
            }
        }
    }
}
