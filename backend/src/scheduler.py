from apscheduler.schedulers.background import BackgroundScheduler
from logger import logger
from config import get_db_connection, config
import pandas as pd
from datetime import datetime

def score_unscored_violations():
    logger.info("Running background job to score unscored violations")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, latitude, longitude, violation_type, junction_name, created_datetime FROM violations WHERE impact_score IS NULL")
        rows = cursor.fetchall()
        
        if not rows:
            logger.info("No unscored violations found.")
            conn.close()
            return
            
        for row in rows:
            try:
                junction = row['junction_name']
                dt = datetime.fromisoformat(row['created_datetime']) if row['created_datetime'] else datetime.now()
                hour = dt.hour
                day_of_week = dt.weekday()
                is_rush_hour = 1 if hour in [17, 18, 19] else 0
                
                try:
                    v_type_enc = config.le_type.transform([row['violation_type']])[0]
                except ValueError:
                    v_type_enc = 0
                    
                try:
                    junc_enc = config.le_junction.transform([junction])[0]
                except ValueError:
                    junc_enc = 0
                
                df = pd.DataFrame([{
                    'violation_type_encoded': v_type_enc,
                    'junction_name_encoded': junc_enc,
                    'hour': hour,
                    'day_of_week': day_of_week,
                    'is_rush_hour': is_rush_hour
                }])
                
                score = float(config.impact_scorer.predict_proba(df)[0][1] * 100)
                
                cursor.execute("UPDATE violations SET impact_score = ? WHERE id = ?", (round(score, 2), row['id']))
            except Exception as e:
                logger.error(f"Error scoring row {row['id']}: {e}")
                
        conn.commit()
        conn.close()
        logger.info(f"Successfully scored {len(rows)} violations.")
    except Exception as e:
        logger.error(f"Background job error: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(score_unscored_violations, 'interval', minutes=5)
    scheduler.start()
    logger.info("Started background scheduler")
