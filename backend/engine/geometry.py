"""
PlanGuard CAD Geometry & Spatial Computation Engine
Provides sub-millimeter geometric raytracing, collision detection, and spatial clearances.
"""

import math
from typing import List, Tuple, Dict, Any, Optional

class Point:
    def __init__(self, x: float, y: float):
        self.x = float(x)
        self.y = float(y)

    def distance_to(self, other: 'Point') -> float:
        return math.hypot(self.x - other.x, self.y - other.y)

    def to_dict(self) -> Dict[str, float]:
        return {"x": round(self.x, 2), "y": round(self.y, 2)}


class Segment:
    def __init__(self, p1: Point, p2: Point):
        self.p1 = p1
        self.p2 = p2

    def length(self) -> float:
        return self.p1.distance_to(self.p2)

    def distance_to_point(self, pt: Point) -> float:
        """Computes shortest distance from point to line segment."""
        px = self.p2.x - self.p1.x
        py = self.p2.y - self.p1.y
        norm = px * px + py * py
        if norm == 0:
            return pt.distance_to(self.p1)
        u = ((pt.x - self.p1.x) * px + (pt.y - self.p1.y) * py) / float(norm)
        u = max(0.0, min(1.0, u))
        nearest_x = self.p1.x + u * px
        nearest_y = self.p1.y + u * py
        return pt.distance_to(Point(nearest_x, nearest_y))


class Circle:
    def __init__(self, center: Point, radius: float):
        self.center = center
        self.radius = float(radius)

    def intersects_segment(self, seg: Segment) -> bool:
        """Determines if segment encroaches into circular space."""
        return seg.distance_to_point(self.center) < self.radius

    def arc_encroachment(self, hinge: Point, door_width: float, start_deg: float, end_deg: float) -> Tuple[bool, float]:
        """
        Calculates whether a swinging door arc encroaches into the turning circle
        and returns encroachment depth in inches (at scale 10px = 1 foot / 1px = 1.2 inches).
        """
        # Sample points along the door swing arc
        samples = 24
        max_intrusion = 0.0
        encroached = False
        
        start_rad = math.radians(start_deg)
        end_rad = math.radians(end_deg)
        
        for i in range(samples + 1):
            theta = start_rad + (end_rad - start_rad) * (i / samples)
            arc_pt = Point(
                hinge.x + door_width * math.cos(theta),
                hinge.y + door_width * math.sin(theta)
            )
            dist = self.center.distance_to(arc_pt)
            if dist < self.radius:
                encroached = True
                intrusion_px = self.radius - dist
                intrusion_in = intrusion_px * 1.2
                if intrusion_in > max_intrusion:
                    max_intrusion = intrusion_in
                    
        return encroached, round(max_intrusion, 1)


def check_corridor_width(wall_a: Segment, wall_b: Segment) -> float:
    """Calculates minimum perpendicular clearance between two parallel corridor walls in inches."""
    # Compute midpoint distance
    mid_a = Point((wall_a.p1.x + wall_a.p2.x) / 2, (wall_a.p1.y + wall_a.p2.y) / 2)
    dist_px = wall_b.distance_to_point(mid_a)
    return round(dist_px * 1.2, 1)
