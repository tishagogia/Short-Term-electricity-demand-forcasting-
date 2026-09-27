import pandas as pd
from pathlib import Path

# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

RAW_DIR = Path("data/raw/electricity")
PROCESSED_DIR = Path("data/processed")

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = PROCESSED_DIR / "electricity_15min_clean.csv"


# ---------------------------------------------------------
# Step 1: Read all electricity Excel files
# ---------------------------------------------------------

all_data = []

files = sorted(RAW_DIR.glob("*.xlsx"))

print("=" * 70)
print("ELECTRICITY PREPROCESSING")
print("=" * 70)

print(f"\nFound {len(files)} Excel files.")

for file in files:

    print(f"\nProcessing: {file.name}")

    # Read Sheet1 exactly as structured in the source files
    df = pd.read_excel(
        file,
        sheet_name="Sheet1",
        header=None
    )

    # Row 1 contains actual variable names
    variable_row = df.iloc[1]

    # Find NLDC_DEMAND column
    demand_col = None

    for i, value in enumerate(variable_row):

        if isinstance(value, str) and "NLDC_DEMAND" in value:
            demand_col = i
            break

    if demand_col is None:
        raise ValueError(
            f"NLDC_DEMAND not found in {file.name}"
        )

    # Actual data starts from row 2
    data = df.iloc[2:].copy()

    # Keep only Time and NLDC_DEMAND
    data = data.iloc[:, [0, demand_col]]

    data.columns = [
        "Time",
        "NLDC_DEMAND"
    ]

    # Convert data types
    data["Time"] = pd.to_datetime(
        data["Time"],
        errors="coerce"
    )

    data["NLDC_DEMAND"] = pd.to_numeric(
        data["NLDC_DEMAND"],
        errors="coerce"
    )

    # Remove invalid rows
    data = data.dropna(
        subset=["Time", "NLDC_DEMAND"]
    )

    # Sort
    data = data.sort_values("Time")

    # Remove duplicate timestamps
    data = data.drop_duplicates(
        subset=["Time"],
        keep="first"
    )

    all_data.append(data)

    print(
        f"  {len(data):,} valid records | "
        f"{data['Time'].min()} → {data['Time'].max()}"
    )


# ---------------------------------------------------------
# Step 2: Combine all months
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("COMBINING DATA")
print("=" * 70)

electricity = pd.concat(
    all_data,
    ignore_index=True
)

electricity = electricity.sort_values("Time")

electricity = electricity.drop_duplicates(
    subset=["Time"],
    keep="first"
)

print(f"Combined 5-minute records: {len(electricity):,}")

print(
    f"Overall range: "
    f"{electricity['Time'].min()} → "
    f"{electricity['Time'].max()}"
)


# ---------------------------------------------------------
# Step 3: Convert 5-minute data to 15-minute data
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("RESAMPLING: 5-MINUTE → 15-MINUTE")
print("=" * 70)

electricity = electricity.set_index("Time")

# Average three 5-minute demand observations
electricity_15min = (
    electricity["NLDC_DEMAND"]
    .resample("15min")
    .mean()
    .dropna()
    .to_frame()
)

print(
    f"15-minute records: "
    f"{len(electricity_15min):,}"
)


# ---------------------------------------------------------
# Step 4: Check missing 15-minute values
# ---------------------------------------------------------

missing = electricity_15min["NLDC_DEMAND"].isna().sum()

print(
    f"Missing 15-minute demand values: {missing}"
)


# ---------------------------------------------------------
# Step 5: Calendar / time features
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("CREATING TIME FEATURES")
print("=" * 70)

df = electricity_15min.copy()

df["hour"] = df.index.hour

df["minute"] = df.index.minute

df["day_of_week"] = df.index.dayofweek

df["day_of_month"] = df.index.day

df["month"] = df.index.month

df["is_weekend"] = (
    df.index.dayofweek >= 5
).astype(int)


# ---------------------------------------------------------
# Step 6: Reset index
# ---------------------------------------------------------

df = df.reset_index()

# Rename timestamp column
df = df.rename(
    columns={"Time": "timestamp"}
)


# ---------------------------------------------------------
# Step 7: Final sorting
# ---------------------------------------------------------

df = df.sort_values("timestamp")

df = df.reset_index(drop=True)


# ---------------------------------------------------------
# Step 8: Final validation
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("FINAL VALIDATION")
print("=" * 70)

print(f"Rows: {len(df):,}")

print(f"Columns: {list(df.columns)}")

print(
    f"Start: {df['timestamp'].min()}"
)

print(
    f"End: {df['timestamp'].max()}"
)

print(
    f"Missing values:\n"
    f"{df.isna().sum()}"
)

print(
    f"Duplicate timestamps: "
    f"{df['timestamp'].duplicated().sum()}"
)


# ---------------------------------------------------------
# Step 9: Save
# ---------------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("PREPROCESSING COMPLETE")
print("=" * 70)

print(f"\nSaved to:")
print(OUTPUT_FILE)

print("\nFirst 5 rows:")
print(df.head())

print("\nLast 5 rows:")
print(df.tail())