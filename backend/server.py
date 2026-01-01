from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Create MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="supershop"
)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, password))
    user = cursor.fetchone()

    if user:
        return jsonify({"success": True, "user": user})
    else:
        return jsonify({"success": False, "message": "Invalid login"})

@app.route("/")
def home():
    return "Backend Running!"

if __name__ == "__main__":
    app.run(debug=True)
