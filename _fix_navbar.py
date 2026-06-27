#!/usr/bin/env python3
"""
Run this from Terminal:
  cd /Users/amanpreetkaur/Desktop/confe_aman
  python3 _fix_navbar.py

This script fixes all remaining HTML files:
- Removes "Venue" from ATTEND dropdown
- Fixes "Explore NIT Jalandhar" to link to about-nitj.html
- Fixes PROGRAMME links from # to actual pages
Then delete this file.
"""
import os, glob

DIR = os.path.dirname(os.path.abspath(__file__))

REPLACEMENTS = [
    # Old broken ATTEND with href="#"
    (
        '          <li><a href="#">Accommodation</a></li>\n          <li><a href="#">Gallery</a></li>\n          <li><a href="#">Venue</a></li>\n          <li><a href="#">Explore NIT Jalandhar</a></li>',
        '          <li><a href="accommodation.html">Accommodation</a></li>\n          <li><a href="gallery.html">Gallery</a></li>\n          <li><a href="about-nitj.html">Explore NIT Jalandhar</a></li>'
    ),
    # Old ATTEND with venue.html / explore-nitj.html
    (
        '          <li><a href="accommodation.html">Accommodation</a></li>\n          <li><a href="gallery.html">Gallery</a></li>\n          <li><a href="venue.html">Venue</a></li>\n          <li><a href="explore-nitj.html">Explore NIT Jalandhar</a></li>',
        '          <li><a href="accommodation.html">Accommodation</a></li>\n          <li><a href="gallery.html">Gallery</a></li>\n          <li><a href="about-nitj.html">Explore NIT Jalandhar</a></li>'
    ),
    # Fix PROGRAMME links
    (
        '          <li><a href="#">Technical Sessions</a></li>\n          <li><a href="#">Keynote Sessions</a></li>\n          <li><a href="#">Industry Sessions</a></li>',
        '          <li><a href="technical-sessions.html">Technical Sessions</a></li>\n          <li><a href="keynote-sessions.html">Keynote Sessions</a></li>\n          <li><a href="industry-sessions.html">Industry Sessions</a></li>'
    ),
]

files = glob.glob(os.path.join(DIR, "*.html"))
for f in sorted(files):
    name = os.path.basename(f)
    if name.startswith("_"):
        continue
    content = open(f, encoding="utf-8").read()
    original = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    if content != original:
        open(f, "w", encoding="utf-8").write(content)
        print(f"✅ Fixed: {name}")
    else:
        print(f"   No change: {name}")

print("\nDone! You can delete _fix_navbar.py now.")
