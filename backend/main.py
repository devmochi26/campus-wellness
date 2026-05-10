from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, user, daily_routine, diet, exercise, mood, constitution, habits, dashboard, smart_sleep, nutrition, stress_relief, health_profile, community

Base.metadata.create_all(bind=engine)

app = FastAPI(title="养生校园 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(daily_routine.router)
app.include_router(diet.router)
app.include_router(exercise.router)
app.include_router(mood.router)
app.include_router(constitution.router)
app.include_router(habits.router)
app.include_router(dashboard.router)
app.include_router(smart_sleep.router)
app.include_router(nutrition.router)
app.include_router(stress_relief.router)
app.include_router(health_profile.router)
app.include_router(community.router)


@app.get("/")
def root():
    return {"message": "养生校园 API is running", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
