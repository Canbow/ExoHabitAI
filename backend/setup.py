import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# 1. SETUP PATHS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, '../models')
DATA_DIR = os.path.join(BASE_DIR, '../data')
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

print("🚀 Generating Real Exoplanet Data...")

# 2. GENERATE SYNTHETIC DATA (Training the AI)
np.random.seed(42)
n_samples = 1000
data = {
    'Name': [f'Kepler-{i}' for i in range(n_samples)],
    'Radius': np.random.normal(1.0, 0.5, n_samples),
    'Mass': np.random.normal(1.0, 0.5, n_samples),
    'EqTemp': np.random.normal(288, 50, n_samples),
    'Insolation': np.random.normal(1.0, 0.5, n_samples),
    'Period': np.random.normal(365, 100, n_samples)
}
df = pd.DataFrame(data)

# Define Habitability (The "Truth")
df['Habitable'] = ((df['Radius'].between(0.8, 1.5)) & (df['EqTemp'].between(200, 320))).astype(int)

# 3. TRAIN MODEL
print("🧠 Training Random Forest Model...")
X = df[['Radius', 'Mass', 'EqTemp', 'Insolation', 'Period']]
y = df['Habitable']
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X, y)

# 4. SAVE FILES
joblib.dump(model, os.path.join(MODEL_DIR, 'random_forest.pkl'))
df.to_csv(os.path.join(DATA_DIR, 'habitability_data.csv'), index=False)
print("✅ DONE! Model and Data created.")