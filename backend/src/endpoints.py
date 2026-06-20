from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timezone
import pandas as pd
import math
import json
import os
from config import config, get_db_connection
from logger import logger

router = APIRouter()

class ViolationInput(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    violation_type: str
    time: int = Field(..., ge=0, le=23)

def find_closest_junction(lat, lon):
    closest = None
    min_dist = float('inf')
    for node in config.network_graph['nodes']:
        dist = math.sqrt((lat - node['latitude'])**2 + (lon - node['longitude'])**2)
        if dist < min_dist:
            min_dist = dist
            closest = node['name']
    return closest

@router.post("/violations/input")
def input_violation(data: ViolationInput):
    try:
        junction = find_closest_junction(data.latitude, data.longitude)
        if not junction:
            raise ValueError("No junction found")
            
        day_of_week = datetime.utcnow().weekday()
        is_rush_hour = 1 if data.time in [17, 18, 19] else 0
        
        try:
            v_type_enc = config.le_type.transform([data.violation_type])[0]
        except ValueError:
            v_type_enc = 0
            
        try:
            junc_enc = config.le_junction.transform([junction])[0]
        except ValueError:
            junc_enc = 0

        df = pd.DataFrame([{
            'violation_type_encoded': v_type_enc,
            'junction_name_encoded': junc_enc,
            'hour': data.time,
            'day_of_week': day_of_week,
            'is_rush_hour': is_rush_hour
        }])
        
        # Multiply by 100 to get score 0-100 as requested
        score_val = float(config.impact_scorer.predict_proba(df)[0][1] * 100)
        score = round(score_val, 2)
        
        # Save to db
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO violations (latitude, longitude, violation_type, junction_name, created_datetime, impact_score)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data.latitude, data.longitude, data.violation_type, junction, datetime.utcnow().isoformat(), score))
        conn.commit()
        conn.close()
        
        # Calculate commute impact simply based on the score
        commute_impact_minutes = round(score * 0.1, 2)
        
        # Simulate a branching chain reaction using BFS
        cascade_path = [junction]
        queue = [(junction, 0)] # (node, depth)
        max_depth = int(score / 25) + 1 # e.g. 90/25 = 3 (4 levels deep)
        
        import random
        edges = config.network_graph.get('edges', [])
        node_map = {n['id']: n['name'] for n in config.network_graph.get('nodes', [])}
        name_to_id = {n['name']: n['id'] for n in config.network_graph.get('nodes', [])}
        
        while queue and len(cascade_path) < 25: # Cap to prevent massive payloads
            current, depth = queue.pop(0)
            if depth >= max_depth:
                continue
                
            current_id = name_to_id.get(current)
            neighbors = []
            for e in edges:
                if e['source'] == current_id:
                    neighbors.append(node_map.get(e['target']))
                elif e['target'] == current_id:
                    neighbors.append(node_map.get(e['source']))
                    
            valid_neighbors = [n for n in neighbors if n and n not in cascade_path]
            
            # Each node infects 1 or 2 downstream nodes, creating a branching chain reaction
            if valid_neighbors:
                num_to_infect = min(len(valid_neighbors), random.choice([1, 2]))
                infected = random.sample(valid_neighbors, num_to_infect)
                for inf in infected:
                    cascade_path.append(inf)
                    queue.append((inf, depth + 1))

        return {
            "impact_score": score,
            "cascade_junctions": cascade_path,
            "commute_impact_minutes": commute_impact_minutes,
            "priority_rank": 1 if score > 80 else 2 if score > 50 else 3
        }
    except Exception as e:
        logger.error(f"Error in /violations/input: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/recommendations")
def get_recommendations():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM violations ORDER BY impact_score DESC")
        rows = cursor.fetchall()
        conn.close()
        
        result = []
        rank = 1
        for row in rows:
            dt_str = row['created_at']
            if dt_str:
                if not 'T' in dt_str:
                    # SQLite CURRENT_TIMESTAMP is 'YYYY-MM-DD HH:MM:SS'
                    dt_str = dt_str.replace(' ', 'T')
                dt = datetime.fromisoformat(dt_str)
            else:
                dt = datetime.utcnow()
                
            time_active = (datetime.utcnow() - dt).total_seconds() / 60
            if time_active < 30:
                result.append({
                    "id": row['id'],
                    "rank": rank,
                    "impact_score": row['impact_score'],
                    "violation_type": row['violation_type'],
                    "junction_name": row['junction_name'],
                    "time_active_minutes": round(time_active, 1)
                })
                rank += 1
        return result
    except Exception as e:
        logger.error(f"Error in /recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/cascade-sim")
def get_cascade_sim(violation_ids: str):
    try:
        v_ids = [int(x.strip()) for x in violation_ids.split(',')]
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM violations")
        all_violations = cursor.fetchall()
        conn.close()
        
        # Filter active
        active = []
        for row in all_violations:
            dt_str = row['created_at']
            if dt_str:
                if not 'T' in dt_str:
                    dt_str = dt_str.replace(' ', 'T')
                dt = datetime.fromisoformat(dt_str)
            else:
                dt = datetime.utcnow()
                
            if (datetime.utcnow() - dt).total_seconds() / 60 < 30:
                active.append(row)
                
        after_removal = [v for v in active if v['id'] not in v_ids]
        
        baseline_junctions = len(set([v['junction_name'] for v in active]))
        after_junctions = len(set([v['junction_name'] for v in after_removal]))
        
        baseline_commute = sum([v['impact_score'] * 0.1 for v in active if v['impact_score']])
        after_commute = sum([v['impact_score'] * 0.1 for v in after_removal if v['impact_score']])
        
        return {
            "baseline_junctions_affected": baseline_junctions,
            "after_removal_junctions_affected": after_junctions,
            "commute_time_baseline_minutes": round(baseline_commute, 2),
            "commute_time_after_minutes": round(after_commute, 2),
            "commute_time_saved_minutes": round(baseline_commute - after_commute, 2)
        }
    except Exception as e:
        logger.error(f"Error in /cascade-sim: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/network-graph")
def get_network_graph():
    return config.network_graph

@router.get("/unseen-events")
def get_unseen_events():
    try:
        base_dir = os.path.dirname(__file__)
        with open(os.path.join(base_dir, "unseen_data.json"), "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load unseen data: {e}")
        return []
