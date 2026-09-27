import pandas as pd
from pathlib import Path

# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

ELECTRICITY_FILE = Path(
    "data/processed/electricity_15min_clean.csv"
)

WEATHER_DIR = Path("data/raw/weather")

OUTPUT_DIR = Path("data/processed")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "india_demand_weather_15min.csv"


# ---------------------------------------------------------
# Load electricity data
# ---------------------------------------------------------

print("=" * 70)
print("ELECTRICITY + WEATHER MERGE")
print("=" * 70)

print("\nLoading electricity data...")

electricity = pd.read_csv(
    ELECTRICITY_FILE,
    parse_dates=["timestamp"]
)

print(f"Electricity rows: {len(electricity):,}")


# ---------------------------------------------------------
# Weather cities
# ---------------------------------------------------------

cities = [
    "delhi",
    "mumbai",
    "bengaluru",
    "kolkata",
    "guwahati"
]


weather_data = []


# ---------------------------------------------------------
# Load and prepare weather
# ---------------------------------------------------------

for city in cities:

    file = WEATHER_DIR / f"{city}_weather.csv"

    print(f"\nLoading weather: {city.title()}")

    # NASA POWER data starts after 13 header lines
    weather = pd.read_csv(
        file,
        skiprows=13
    )

    # Create timestamp
    weather["timestamp"] = pd.to_datetime(
        weather["YEAR"].astype(int).astype(str)
        + "-"
        + weather["MO"].astype(int).astype(str).str.zfill(2)
        + "-"
        + weather["DY"].astype(int).astype(str).str.zfill(2)
        + " "
        + weather["HR"].astype(int).astype(str).str.zfill(2)
        + ":00"
    )

    # Keep only required variables
    weather = weather[
        [
            "timestamp",
            "T2M",
            "RH2M",
            "ALLSKY_SFC_SW_DWN",
            "WS10M",
            "PRECTOTCORR"
        ]
    ].copy()

    # Rename columns with city prefix
    weather = weather.rename(
        columns={
            "T2M": f"{city}_T2M",
            "RH2M": f"{city}_RH2M",
            "ALLSKY_SFC_SW_DWN":
                f"{city}_SOLAR",
            "WS10M": f"{city}_WS10M",
            "PRECTOTCORR":
                f"{city}_PRECIP"
        }
    )

    weather_data.append(weather)

    print(f"  Rows: {len(weather):,}")


# ---------------------------------------------------------
# Combine all weather locations
# ---------------------------------------------------------

print("\nCombining weather locations...")

weather_all = weather_data[0]

for weather in weather_data[1:]:

    weather_all = weather_all.merge(
        weather,
        on="timestamp",
        how="outer"
    )


weather_all = weather_all.sort_values(
    "timestamp"
)


print(
    f"Combined weather rows: "
    f"{len(weather_all):,}"
)


# ---------------------------------------------------------
# Merge hourly weather with 15-minute electricity
# ---------------------------------------------------------

print("\nAligning hourly weather with 15-minute electricity...")

electricity = electricity.sort_values(
    "timestamp"
)

weather_all = weather_all.sort_values(
    "timestamp"
)


merged = pd.merge_asof(
    electricity,
    weather_all,
    on="timestamp",
    direction="backward"
)


# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("FINAL VALIDATION")
print("=" * 70)

print(f"Rows: {len(merged):,}")

print(f"Columns: {len(merged.columns)}")

print(
    f"Start: {merged['timestamp'].min()}"
)

print(
    f"End: {merged['timestamp'].max()}"
)

print(
    f"Duplicate timestamps: "
    f"{merged['timestamp'].duplicated().sum()}"
)

print("\nMissing values:")

missing = merged.isna().sum()

print(
    missing[missing > 0]
)


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

merged.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("MERGE COMPLETE")
print("=" * 70)

print(f"\nSaved to:")
print(OUTPUT_FILE)

print("\nColumns:")
for column in merged.columns:
    print(f"  {column}")