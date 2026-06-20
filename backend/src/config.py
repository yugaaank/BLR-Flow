import pickle
import json
import sqlite3
import os
import sys
from logger import logger

class AppConfig:
    impact_scorer = None
    le_type = None
    le_junction = None
    network_graph = None
    violation_weights = None

config = AppConfig()

def load_models():
    try:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        models_dir = os.path.join(base_dir, 'models')
        
        with open(os.path.join(models_dir, 'impact_scorer.pkl'), 'rb') as f:
            config.impact_scorer = pickle.load(f)
        logger.info("Loaded impact_scorer.pkl")
        
        with open(os.path.join(models_dir, 'le_type.pkl'), 'rb') as f:
            config.le_type = pickle.load(f)
        logger.info("Loaded le_type.pkl")
            
        with open(os.path.join(models_dir, 'le_junction.pkl'), 'rb') as f:
            config.le_junction = pickle.load(f)
        logger.info("Loaded le_junction.pkl")
            
        with open(os.path.join(models_dir, 'network_graph.json'), 'r') as f:
            config.network_graph = json.load(f)
        logger.info("Loaded network_graph.json")
            
        with open(os.path.join(models_dir, 'violation_weights.json'), 'r') as f:
            config.violation_weights = json.load(f)
        logger.info("Loaded violation_weights.json")

    except Exception as e:
        logger.error(f"Error loading models: {e}")
        sys.exit(1)

def get_db_connection():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'traffic.db')
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn
