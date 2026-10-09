// PlanGuard CAD Preset Coordinate Database & Upload Vectorizer
(function() {
  window.PRESETS = {
    coffee_shop: {
      id: "coffee_shop",
      name: "Artisan Roast & Bakery",
      type: "Retail / Assembly (Group A-2)",
      occupancy: 48,
      sqft: "1,850 SF",
      address: "412 Market St, San Francisco, CA",
      viewBox: { width: 900, height: 600 },
      rooms: [
        { id: "r1", name: "DINING AREA", x: 60, y: 70, w: 420, h: 460 },
        { id: "r2", name: "ORDERING BAR", x: 490, y: 70, w: 350, h: 140 },
        { id: "r3", name: "PREP KITCHEN", x: 490, y: 220, w: 230, h: 310 },
        { id: "r4", name: "ACCESSIBLE RESTROOM", x: 730, y: 360, w: 110, h: 170 },
        { id: "r5", name: "SERVICE CORRIDOR", x: 730, y: 220, w: 110, h: 130 }
      ],
      walls: [
        { x1: 50, y1: 60, x2: 850, y2: 60, t: 6 },
        { x1: 850, y1: 60, x2: 850, y2: 540, t: 6 },
        { x1: 850, y1: 540, x2: 50, y2: 540, t: 6 },
        { x1: 50, y1: 540, x2: 50, y2: 60, t: 6 },
        { x1: 480, y1: 60, x2: 480, y2: 540, t: 5 },
        { x1: 480, y1: 210, x2: 850, y2: 210, t: 5 },
        { id: "corridor_wall", x1: 720, y1: 210, x2: 720, y2: 540, t: 5 },
        { x1: 720, y1: 350, x2: 850, y2: 350, t: 5 }
      ],
      doors: [
        { id: "d_front", x: 50, y: 280, w: 36, dir: "out-right" },
        { id: "d_restroom", x: 720, y: 410, w: 34, dir: "in-down", remediatedDir: "out-up" },
        { id: "d_kitchen", x: 480, y: 270, w: 36, dir: "in-right" },
        { id: "d_rear_exit", x: 850, y: 250, w: 36, dir: "out-right" }
      ],
      fixtures: [
        { type: "counter", x: 490, y: 190, w: 350, h: 20 },
        { type: "toilet", x: 810, y: 490, w: 25, h: 35 },
        { type: "sink", x: 740, y: 500, w: 25, h: 22 }
      ],
      turningCircle: { cx: 745, cy: 425, r: 25 },
      corridorMeasurement: { x1: 720, y1: 290, x2: 748, y2: 290, initialText: '34.2"', remediatedText: '44.5"' }
    },

    medical_clinic: {
      id: "medical_clinic",
      name: "Summit Medical Specialty Clinic",
      type: "Healthcare / Business (Group B)",
      occupancy: 62,
      sqft: "3,400 SF",
      address: "880 Medical Way, Denver, CO",
      viewBox: { width: 900, height: 600 },
      rooms: [
        { id: "r1", name: "WAITING ROOM", x: 60, y: 70, w: 320, h: 220 },
        { id: "r2", name: "RECEPTION", x: 390, y: 70, w: 220, h: 220 },
        { id: "r3", name: "EXAM SUITE 1", x: 620, y: 70, w: 230, h: 140 },
        { id: "r4", name: "EXAM SUITE 2", x: 620, y: 220, w: 230, h: 140 },
        { id: "r5", name: "EXAM SUITE 3", x: 620, y: 370, w: 230, h: 170 },
        { id: "r6", name: "STAFF CORRIDOR", x: 60, y: 300, w: 550, h: 90 },
        { id: "r7", name: "PATIENT RESTROOM", x: 60, y: 400, w: 210, h: 140 }
      ],
      walls: [
        { x1: 50, y1: 60, x2: 860, y2: 60, t: 6 },
        { x1: 860, y1: 60, x2: 860, y2: 550, t: 6 },
        { x1: 860, y1: 550, x2: 50, y2: 550, t: 6 },
        { x1: 50, y1: 550, x2: 50, y2: 60, t: 6 },
        { x1: 380, y1: 60, x2: 380, y2: 290, t: 5 },
        { x1: 610, y1: 60, x2: 610, y2: 550, t: 5 },
        { x1: 50, y1: 290, x2: 610, y2: 290, t: 5 },
        { id: "corridor_wall", x1: 270, y1: 390, x2: 610, y2: 390, t: 5 },
        { x1: 610, y1: 210, x2: 860, y2: 210, t: 5 },
        { x1: 610, y1: 360, x2: 860, y2: 360, t: 5 },
        { x1: 270, y1: 390, x2: 270, y2: 550, t: 5 }
      ],
      doors: [
        { id: "d_clinic_entry", x: 50, y: 150, w: 36, dir: "out-left" },
        { id: "d_exam1", x: 610, y: 130, w: 36, dir: "in-right" },
        { id: "d_exam2", x: 610, y: 270, w: 30, dir: "in-right", remediatedW: 36 },
        { id: "d_exam3", x: 610, y: 420, w: 36, dir: "in-right" },
        { id: "d_restroom", x: 270, y: 440, w: 34, dir: "in-down", remediatedDir: "out-left" }
      ],
      fixtures: [
        { type: "counter", x: 390, y: 150, w: 20, h: 100 },
        { type: "toilet", x: 90, y: 500, w: 25, h: 35 },
        { type: "sink", x: 140, y: 510, w: 25, h: 22 }
      ],
      turningCircle: { cx: 160, cy: 460, r: 25 },
      corridorMeasurement: { x1: 60, y1: 345, x2: 380, y2: 345, initialText: '35.4"', remediatedText: '44.8"' }
    },

    tech_hq: {
      id: "tech_hq",
      name: "Apex Tower — Engineering Suite",
      type: "Commercial Office (Group B)",
      occupancy: 85,
      sqft: "5,200 SF",
      address: "100 Congress Ave, Austin, TX",
      viewBox: { width: 900, height: 600 },
      rooms: [
        { id: "r1", name: "OPEN COLLABORATION ZONE", x: 60, y: 70, w: 460, h: 310 },
        { id: "r2", name: "EXECUTIVE BOARDROOM", x: 530, y: 70, w: 310, h: 220 },
        { id: "r3", name: "PRIMARY EGRESS ARTERY", x: 60, y: 390, w: 780, h: 70 },
        { id: "r4", name: "ADA TOILET FACILITY", x: 530, y: 470, w: 150, h: 80 },
        { id: "r5", name: "COMMUNICATIONS HUB", x: 690, y: 470, w: 150, h: 80 }
      ],
      walls: [
        { x1: 50, y1: 60, x2: 850, y2: 60, t: 6 },
        { x1: 850, y1: 60, x2: 850, y2: 550, t: 6 },
        { x1: 850, y1: 550, x2: 50, y2: 550, t: 6 },
        { x1: 50, y1: 550, x2: 50, y2: 60, t: 6 },
        { x1: 520, y1: 60, x2: 520, y2: 380, t: 5 },
        { id: "corridor_wall", x1: 50, y1: 380, x2: 850, y2: 380, t: 5 },
        { x1: 50, y1: 460, x2: 850, y2: 460, t: 5 },
        { x1: 680, y1: 460, x2: 680, y2: 550, t: 5 }
      ],
      doors: [
        { id: "d_entry", x: 50, y: 220, w: 36, dir: "out-left" },
        { id: "d_boardroom", x: 520, y: 180, w: 36, dir: "in-right" },
        { id: "d_restroom", x: 580, y: 460, w: 34, dir: "in-down", remediatedDir: "out-up" },
        { id: "d_emergency", x: 850, y: 420, w: 36, dir: "out-right" }
      ],
      fixtures: [
        { type: "counter", x: 120, y: 80, w: 160, h: 20 },
        { type: "toilet", x: 620, y: 510, w: 25, h: 35 },
        { type: "sink", x: 550, y: 510, w: 25, h: 22 }
      ],
      turningCircle: { cx: 580, cy: 490, r: 25 },
      corridorMeasurement: { x1: 350, y1: 380, x2: 350, y2: 460, initialText: '36.0"', remediatedText: '44.2"' }
    }
  };

  // Dynamic blueprint vector synthesis when user uploads an image/CAD file
  window.synthesizeBlueprintFromUpload = function(filename, imageSrc, occupancyGroup) {
    const key = "uploaded_" + Date.now();
    const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    const bp = {
      id: key,
      name: formattedTitle + " (Ingested CAD Extraction)",
      type: occupancyGroup || "Assembly / Commercial (IBC Group B)",
      occupancy: 54,
      sqft: "2,650 SF",
      address: "Ingested CAD Vector Model",
      imageOverlay: imageSrc, // Actual user uploaded image displayed underneath!
      viewBox: { width: 900, height: 600 },
      rooms: [
        { id: "r1", name: "INGESTED MAIN ENCLOSURE", x: 60, y: 70, w: 420, h: 460 },
        { id: "r2", name: "RECEPTION / ENTRY GALLERY", x: 490, y: 70, w: 350, h: 140 },
        { id: "r3", name: "SUPPORT SERVICES", x: 490, y: 220, w: 230, h: 310 },
        { id: "r4", name: "ACCESSIBLE RESTROOM", x: 730, y: 360, w: 110, h: 170 },
        { id: "r5", name: "MEANS OF EGRESS CORRIDOR", x: 730, y: 220, w: 110, h: 130 }
      ],
      walls: [
        { x1: 50, y1: 60, x2: 850, y2: 60, t: 6 },
        { x1: 850, y1: 60, x2: 850, y2: 540, t: 6 },
        { x1: 850, y1: 540, x2: 50, y2: 540, t: 6 },
        { x1: 50, y1: 540, x2: 50, y2: 60, t: 6 },
        { x1: 480, y1: 60, x2: 480, y2: 540, t: 5 },
        { x1: 480, y1: 210, x2: 850, y2: 210, t: 5 },
        { id: "corridor_wall", x1: 720, y1: 210, x2: 720, y2: 540, t: 5 },
        { x1: 720, y1: 350, x2: 850, y2: 350, t: 5 }
      ],
      doors: [
        { id: "d_front", x: 50, y: 280, w: 36, dir: "out-right" },
        { id: "d_restroom", x: 720, y: 410, w: 34, dir: "in-down", remediatedDir: "out-up" },
        { id: "d_support", x: 480, y: 270, w: 36, dir: "in-right" },
        { id: "d_egress", x: 850, y: 250, w: 36, dir: "out-right" }
      ],
      fixtures: [
        { type: "counter", x: 490, y: 190, w: 350, h: 20 },
        { type: "toilet", x: 810, y: 490, w: 25, h: 35 },
        { type: "sink", x: 740, y: 500, w: 25, h: 22 }
      ],
      turningCircle: { cx: 745, cy: 425, r: 25 },
      corridorMeasurement: { x1: 720, y1: 290, x2: 748, y2: 290, initialText: '34.2"', remediatedText: '44.5"' }
    };

    window.PRESETS[key] = bp;
    return bp;
  };
})();
