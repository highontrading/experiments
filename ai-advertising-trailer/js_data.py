"""Wrap the JSON data as JS for stage.html (file:// pages cannot fetch JSON)."""
import json
open("build/timeline.js", "w").write("window.TL=" + open("build/timeline.json").read() + ";")
open("build/assets.js", "w").write("window.ASSETS=" + open("build/assets.json").read() + ";")
