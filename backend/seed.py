"""Seed script — run once to populate constitution test questions (already in router) and optional sample data."""
from database import SessionLocal, engine, Base
from models import User, UserProfile
from auth import hash_password

Base.metadata.create_all(bind=engine)


def seed_demo_user():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "demo").first()
        if existing:
            print("Demo user already exists, skipping.")
            return

        user = User(username="demo", password_hash=hash_password("demo123"))
        db.add(user)
        db.flush()

        profile = UserProfile(user_id=user.id, nickname="养生的同学", age=20, height=175.0, weight=68.0)
        db.add(profile)
        db.commit()
        print("Demo user created: demo / demo123")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_user()
