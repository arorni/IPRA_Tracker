import pandas as pd

from database import SessionLocal
from models.agency import Agency


CSV_PATH = "data/ipra_agencies_seed.csv"


def clean(value):
    if pd.isna(value):
        return None
    value = str(value).strip()
    return value if value else None


def seed_agencies():
    db = SessionLocal()

    try:
        df = pd.read_csv(CSV_PATH)

        inserted = 0
        skipped = 0

        for _, row in df.iterrows():
            name = clean(row.get("name"))

            if not name:
                skipped += 1
                continue

            existing = db.query(Agency).filter(Agency.name == name).first()

            if existing:
                skipped += 1
                continue

            agency = Agency(
                name=name,
                agency_type=clean(row.get("agency_type")),
                city=clean(row.get("city")),
                state=clean(row.get("state")) or "NM",
                website_url=clean(row.get("website_url")),
                nextrequest_url=clean(row.get("nextrequest_url")),
                ipra_email=clean(row.get("ipra_email")),
                phone=clean(row.get("phone")),
                fax=clean(row.get("fax")),
                notes=clean(row.get("notes")),
            )

            db.add(agency)
            inserted += 1

        db.commit()

        print(f"Agency seeding completed. Inserted: {inserted}, Skipped: {skipped}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_agencies()