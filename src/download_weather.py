import requests
from pathlib import Path

# ---------------------------------------------------------
# Output folder
# ---------------------------------------------------------

OUTPUT_DIR = Path("data/raw/weather")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# NASA POWER API URLs
# ---------------------------------------------------------

weather_urls = {
    "delhi": "https://power.larc.nasa.gov/api/temporal/hourly/point?start=20220101&end=20221231&latitude=28.6139&longitude=77.209&community=RE&parameters=T2M,RH2M,PRECTOT,ALLSKY_SFC_SW_DWN,WS10M&time-standard=LST&format=CSV",

    "mumbai": "https://power.larc.nasa.gov/api/temporal/hourly/point?start=20220101&end=20221231&latitude=19.076&longitude=72.8777&community=RE&parameters=T2M,RH2M,PRECTOT,ALLSKY_SFC_SW_DWN,WS10M&time-standard=LST&format=CSV",

    "bengaluru": "https://power.larc.nasa.gov/api/temporal/hourly/point?start=20220101&end=20221231&latitude=12.9716&longitude=77.5946&community=RE&parameters=T2M,RH2M,PRECTOT,ALLSKY_SFC_SW_DWN,WS10M&time-standard=LST&format=CSV",

    "kolkata": "https://power.larc.nasa.gov/api/temporal/hourly/point?start=20220101&end=20221231&latitude=22.5726&longitude=88.3639&community=RE&parameters=T2M,RH2M,PRECTOT,ALLSKY_SFC_SW_DWN,WS10M&time-standard=LST&format=CSV",

    "guwahati": "https://power.larc.nasa.gov/api/temporal/hourly/point?start=20220101&end=20221231&latitude=26.1445&longitude=91.7362&community=RE&parameters=T2M,RH2M,PRECTOT,ALLSKY_SFC_SW_DWN,WS10M&time-standard=LST&format=CSV",
}


# ---------------------------------------------------------
# Download
# ---------------------------------------------------------

print("=" * 70)
print("NASA POWER WEATHER DOWNLOAD")
print("=" * 70)

for city, url in weather_urls.items():

    output_file = OUTPUT_DIR / f"{city}_weather.csv"

    print(f"\nDownloading: {city.title()}")

    try:
        response = requests.get(url, timeout=120)
        response.raise_for_status()

        output_file.write_bytes(response.content)

        print(f"Saved: {output_file}")
        print(f"Size: {len(response.content) / 1024:.1f} KB")

    except Exception as e:
        print(f"ERROR downloading {city}: {e}")


print("\n" + "=" * 70)
print("DOWNLOAD COMPLETE")
print("=" * 70)