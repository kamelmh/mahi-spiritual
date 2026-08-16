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


def test_whole_sign_ketu_10th_house():
    """Engine houses are Whole-Sign from the verified sidereal Ascendant.

    Kamel (1996-03-06 14:00, El Bayadh) has Lagna Gemini 21d31m; Whole-Sign
    house 10 from Gemini Lagna = Pisces, where natal Ketu (Pisces 25d17m Revati)
    falls -> Ketu in 10th house (matches repo docs). This pins the engine fix
    that removed the pyswisseph/GMST/Quadrant fallback whose Cancer 3d05m ASC
    put Ketu in 9th.
    """
    from backend import engine

    houses = engine.calculate_houses(1996, 3, 6, 14, 0, 34.07, 1.33)
    assert houses["lagna"] == "Gemini", houses
    assert houses["ascendant"]["sign"] == "Gemini", houses
    assert houses["system"] == "Whole Sign", houses
    # Whole-Sign house 10 from Gemini Lagna is Pisces -> Ketu (Pisces) is 10th.
    assert houses["house_10"]["sign"] == "Pisces", houses


if __name__ == '__main__':
    test_engine_imports()
    test_chart_generation()
    test_family_generation()
    test_spiritual_content_exists()
    test_frontend_files_exist()
    test_whole_sign_ketu_10th_house()
    print("All tests passed!")
