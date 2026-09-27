import pandas as pd
from pathlib import Path

WEATHER_DIR = Path("data/raw/weather")

files = sorted(WEATHER_DIR.glob("*.csv"))

print("=" * 70)
print("WEATHER DATA INSPECTION")
print("=" * 70)

for file in files:

    print("\n" + "=" * 70)
    print(f"FILE: {file.name}")
    print("=" * 70)

    # NASA POWER has 13 header lines before the actual CSV table
    df = pd.read_csv(file, skiprows=13)

    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")

    print(
        f"Start: "
        f"{df.iloc[0]['YEAR']}-{int(df.iloc[0]['MO']):02d}-"
        f"{int(df.iloc[0]['DY']):02d} "
        f"{int(df.iloc[0]['HR']):02d}:00"
    )

    print(
        f"End: "
        f"{df.iloc[-1]['YEAR']}-{int(df.iloc[-1]['MO']):02d}-"
        f"{int(df.iloc[-1]['DY']):02d} "
        f"{int(df.iloc[-1]['HR']):02d}:00"
    )

    print("\nMissing values (-999):")

    for column in df.columns:
        count = (df[column] == -999).sum()

        if count > 0:
            print(f"  {column}: {count}")

    print("\nFirst 2 rows:")
    print(df.head(2).to_string(index=False))

    print("\nLast 2 rows:")
    print(df.tail(2).to_string(index=False))

print("\n" + "=" * 70)
print("INSPECTION COMPLETE")
print("=" * 70)