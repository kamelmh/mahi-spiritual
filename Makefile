.PHONY: build dev test clean deploy

build:
	python build.py

dev:
	cd frontend && python -m http.server 8000

test:
	python tests/test_backend.py

clean:
	rm -rf frontend/data/chart.json frontend/data/family.json frontend/data/dasha.json frontend/data/transits.json

deploy: build
	git push origin main
