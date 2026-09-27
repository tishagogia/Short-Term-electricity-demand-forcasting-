import pandas as pd
from pathlib import Path

DATA_DIR = Path("data/raw/electricity")

files = sorted(DATA_DIR.glob("*.xlsx"))

print("=" * 70)
print("ELECTRICITY DATA INSPECTION")
print("=" * 70)

for file in files:
    print(f"\n{'=' * 70}")
    print(f"FILE: {file.name}")
    print(f"{'=' * 70}")

    df = pd.read_excel(
        file,
        sheet_name="Sheet1",
        header=None
    )

    print(f"Raw shape: {df.shape}")

    # Row 0 = technical column names
    # Row 1 = actual variable names
    variable_row = df.iloc[1]

    demand_col = None

    for i, value in enumerate(variable_row):
        if isinstance(value, str) and "NLDC_DEMAND" in value:
            demand_col = i
            break

    if demand_col is None:
        print("NLDC_DEMAND: NOT FOUND")
        continue

    print(f"NLDC_DEMAND column index: {demand_col}")
    print(f"Technical column: {df.iloc[0, demand_col]}")
    print(f"Variable name: {df.iloc[1, demand_col]}")

    # Actual data starts from row 2
    data = df.iloc[2:].copy()

    data = data.rename(columns={
        0: "Time",
        demand_col: "NLDC_DEMAND"
    })

    # Convert values
    data["Time"] = pd.to_datetime(
        data["Time"],
        errors="coerce"
    )

    data["NLDC_DEMAND"] = pd.to_numeric(
        data["NLDC_DEMAND"],
        errors="coerce"
    )

    # Remove invalid timestamps
    data = data.dropna(subset=["Time"])

    print(f"\nValid rows: {len(data)}")
    print(f"Start: {data['Time'].min()}")
    print(f"End:   {data['Time'].max()}")

    # Check timestamp intervals
    time_diff = (
        data["Time"]
        .sort_values()
        .diff()
        .dropna()
    )

    print("\nMost common timestamp intervals:")
    print(time_diff.value_counts().head(5))

    # Missing demand
    missing_demand = data["NLDC_DEMAND"].isna().sum()
    print(f"\nMissing NLDC_DEMAND values: {missing_demand}")

    # Duplicate timestamps
    duplicate_times = data["Time"].duplicated().sum()
    print(f"Duplicate timestamps: {duplicate_times}")

    # Check gaps that are not 5 minutes
    expected = pd.Timedelta(minutes=5)

    gaps = time_diff[time_diff != expected]

    print(f"Non-5-minute gaps: {len(gaps)}")

    if len(gaps) > 0:
        print("\nLargest timestamp gaps:")
        print(gaps.sort_values(ascending=False).head(10))

    print("\nFirst 3 records:")
    print(data[["Time", "NLDC_DEMAND"]].head(3).to_string(index=False))

    print("\nLast 3 records:")
    print(data[["Time", "NLDC_DEMAND"]].tail(3).to_string(index=False))

print("\n" + "=" * 70)
print("INSPECTION COMPLETE")
print("=" * 70)