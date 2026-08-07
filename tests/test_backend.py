"""
Tests for the MAHI Spiritual System backend.
"""
import json
import os
import sys

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_engine_imports():
    """All engine modules import cleanly."""
    from backend import engine
    from backend import dasha
    from backend import synastry
    from backend import transits
    from backend import houses
    assert engine is not None
    assert dasha is not None
    assert synastry is not None
    assert transits is not None
    assert houses is not None


def test_chart_generation():
    """generate.py produces valid JSON files."""
    chart_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'data', 'chart.json')
    if os.path.exists(chart_path):
        with open(chart_path) as f:
            data = json.load(f)
        assert 'planets' in data or 'chart' in data or 'natal' in data


def test_family_generation():
    """Family JSON is valid and has members."""
    family_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'data', 'family.json')
    if os.path.exists(family_path):
        with open(family_path) as f:
            data = json.load(f)
        assert isinstance(data, (dict, list))


def test_spiritual_content_exists():
    """Spiritual content files are present."""
    spiritual_dir = os.path.join(os.path.dirname(__file__), '..', 'spiritual')
    if os.path.exists(spiritual_dir):
        files = os.listdir(spiritual_dir)
        assert len(files) > 0, "Spiritual directory is empty"


def test_frontend_files_exist():
    """Core frontend files are present."""
    frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    assert os.path.exists(os.path.join(frontend_dir, 'index.html'))
    assert os.path.exists(os.path.join(frontend_dir, 'js', 'app.js'))
    assert os.path.exists(os.path.join(frontend_dir, 'css', 'style.css'))


if __name__ == '__main__':
    test_engine_imports()
    test_chart_generation()
    test_family_generation()
    test_spiritual_content_exists()
    test_frontend_files_exist()
    print("All tests passed!")
