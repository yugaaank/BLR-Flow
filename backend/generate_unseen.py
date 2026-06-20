import pandas as pd
import json

df = pd.read_csv("clean_violations.csv")
df['created_datetime'] = pd.to_datetime(df['created_datetime'])
df['hour'] = df['created_datetime'].dt.hour
df = df.sort_values("created_datetime")

train_size = int(len(df) * 0.9)
unseen_df = df.iloc[train_size:].dropna(subset=['violation_type', 'latitude', 'longitude', 'hour'])
unseen_df = unseen_df.sample(frac=0.5, random_state=42).sort_index()

events = []
for _, row in unseen_df.iterrows():
    events.append({
        "junction_name": row["junction_name"],
        "latitude": float(row["latitude"]),
        "longitude": float(row["longitude"]),
        "time": int(row["hour"]),
        "violation_type": row["violation_type"]
    })

with open("src/unseen_data.json", "w") as f:
    json.dump(events, f)

print(f"Generated {len(events)} unseen events")
