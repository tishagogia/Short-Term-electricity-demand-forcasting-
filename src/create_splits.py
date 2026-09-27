import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/processed/india_demand_weather_15min.csv")
OUTPUT_DIR = Path("data/processed")

df = pd.read_csv(INPUT_FILE, parse_dates=["timestamp"])
df = df.sort_values("timestamp").reset_index(drop=True)

print("=" * 70)
print("CREATING CHRONOLOGICAL TRAIN / VALIDATION / TEST SPLIT")
print("=" * 70)

print(f"Total rows: {len(df):,}")

# ---------------------------------------------------------
# Split by time
#
# Train:      Jan - Jun
# Validation: Jul
# Test:       Aug - Sep
#
# This keeps the split chronological and avoids using
# future data to train the models.
# ---------------------------------------------------------

train = df[df["timestamp"] < "2022-07-01"].copy()

validation = df[
    (df["timestamp"] >= "2022-07-01") &
    (df["timestamp"] < "2022-08-01")
].copy()

test = df[
    df["timestamp"] >= "2022-08-01"
].copy()

# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

train.to_csv(
    OUTPUT_DIR / "train.csv",
    index=False
)

validation.to_csv(
    OUTPUT_DIR / "validation.csv",
    index=False
)

test.to_csv(
    OUTPUT_DIR / "test.csv",
    index=False
)

# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

print("\nTRAIN")
print(f"Rows: {len(train):,}")
print(f"Start: {train['timestamp'].min()}")
print(f"End:   {train['timestamp'].max()}")

print("\nVALIDATION")
print(f"Rows: {len(validation):,}")
print(f"Start: {validation['timestamp'].min()}")
print(f"End:   {validation['timestamp'].max()}")

print("\nTEST")
print(f"Rows: {len(test):,}")
print(f"Start: {test['timestamp'].min()}")
print(f"End:   {test['timestamp'].max()}")

print("\nMissing values:")
print("Train:", train.isna().sum().sum())
print("Validation:", validation.isna().sum().sum())
print("Test:", test.isna().sum().sum())

print("\n" + "=" * 70)
print("SPLIT COMPLETE")
print("=" * 70)