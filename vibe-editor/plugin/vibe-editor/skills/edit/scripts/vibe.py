#!/usr/bin/env python3
"""Vibe Editor engine — entry point. Run `python3 vibe.py -h` for commands."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vibe_engine.cli import main  # noqa: E402

if __name__ == "__main__":
    main()
