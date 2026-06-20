import pandas as pd
import numpy as np
import math
import json
import sqlite3
import pickle
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

# TASK 1: Data Exploration
print("=== TASK 1: Data Exploration ===")
df = pd.read_csv("../jan to may police violation_anonymized791b166.csv")
print(f"Shape: {df.shape}")
print("\nFirst 5 rows:")
print(df.head())
print("\nColumns:")
print(df.columns.tolist())
print("\nData Types:")
print(df.dtypes)
print("\nMissing Values:")
print(df.isnull().sum())

# TASK 2: Data Cleaning
print("\n=== TASK 2: Data Cleaning ===")
# Depending on exact column names, we need to map them if they are different.
# Let's assume standard names, but we should verify. The prompt uses:
# junction_name, latitude, longitude, created_datetime, violation_type.
# Let's clean
clean_df = df.dropna(subset=['junction_name', 'latitude', 'longitude', 'created_datetime'])
print(f"Rows after cleaning: {len(clean_df)}")
clean_df.to_csv("clean_violations.csv", index=False)

# TASK 3: Feature Engineering
print("\n=== TASK 3: Feature Engineering ===")
clean_df['created_datetime'] = pd.to_datetime(clean_df['created_datetime'])
clean_df['hour'] = clean_df['created_datetime'].dt.hour
clean_df['day_of_week'] = clean_df['created_datetime'].dt.dayofweek
clean_df['is_rush_hour'] = clean_df['hour'].isin([17, 18, 19]).astype(int)

# Load true congestion data
cong_df = pd.read_csv("../Banglore_traffic_Dataset.csv")
cong_df['Date'] = pd.to_datetime(cong_df['Date']).dt.date
clean_df['Date'] = clean_df['created_datetime'].dt.date

unique_junctions = clean_df['junction_name'].unique()
unique_roads = cong_df['Road/Intersection Name'].unique()
j2r = {}
for j in unique_junctions:
    j_str = str(j).lower()
    for r in unique_roads:
        r_str = str(r).lower()
        if r_str in j_str or j_str in r_str:
            j2r[j] = r
            break

clean_df['Road/Intersection Name'] = clean_df['junction_name'].map(j2r)

road_cong = cong_df.groupby(['Date', 'Road/Intersection Name'])['Congestion Level'].mean().reset_index()
clean_df = pd.merge(clean_df, road_cong, on=['Date', 'Road/Intersection Name'], how='left')

daily_cong = cong_df.groupby('Date')['Congestion Level'].mean().reset_index().rename(columns={'Congestion Level': 'Daily_Avg_Congestion'})
clean_df = pd.merge(clean_df, daily_cong, on='Date', how='left')

clean_df['Congestion Level'] = clean_df['Congestion Level'].fillna(clean_df['Daily_Avg_Congestion']).fillna(0)
clean_df['high_impact'] = (clean_df['Congestion Level'] > 75).astype(int)

print(f"High Impact %: {clean_df['high_impact'].mean() * 100:.2f}%")

# TASK 4: Train Impact Scorer Model
print("\n=== TASK 4: Train Impact Scorer ===")
le_type = LabelEncoder()
le_junction = LabelEncoder()

# Handle case if violation_type has nulls (it wasn't strictly dropped in step 2 but let's be safe)
clean_df = clean_df.dropna(subset=['violation_type'])

clean_df['violation_type_encoded'] = le_type.fit_transform(clean_df['violation_type'])
clean_df['junction_name_encoded'] = le_junction.fit_transform(clean_df['junction_name'])

features = ['violation_type_encoded', 'junction_name_encoded', 'hour', 'day_of_week', 'is_rush_hour']

clean_df = clean_df.sort_values('created_datetime')
train_size = int(len(clean_df) * 0.9)
train_df = clean_df.iloc[:train_size]

X = train_df[features]
y = train_df['high_impact']

model = XGBClassifier(n_estimators=50, max_depth=5, random_state=42)
model.fit(X, y)

test_df = clean_df.iloc[train_size:]
X_test = test_df[features]
y_test = test_df['high_impact']

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy on Unseen Split (Last 10%): {acc * 100:.2f}%")

with open("models/impact_scorer.pkl", "wb") as f:
    pickle.dump(model, f)
with open("models/le_type.pkl", "wb") as f:
    pickle.dump(le_type, f)
with open("models/le_junction.pkl", "wb") as f:
    pickle.dump(le_junction, f)

# TASK 5: Build Network Graph
print("\n=== TASK 5: Build Network Graph ===")
nodes_df = clean_df.drop_duplicates(subset=['junction_name'])[['junction_name', 'latitude', 'longitude']]
nodes = []
for idx, row in enumerate(nodes_df.itertuples()):
    nodes.append({
        "id": idx,
        "name": row.junction_name,
        "latitude": row.latitude,
        "longitude": row.longitude
    })

edges = []
for i in range(len(nodes)):
    for j in range(i + 1, len(nodes)):
        dist = math.sqrt((nodes[i]['latitude'] - nodes[j]['latitude'])**2 + 
                         (nodes[i]['longitude'] - nodes[j]['longitude'])**2)
        if dist < 0.05:
            edges.append({
                "source": nodes[i]['id'],
                "target": nodes[j]['id'],
                "weight": 1
            })

graph = {"nodes": nodes, "edges": edges}
with open("models/network_graph.json", "w") as f:
    json.dump(graph, f)
print(f"Nodes: {len(nodes)}, Edges: {len(edges)}")

# TASK 6: Create Violation Type Weights
print("\n=== TASK 6: Create Violation Weights ===")
unique_types = clean_df['violation_type'].unique()
weights = {}
for vtype in unique_types:
    vt_upper = str(vtype).upper()
    if "WRONG_WAY" in vt_upper or "WRONG WAY" in vt_upper:
        weights[vtype] = 0.9
    elif "WRONG_PARKING" in vt_upper or "WRONG PARKING" in vt_upper:
        weights[vtype] = 0.8
    elif "NO_PARKING" in vt_upper or "NO PARKING" in vt_upper:
        weights[vtype] = 0.7
    elif "ILLEGAL_STOPPING" in vt_upper or "ILLEGAL STOPPING" in vt_upper:
        weights[vtype] = 0.6
    else:
        weights[vtype] = 0.5

with open("models/violation_weights.json", "w") as f:
    json.dump(weights, f)
print(f"Weights generated for {len(weights)} types")

# TASK 7: Set Up SQLite Database
print("\n=== TASK 7: Set Up Database ===")
conn = sqlite3.connect('traffic.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL,
    longitude REAL,
    violation_type TEXT,
    junction_name TEXT,
    created_datetime TEXT,
    impact_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    location TEXT,
    predicted_impact REAL,
    actual_impact REAL,
    officer_count INTEGER,
    learned BOOLEAN
)
''')
conn.commit()
conn.close()
print("Database created with 'violations' and 'events' tables.")
