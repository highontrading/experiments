#!/usr/bin/env python3
"""Pre-flight checks for the plugin before zipping.

Claude Desktop / claude.ai plugin upload rejects SKILL.md frontmatter keys other than
name, description, license, compatibility, metadata, allowed-tools, and refuses a
top-level bin/ directory. Skill folder names must match their `name`.
"""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(__file__), "..", "plugin", "vibe-editor")
ALLOWED = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}
errors = []
pj = json.load(open(os.path.join(ROOT, ".claude-plugin", "plugin.json")))
if not re.fullmatch(r"[a-z0-9-]{1,64}", pj["name"]):
    errors.append("plugin name must be lowercase-hyphen, <=64 chars")
if os.path.exists(os.path.join(ROOT, "bin")):
    errors.append("top-level bin/ blocks installation")
for sk in sorted(os.listdir(os.path.join(ROOT, "skills"))):
    p = os.path.join(ROOT, "skills", sk, "SKILL.md")
    txt = open(p, encoding="utf-8").read()
    m = re.match(r"---\n(.*?)\n---\n", txt, re.S)
    if not m:
        errors.append(f"{sk}: missing frontmatter"); continue
    keys = {}
    for line in m.group(1).splitlines():
        if re.match(r"^[A-Za-z_-]+:", line):
            k, v = line.split(":", 1); keys[k.strip()] = v.strip()
    bad = set(keys) - ALLOWED
    if bad: errors.append(f"{sk}: disallowed frontmatter keys {bad}")
    if keys.get("name") != sk: errors.append(f"{sk}: name '{keys.get('name')}' != folder")
    if len(keys.get("description", "")) > 1024: errors.append(f"{sk}: description > 1024 chars")
size = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(ROOT) for f in fs)
if size > 190 * 1024 * 1024: errors.append(f"plugin too large: {size/1e6:.0f} MB")
if errors:
    print("❌ " + "\n❌ ".join(errors)); sys.exit(1)
print(f"✅ plugin valid ({size/1e6:.1f} MB, {len(os.listdir(os.path.join(ROOT,'skills')))} skills)")
