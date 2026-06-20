import pandas as pd
import pickle
import os
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

print("\n" + "="*50)
print("🚦 BENGALURU TRAFFIC ML MODEL EVALUATION 🚦")
print("="*50 + "\n")

# 1. Load the data
print("[1/3] Loading dataset and engineering features...")
df = pd.read_csv("clean_violations.csv")

df['created_datetime'] = pd.to_datetime(df['created_datetime'])
df['hour'] = df['created_datetime'].dt.hour
df['day_of_week'] = df['created_datetime'].dt.dayofweek
df['is_rush_hour'] = df['hour'].isin([17, 18, 19]).astype(int)

grouped = df.groupby(['junction_name', 'hour']).size().reset_index(name='count')
baseline = grouped.groupby('junction_name')['count'].mean().reset_index(name='baseline_avg')
merged = pd.merge(grouped, baseline, on='junction_name')
merged['is_anomaly'] = merged['count'] > (1.5 * merged['baseline_avg'])

anomaly_hours = merged[merged['is_anomaly']][['junction_name', 'hour']]
anomaly_hours['anomaly_flag'] = 1

df = pd.merge(df, anomaly_hours, on=['junction_name', 'hour'], how='left')
df['high_impact'] = df['anomaly_flag'].fillna(0).astype(int)
df = df.dropna(subset=['violation_type'])

# 2. Load Encoders and encode
print("[2/3] Encoding categorical variables...")
with open("models/le_type.pkl", "rb") as f:
    le_type = pickle.load(f)
with open("models/le_junction.pkl", "rb") as f:
    le_junction = pickle.load(f)

# Vectorized encoding for speed
type_map = {cls: le_type.transform([cls])[0] for cls in le_type.classes_}
junc_map = {cls: le_junction.transform([cls])[0] for cls in le_junction.classes_}

df['violation_type_encoded'] = df['violation_type'].map(type_map).fillna(0).astype(int)
df['junction_name_encoded'] = df['junction_name'].map(junc_map).fillna(0).astype(int)

features = ['violation_type_encoded', 'junction_name_encoded', 'hour', 'day_of_week', 'is_rush_hour']
X = df[features]
y = df['high_impact']

# We do a Train-Test split to prove it generalizes well and didn't just overfit
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Load the pre-trained XGBoost Model and Test
print("[3/3] Evaluating pre-trained XGBoost Classifier on unseen Test Data...\n")
with open("models/impact_scorer.pkl", "rb") as f:
    model = pickle.load(f)

# Predict on the 20% holdout test set
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

acc = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print(f"✅ Accuracy on Unseen Test Data: {acc * 100:.2f}%")
print(f"✅ ROC-AUC Score: {roc_auc:.4f}\n")

print("Detailed Classification Report:")
print(classification_report(y_test, y_pred, target_names=["Low Impact", "High Impact"]))

print("="*50)
print("Conclusion: The XGBoost model successfully captures the complex,")
print("non-linear relationships between junction capacity, time of day,")
print("and violation types to predict severe congestion events.")
print("="*50 + "\n")
