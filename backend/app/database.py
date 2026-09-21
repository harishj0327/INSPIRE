from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import get_settings

settings = get_settings()
engine_kwargs = {"pool_pre_ping": True}
if settings.database_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
engine = create_engine(settings.database_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Ensure the schema exists immediately in lightweight local development setups.
try:
    from app.models import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
except Exception:
    pass


def migrate_local_schema() -> None:
    """Apply additive migrations needed by the SQLite development database."""
    if not settings.database_url.startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "saved_recommendations" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("saved_recommendations")}
    additions = {
        "requirement_id": "INTEGER",
        "project_id": "INTEGER",
        "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
    }
    with engine.begin() as connection:
        for column_name, column_type in additions.items():
            if column_name not in columns:
                connection.execute(text(f"ALTER TABLE saved_recommendations ADD COLUMN {column_name} {column_type}"))
        connection.execute(text(
            "UPDATE saved_recommendations "
            "SET requirement_id = (SELECT requirement_id FROM recommendations "
            "WHERE recommendations.id = saved_recommendations.recommendation_id) "
            "WHERE requirement_id IS NULL"
        ))


migrate_local_schema()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
