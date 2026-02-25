🧊 PRD — “Kalaallit”

**Current Status: 85% Complete**

A Gold-Standard Leaflet Travel Application for Greenland


---

0. Vision

Design the most serene, emotionally resonant, map-first travel application ever built for Greenland — an experience that feels less like “using software” and more like standing quietly on Arctic ice while the aurora breathes above you.

No scrolling.
No clutter.
Only calm, depth, space, and intention.

This app is not a website with a map.
It is a map that becomes a living instrument.


---

1. Product Philosophy

Core Design Principles

1. Silence is a Feature
Minimal UI. Negative space. Ambient transitions.


2. Motion with Meaning
Every animation reinforces spatial understanding.


3. Depth Without Clutter
Information reveals progressively.


4. Map as Canvas
The map is the primary surface. Everything else emerges from it.


5. Zero Scroll Interface
All navigation occurs through:

Map gestures

Horizontal panels

Modal overlays

Subtle bottom sheets

Full-screen transitions





---

2. Product Overview

Product Name: Kalaallit
Platform: Web (Progressive Web App)
Core Technology: Leaflet.js
Audience:

High-end travelers

Arctic explorers

Photographers

Cultural tourists

Climate researchers



---

3. Core Experience Structure (No Scroll Architecture)

The app operates in 5 spatial layers:

1. Landing (Immersive Entry)


2. Map Exploration Mode


3. Destination Focus Mode


4. Experience Detail Mode


5. Environmental Insight Mode



Each transition uses smooth opacity + scale transitions (300–500ms cubic-bezier).


---

4. Geographic Context

Primary Anchors

Capital: Nuuk

UNESCO Site: Ilulissat Icefjord

Region: Disko Bay

Landmark: Scoresby Sund



---

5. Feature Set

5.1 Immersive Landing

Full-screen Arctic gradient (glacier blue → deep navy)

Subtle animated particle snow layer (WebGL)

Soft ambient Arctic wind audio (optional, muted by default)

Centered typography:

> “Kalaallit — Discover Greenland”




Tap → Transition to Map Mode.


---

5.2 Map Exploration Mode

Leaflet Base Configuration

Custom desaturated tile layer

Ice-toned color grading

No default zoom controls

Custom floating glassmorphism controls


Map Features

Pin clusters fade in gradually

Pins use frosted glass circular markers

On hover/tap:

Soft radial glow

Elevation animation

Subtle vibration (mobile)




---

5.3 Destination Focus Mode

When a marker is tapped:

Map smoothly zooms

Other pins fade

Frosted bottom sheet rises

Hero image fills 40% of screen

Title + short poetic descriptor


Example:

> Ilulissat Icefjord
“Where ice breathes into the sea.”



Buttons:

Explore

Route

Save



---

5.4 Experience Detail Mode

Full-screen modal overlay (no scroll).

Tabbed content navigation (horizontal swipe):

1. Overview


2. History


3. Best Time


4. Climate


5. Logistics



Each tab swaps content with fade transition.


---

5.5 Environmental Insight Mode

A special feature unique to Greenland:

Interactive ice thickness visual layer

Climate overlay toggle

Glacier retreat visualization (timeline slider)


This reinforces Greenland’s global importance.


---

6. Polished Native-Like Features

6.1 Haptic Micro-Interactions

Marker selection vibration

Tab switch pulse

Save confirmation feedback


6.2 Smart Transitions

Map zoom anchored to marker center

Crossfade between tiles

Parallax hero imagery


6.3 Gesture-Driven Navigation

Swipe down to dismiss

Pinch to close modal

Edge-swipe for region switching



---

7. Color System

Primary Palette:

Glacier Blue: #DDEFF7

Ice Shadow: #9BBED2

Deep Arctic Navy: #0C1C2C

Aurora Accent: #66FFCC


Dark mode default.


---

8. Typography

Headings: Elegant serif

Body: Clean modern sans-serif

Large tracking (letter-spacing)

Calm weight hierarchy



---

9. Technical Architecture

Frontend Stack

Leaflet.js

GSAP (smooth transitions)

WebGL overlay (particles)

Service Worker (offline support)

IndexedDB (saved destinations)



---

10. Leaflet App Structure (Core Implementation)

<!DOCTYPE html>
<html>
<head>
  <title>Kalaallit</title>
  <link rel="stylesheet" href="leaflet.css" />
  <script src="leaflet.js"></script>
  <style>
    html, body {
      margin:0;
      height:100%;
      background:#0C1C2C;
      overflow:hidden;
      font-family:system-ui;
    }

    #map {
      height:100%;
      width:100%;
    }

    .glass-panel {
      position:absolute;
      bottom:0;
      width:100%;
      height:35%;
      backdrop-filter: blur(20px);
      background: rgba(255,255,255,0.08);
      border-top-left-radius:24px;
      border-top-right-radius:24px;
      transition: transform 0.4s ease;
    }
  </style>
</head>
<body>
<div id="map"></div>

<script>
  const map = L.map('map', {
    zoomControl: false,
    minZoom: 3
  }).setView([64.1835, -51.7216], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ''
  }).addTo(map);

  const locations = [
    { name: "Nuuk", coords: [64.1835, -51.7216] },
    { name: "Ilulissat Icefjord", coords: [69.2198, -51.0986] }
  ];

  locations.forEach(loc => {
    L.circleMarker(loc.coords, {
      radius: 8,
      color: "#66FFCC",
      fillOpacity: 0.7
    }).addTo(map)
      .bindPopup(loc.name);
  });
</script>
</body>
</html>


---

11. Offline Strategy

Cache map tiles

Cache images

Allow saved destinations offline

Low-bandwidth mode toggle



---

12. Performance Targets

First load < 2.5s

Smooth 60fps transitions

Lazy-load high-res imagery

GPU accelerated animations



---

13. Security

HTTPS mandatory

No tracking by default

GDPR compliant

No third-party analytics unless opt-in



---

14. Metrics of Success

Avg session > 6 minutes

Save rate > 35%

Route generation usage > 40%

Lighthouse score > 95



---

15. Roadmap

Phase 1: Core map + 12 curated destinations
Phase 2: Climate layer + Aurora forecast
Phase 3: Expedition planner
Phase 4: Native wrapper (Capacitor)


---

16. Emotional Benchmark

When a user closes the app, they should feel:

Calm

In awe

Curious

Slightly transformed


The application should feel like holding a cold, smooth stone carved from Arctic ice — minimal, deliberate, timeless.


---

If you'd like, I can now:

• Build the full production-ready Leaflet codebase
• Create the visual system design spec
• Or design a second version that feels even more radical and daring