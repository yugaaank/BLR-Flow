import pandas as pd
import numpy as np
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import os

app = FastAPI(title="Gridlock AI Intelligence API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data.csv")

def run_analysis():
    print("Loading data and running ML model...")
    df = pd.read_csv(DATA_PATH)
    df['created_datetime'] = pd.to_datetime(df['created_datetime'], format='mixed')
    df['week'] = df['created_datetime'].dt.to_period('W').apply(lambda r: r.start_time)

    parking_keywords = ["PARKING", "STATIONARY", "OBSTRUCTING"]
    df['is_parking'] = df['violation_type'].apply(lambda v: any(k in str(v).upper() for k in parking_keywords) if pd.notna(v) else False)
    
    def count_v(v_str):
        try:
            v_list = json.loads(v_str)
            return len(v_list) if isinstance(v_list, list) else 1
        except: return 1

    df['violation_count'] = df['violation_type'].apply(count_v)
    df['is_multi_violation'] = df['violation_count'] > 1
    df['is_backlog'] = df['data_sent_to_scita'].apply(lambda x: str(x).upper() == 'FALSE')

    df_j = df[df['junction_name'] != 'No Junction'].copy()
    df_parking = df_j[df_j['is_parking']].copy()

    # Persistence
    total_weeks = df['week'].nunique()
    weekly_data = df_parking.groupby(['week', 'junction_name']).size().reset_index(name='count')
    
    top_20_list = []
    for week in df_parking['week'].unique():
        top_20 = weekly_data[weekly_data['week'] == week].nlargest(20, 'count')['junction_name'].tolist()
        top_20_list.extend(top_20)
    
    persistence = pd.Series(top_20_list).value_counts().reset_index()
    persistence.columns = ['junction', 'weeks_in_top20']
    persistence['persistence_score'] = (persistence['weeks_in_top20'] / total_weeks) * 100

    # Clustering
    features = df_parking.groupby('junction_name').agg(
        avg_vol=('id', 'count'),
        multi_rate=('is_multi_violation', 'mean'),
        backlog_rate=('is_backlog', 'mean')
    ).reset_index()
    features['avg_vol'] /= total_weeks

    X = features[['avg_vol', 'multi_rate', 'backlog_rate']].copy()
    X['avg_vol'] = np.log1p(X['avg_vol'])
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Use min(n_clusters, n_samples) to prevent errors on small filtered datasets
    n_c = min(4, len(features))
    kmeans = KMeans(n_clusters=n_c, random_state=42, n_init=10)
    features['cluster'] = kmeans.fit_predict(X_scaled)
    
    c_means = features.groupby('cluster').mean(numeric_only=True)
    role_map = {}
    
    if not c_means.empty:
        vol_c = c_means['avg_vol'].idxmax()
        role_map[vol_c] = "Primary Parking Enforcement Priority"
        
        rem = c_means.index.difference([vol_c])
        if len(rem) > 0:
            comp_c = c_means.loc[rem]['multi_rate'].idxmax()
            role_map[comp_c] = "High-Complexity Parking Zone"
            rem = rem.difference([comp_c])
            
            if len(rem) > 0:
                risk_c = c_means.loc[rem]['backlog_rate'].idxmax()
                role_map[risk_c] = "Data/Reporting Risk Zone"
    
    for c in range(n_c):
        if c not in role_map: role_map[c] = "Standard Monitoring"
    
    features['role'] = features['cluster'].map(role_map)

    # 10-50 Rule
    top_10 = persistence.nlargest(10, 'weeks_in_top20')['junction'].tolist()
    p_share = (df_parking[df_parking['junction_name'].isin(top_10)]['id'].count() / len(df_parking)) * 100

    # Backlog Outliers
    station_stats = df.groupby('police_station').agg(
        total=('id', 'count'),
        backlog=('is_backlog', 'sum')
    ).reset_index()
    station_stats['percent'] = (station_stats['backlog'] / station_stats['total']) * 100
    mu, sigma = station_stats['percent'].mean(), station_stats['percent'].std()
    threshold = mu + 2 * sigma
    alerts = station_stats[station_stats['percent'] > threshold].sort_values('percent', ascending=False)

    return {
        "junctions": pd.merge(persistence, features, left_on='junction', right_on='junction_name').sort_values(['weeks_in_top20', 'multi_rate'], ascending=False).to_dict(orient="records"),
        "rule_10_50": round(p_share, 2),
        "alerts": alerts.to_dict(orient="records"),
        "stats": {
            "mean_backlog": round(mu, 2),
            "std_backlog": round(sigma, 2),
            "threshold": round(threshold, 2),
            "total_records": len(df),
            "parking_records": len(df_parking),
            "total_weeks": int(total_weeks)
        }
    }

# Run analysis once on startup
print("Starting initial analysis...")
cache = run_analysis()
print("Analysis complete.")

@app.get("/data")
async def get_data():
    return cache

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
