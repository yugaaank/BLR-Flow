<div align="center">

# BLR-Flow

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org)
[![ML](https://img.shields.io/badge/model-XGBoost-00B4D8?logo=scikitlearn&logoColor=white)](#how-it-works)
[![License](https://img.shields.io/badge/license-MIT-8b5cf6)](#license)

</div>

`BLR-Flow` models the cascading impact of traffic violations across
Bengaluru's road network and ranks them so enforcement can be dispatched where
it actually eases congestion. A Python backend trains an XGBoost impact scorer
and exposes a small REST API; a Bun/React frontend visualizes active violations
and recommendations.

## Why

A single violation rarely stays local — it ripples through junctions and
inflates commute times across a corridor. `BLR-Flow` estimates that ripple per
report and ranks violations by *network* impact rather than by individual
severity, so limited enforcement capacity goes to the highest-leverage clears.

## How it works

**Backend** (`backend/`):

- `process_data.py` — pandas/numpy ETL over the anonymized violation feed
  (`jan to may police violation_anonymized…csv`): exploration, cleaning,
  column mapping (`junction_name`, `latitude`, `longitude`,
  `created_datetime`, `violation_type`), and feature prep.
- `models/` — serialized `XGBClassifier` (`impact_scorer.pkl`) plus
  `LabelEncoder`s (`le_junction.pkl`, `le_type.pkl`), a `network_graph.json`
  of junction topology, and `violation_weights.json`.
- `check_overlap.py` / `generate_unseen.py` — overlap detection and synthetic
  unseen-junction handling.
- REST API (see `API_DOCS.md`):
  - `POST /violations/input` — report a violation; returns `impact_score`
    (1–100), affected junctions, estimated commute-time increase, and a
    priority rank.
  - `GET /recommendations` — all active violations sorted by `impact_score`
    (highest first).
  - `GET /cascade-sim` — given violation IDs to clear, predicts the resulting
    congestion, affected junctions, and commute time.

**Frontend** (`frontend/`) — Bun + React (Vite, shadcn-style `components.json`)
app that calls the API to show the live violation map and ranked
recommendations.

## Project structure

```
BLR-Flow/
├── backend/
│   ├── process_data.py     # ETL + exploration
│   ├── check_overlap.py    # overlap detection
│   ├── generate_unseen.py  # unseen-junction handling
│   ├── models/             # XGBoost scorer + label encoders + graph
│   ├── API_DOCS.md         # endpoint reference
│   ├── Dockerfile  pyproject.toml  .python-version
└── frontend/               # Bun + React client
```

## Getting started

Backend:

```bash
cd backend
pip install -r requirements.txt      # or: poetry/env from pyproject.toml
python process_data.py               # (re)build features / models
# run the API server (uvicorn / your runner of choice)
```

Frontend:

```bash
cd frontend
bun install
bun run dev
```

## License

MIT
