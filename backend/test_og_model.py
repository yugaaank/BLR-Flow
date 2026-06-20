import pandas as pd
import pickle
import numpy as np
from sklearn.metrics import accuracy_score, classification_report

# 1. Load models
with open("models/impact_scorer.pkl", "rb") as f:
    model = pickle.load(f)
with open("models/le_type.pkl", "rb") as f:
    le_type = pickle.load(f)
with open("models/le_junction.pkl", "rb") as f:
    le_junction = pickle.load(f)

# 2. Load and prep features from original dataset
print("Loading datasets...")
df = pd.read_csv("../jan to may police violation_anonymized791b166.csv")
clean_df = df.dropna(subset=['junction_name', 'latitude', 'longitude', 'created_datetime', 'violation_type'])

clean_df['created_datetime'] = pd.to_datetime(clean_df['created_datetime'])
clean_df['hour'] = clean_df['created_datetime'].dt.hour
clean_df['day_of_week'] = clean_df['created_datetime'].dt.dayofweek
clean_df['is_rush_hour'] = clean_df['hour'].isin([17, 18, 19]).astype(int)

type_mapping = {cls: idx for idx, cls in enumerate(le_type.classes_)}
junc_mapping = {cls: idx for idx, cls in enumerate(le_junction.classes_)}

clean_df['violation_type_encoded'] = clean_df['violation_type'].map(type_mapping).fillna(0).astype(int)
clean_df['junction_name_encoded'] = clean_df['junction_name'].map(junc_mapping).fillna(0).astype(int)

features = ['violation_type_encoded', 'junction_name_encoded', 'hour', 'day_of_week', 'is_rush_hour']
X = clean_df[features]

# 3. Load true congestion dataset and merge
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

# True label
y_true = (clean_df['Congestion Level'] > 75).astype(int)

# 4. Predict using OG Model
print("Predicting with OG model...")
# Predict probabilities
probs = model.predict_proba(X)[:, 1] * 100
# Threshold for TUI simulator is 75
y_pred = (probs > 75).astype(int)

print("\n--- RESULTS ---")
print(f"Total True High Risk (Actual > 75): {y_true.sum()} out of {len(y_true)}")
print(f"Total Predicted High Risk (OG Model > 75): {y_pred.sum()} out of {len(y_pred)}")
print("Accuracy Score:", accuracy_score(y_true, y_pred))
print("\nClassification Report:")
print(classification_report(y_true, y_pred))
