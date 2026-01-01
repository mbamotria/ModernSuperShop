# create_user.py

import mysql.connector
from werkzeug.security import generate_password_hash

# ---------- CONFIG ----------
DB_HOST = "localhost"
DB_USER = "root"
DB_PASS = ""          # your MySQL password
DB_NAME = "supershop"  # your database name
# ---------------------------

def create_user(name, email, password, phone=None, address=None, role="user"):
    try:
        # Connect to DB
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        cursor = conn.cursor()

        # Hash password
        password_hash = generate_password_hash(password)

        # Insert query
        query = """
            INSERT INTO users (name, email, phone, address, password_hash, role)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        cursor.execute(query, (name, email, phone, address, password_hash, role))
        conn.commit()

        print("✅ User created successfully!")
        print("Email:", email)
        print("Original Password:", password)
        print("Role:", role)

    except Exception as e:
        print("❌ Error:", e)

    finally:
        cursor.close()
        conn.close()


# ---------- CREATE TEST USER ----------
if __name__ == "__main__":
    create_user(
        name="Admin",
        email="admin@supershop.com",
        password="admin123",
        phone="01700000001",
        address="Dhaka",
        role="admin"
    )
