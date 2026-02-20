"""
Migration script to migrate users from JSON to SQLite database.
Run this once to transfer existing data: python -m backend.migrate_to_db
"""

import json
from pathlib import Path
from backend.database import SessionLocal, init_db, User

def migrate_json_to_db():
    """Migrate users from users.json to SQLite database"""
    
    # Initialize database
    init_db()
    
    # Path to JSON file
    USERS_FILE = Path(__file__).parent.parent / "data" / "users.json"
    
    if not USERS_FILE.exists():
        print("✓ No users.json file found. Database initialized and ready to use.")
        return
    
    # Read existing users from JSON
    with open(USERS_FILE, "r") as f:
        users_data = json.load(f)
    
    # Get database session
    db = SessionLocal()
    
    try:
        migrated_count = 0
        skipped_count = 0
        
        for email, user_info in users_data.items():
            # Check if user already exists in database
            existing_user = db.query(User).filter(User.email == email).first()
            
            if existing_user:
                print(f"⊘ Skipped: {email} (already exists in database)")
                skipped_count += 1
                continue
            
            # Create new user from JSON data
            new_user = User(
                email=email,
                name=user_info.get("name", email.split("@")[0]),
                password=user_info.get("password", ""),
                oauth=user_info.get("oauth", False),
            )
            
            db.add(new_user)
            migrated_count += 1
            print(f"✓ Migrated: {email}")
        
        # Commit all changes
        db.commit()
        
        print(f"\n✓ Migration complete!")
        print(f"  • Migrated: {migrated_count} users")
        print(f"  • Skipped: {skipped_count} users")
        print(f"  • Database: data/interview_ai.db")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Migration failed: {str(e)}")
    
    finally:
        db.close()

if __name__ == "__main__":
    migrate_json_to_db()
