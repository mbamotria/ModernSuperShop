from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
import mysql.connector
from datetime import datetime, timedelta
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MAIN DB CONNECTION
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",   # update if needed
        database="supershop"
    )

# ---------------------
# LOGIN ROUTE
# ---------------------
@app.post("/login")
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            user_id,
            name,
            email,
            phone,
            address,
            password_hash,
            created_at,
            role
        FROM users
        WHERE email = %s
    """, (email,))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 400

    stored_hash = user[5]
    
    # Add debug logging
    print(f"DEBUG: Email: {email}")
    print(f"DEBUG: Stored hash: {stored_hash}")
    print(f"DEBUG: Hash length: {len(stored_hash) if stored_hash else 0}")
    
    # Check if hash is empty or invalid
    if not stored_hash:
        return jsonify({"success": False, "message": "Invalid password configuration. Please contact admin."}), 400
    
    try:
        if not check_password_hash(stored_hash, password):
            return jsonify({"success": False, "message": "Incorrect password"}), 400
    except ValueError as e:
        # Handle invalid hash format
        print(f"ERROR: Invalid hash format for user {email}: {str(e)}")
        return jsonify({"success": False, "message": "Password verification error. Please contact admin."}), 400

    # Rest of your code...
    user_data = {
        "user_id": user[0],
        "name": user[1],
        "email": user[2],
        "phone": user[3],
        "address": user[4],
        "role": user[7]
    }

    print(f"Login successful for {email}, role: {user[7]}")

    return jsonify({
        "success": True,
        "user": user_data,
        "token": "demo-token"
    }), 200


# ---------------------
# REGISTER ROUTE
# ---------------------
@app.route('/register', methods=['POST'])
def register_user():
    data = request.json

    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    address = data.get('address')
    password = data.get('password')

    if not (name and email and password):
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    existing = cursor.fetchone()

    if existing:
        cursor.close()
        conn.close()
        return jsonify({"success": False, "message": "Email already registered"}), 400

    password_hash = generate_password_hash(password)

    cursor.execute("""
        INSERT INTO users (name, email, phone, address, password_hash, role)
        VALUES (%s, %s, %s, %s, %s, 'user')
    """, (name, email, phone, address, password_hash))

    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "user": {
            "user_id": new_id,
            "name": name,
            "email": email,
            "phone": phone,
            "address": address,
            "role": "user"
        }
    }), 200

    # ---------------------
# UPDATE USER PROFILE
# ---------------------
@app.put("/user/<int:user_id>/profile")
def update_user_profile(user_id):
    data = request.json
    
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    
    if not name:
        return jsonify({"success": False, "message": "Name is required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE users 
            SET name = %s, phone = %s, address = %s 
            WHERE user_id = %s
        """, (name, phone, address, user_id))
        
        conn.commit()
        
        # Get updated user data
        cursor.execute("""
            SELECT 
                user_id,
                name,
                email,
                phone,
                address,
                role,
                created_at
            FROM users
            WHERE user_id = %s
        """, (user_id,))
        
        updated_user = cursor.fetchone()
        
        if not updated_user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        user_data = {
            "user_id": updated_user[0],
            "name": updated_user[1],
            "email": updated_user[2],
            "phone": updated_user[3],
            "address": updated_user[4],
            "role": updated_user[5]
        }
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": user_data
        })
        
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

        

# ---------------------
# GET ALL PRODUCTS
# ---------------------
@app.get("/products")
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            p.product_id AS id,
            p.barcode,
            p.name,
            p.description,
            p.price,
            p.stock,
            c.name as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
    """)

    products = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({"success": True, "products": products})

# ---------------------
# GET POPULAR PRODUCTS
# ---------------------
@app.get("/popular-products")
def get_popular_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT 
                p.product_id AS id,
                p.barcode,
                p.name,
                p.description,
                p.price,
                p.stock,
                c.name as category,
                COALESCE(COUNT(oi.order_item_id), 0) as sales
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            GROUP BY p.product_id
            ORDER BY sales DESC, p.product_id DESC
            LIMIT 10
        """)

        products = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({"success": True, "products": products})
    
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# ---------------------
# GET USER ORDERS
# ---------------------
# ---------------------
# GET USER ORDERS WITH COMPLETE DETAILS
# ---------------------
@app.get("/user/<int:user_id>/orders")
def get_user_orders(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # First, get all orders for the user
        cursor.execute("""
            SELECT 
                o.order_id,
                o.total,
                o.status,
                o.created_at,
                pa.method as payment_method
            FROM orders o
            LEFT JOIN payments pa ON o.order_id = pa.order_id
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
        """, (user_id,))
        
        orders = cursor.fetchall()
        
        formatted_orders = []
        
        for order in orders:
            # Get order items for this order
            cursor.execute("""
                SELECT 
                    oi.order_item_id,
                    oi.product_id,
                    oi.quantity,
                    oi.price,
                    p.name,
                    p.description,
                    p.barcode,
                    c.name as category
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE oi.order_id = %s
            """, (order['order_id'],))
            
            order_items = cursor.fetchall()
            
            # Format items
            items = []
            for item in order_items:
                items.append({
                    "id": item['product_id'],
                    "order_item_id": item['order_item_id'],
                    "name": item['name'],
                    "description": item['description'],
                    "price": float(item['price']),
                    "quantity": item['quantity'],
                    "barcode": item['barcode'],
                    "category": item['category'],
                    "subtotal": float(item['price']) * item['quantity']
                })
            
            # Calculate total items count
            total_items = sum(item['quantity'] for item in items)
            
            formatted_orders.append({
                "id": order['order_id'],
                "total": float(order['total']),
                "status": order['status'],
                "created_at": order['created_at'].isoformat() if order['created_at'] else None,
                "payment_method": order['payment_method'] or 'card',
                "items": items,
                "total_items": total_items
            })
        
        return jsonify({
            "success": True,
            "orders": formatted_orders
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# GET ALL CATEGORIES
# ---------------------
@app.get("/categories")
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT 
                category_id as id,
                name,
                description
            FROM categories
            ORDER BY name
        """)
        
        categories = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "categories": categories
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()





# ---------------------
# GET USER CART
# ---------------------
@app.get("/cart/<int:user_id>")
def get_cart(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get or create cart for user
        cursor.execute("""
            SELECT cart_id FROM cart WHERE user_id = %s
        """, (user_id,))
        cart = cursor.fetchone()
        
        if not cart:
            cursor.execute("""
                INSERT INTO cart (user_id) VALUES (%s)
            """, (user_id,))
            conn.commit()
            cart_id = cursor.lastrowid
        else:
            cart_id = cart['cart_id']
        
        # Get cart items with product details
        cursor.execute("""
            SELECT 
                ci.cart_item_id,
                ci.quantity,
                p.product_id AS id,
                p.name,
                p.description,
                p.price,
                p.stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_id = %s
        """, (cart_id,))
        
        items = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "cart_id": cart_id,
            "items": items
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# ADD TO CART
# ---------------------
@app.post("/cart/add")
def add_to_cart():
    data = request.json
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get user's cart
        cursor.execute("""
            SELECT cart_id FROM cart WHERE user_id = %s
        """, (user_id,))
        cart = cursor.fetchone()
        
        if not cart:
            # Create cart if doesn't exist
            cursor.execute("""
                INSERT INTO cart (user_id) VALUES (%s)
            """, (user_id,))
            conn.commit()
            cart_id = cursor.lastrowid
        else:
            cart_id = cart['cart_id']
        
        # Check if product already in cart
        cursor.execute("""
            SELECT cart_item_id, quantity 
            FROM cart_items 
            WHERE cart_id = %s AND product_id = %s
        """, (cart_id, product_id))
        
        existing_item = cursor.fetchone()
        
        if existing_item:
            # Update quantity
            new_quantity = existing_item['quantity'] + quantity
            cursor.execute("""
                UPDATE cart_items 
                SET quantity = %s 
                WHERE cart_item_id = %s
            """, (new_quantity, existing_item['cart_item_id']))
        else:
            # Add new item
            cursor.execute("""
                INSERT INTO cart_items (cart_id, product_id, quantity)
                VALUES (%s, %s, %s)
            """, (cart_id, product_id, quantity))
        
        conn.commit()
        
        return jsonify({
            "success": True,
            "message": "Added to cart"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# UPDATE CART ITEM QUANTITY
# ---------------------
@app.put("/cart/update")
def update_cart_item():
    data = request.json
    cart_item_id = data.get('cart_item_id')
    quantity = data.get('quantity')
    
    if quantity <= 0:
        return remove_cart_item()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE cart_items 
            SET quantity = %s 
            WHERE cart_item_id = %s
        """, (quantity, cart_item_id))
        
        conn.commit()
        
        return jsonify({"success": True, "message": "Cart updated"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# REMOVE FROM CART
# ---------------------
@app.delete("/cart/remove")
def remove_cart_item():
    data = request.json
    cart_item_id = data.get('cart_item_id')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            DELETE FROM cart_items 
            WHERE cart_item_id = %s
        """, (cart_item_id,))
        
        conn.commit()
        
        return jsonify({"success": True, "message": "Removed from cart"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# CLEAR CART
# ---------------------
@app.delete("/cart/clear/<int:user_id>")
def clear_cart(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            DELETE ci
            FROM cart_items ci
            JOIN cart c ON ci.cart_id = c.cart_id
            WHERE c.user_id = %s
        """, (user_id,))
        
        conn.commit()
        
        return jsonify({"success": True, "message": "Cart cleared"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# ADMIN: GET SALES ANALYTICS
# ---------------------
@app.get("/admin/sales-analytics")
def get_sales_analytics():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get date ranges
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # 1. Top selling products (all time)
        cursor.execute("""
            SELECT 
                p.product_id as id,
                p.name,
                p.price,
                p.stock,
                COALESCE(SUM(oi.quantity), 0) as total_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
            FROM products p
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            GROUP BY p.product_id, p.name, p.price, p.stock
            ORDER BY total_sold DESC
            LIMIT 10
        """)
        top_products = cursor.fetchall()
        
        # 2. Sales by category
        cursor.execute("""
            SELECT 
                c.name as category_name,
                COALESCE(SUM(oi.quantity), 0) as total_sold,
                COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
            FROM categories c
            LEFT JOIN products p ON c.category_id = p.category_id
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            GROUP BY c.category_id, c.name
        """)
        category_sales = cursor.fetchall()
        
        # 3. Daily sales for last 7 days
        cursor.execute("""
            SELECT 
                DATE(o.created_at) as sale_date,
                COUNT(DISTINCT o.order_id) as orders_count,
                SUM(oi.quantity) as items_sold,
                SUM(oi.quantity * oi.price) as daily_revenue
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.created_at >= %s
            GROUP BY DATE(o.created_at)
            ORDER BY sale_date
        """, (week_ago,))
        daily_sales = cursor.fetchall()
        
        # 4. Overall stats
        cursor.execute("SELECT COUNT(*) as total_products FROM products")
        total_products = cursor.fetchone()['total_products']
        
        cursor.execute("SELECT COUNT(*) as total_orders FROM orders")
        total_orders = cursor.fetchone()['total_orders']
        
        cursor.execute("SELECT COUNT(*) as total_users FROM users")
        total_users = cursor.fetchone()['total_users']
        
        cursor.execute("""
            SELECT COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id 
            WHERE o.status = 'completed'
        """)
        total_revenue = cursor.fetchone()['total_revenue']
        
        cursor.execute("SELECT COALESCE(SUM(stock), 0) as total_stock FROM products")
        total_stock = cursor.fetchone()['total_stock']
        
        return jsonify({
            "success": True,
            "analytics": {
                "top_products": top_products,
                "category_sales": category_sales,
                "daily_sales": daily_sales,
                "stats": {
                    "total_products": total_products,
                    "total_orders": total_orders,
                    "total_users": total_users,
                    "total_revenue": float(total_revenue),
                    "total_stock": total_stock
                }
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# ADMIN: ADD NEW PRODUCT
# ---------------------
@app.post("/admin/products")
def add_product():
    data = request.json
    
    # Check if user is admin (you should add proper authentication)
    # For now, we'll skip authentication for demo
    
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    stock = data.get('stock', 0)
    category_id = data.get('category_id', 1)
    barcode = data.get('barcode', '')
    
    if not all([name, price]):
        return jsonify({"success": False, "message": "Name and price are required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO products (category_id, name, description, price, stock, barcode)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (category_id, name, description, float(price), int(stock), barcode))
        
        conn.commit()
        product_id = cursor.lastrowid
        
        return jsonify({
            "success": True,
            "message": "Product added successfully",
            "product_id": product_id
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# ADMIN: UPDATE PRODUCT STOCK
# ---------------------
@app.put("/admin/products/<int:product_id>/stock")
def update_product_stock(product_id):
    data = request.json
    stock_change = data.get('stock_change')
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get current stock
        cursor.execute("SELECT stock FROM products WHERE product_id = %s", (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404
        
        new_stock = product['stock'] + stock_change
        
        if new_stock < 0:
            return jsonify({"success": False, "message": "Stock cannot be negative"}), 400
        
        # Update stock
        cursor.execute("""
            UPDATE products 
            SET stock = %s 
            WHERE product_id = %s
        """, (new_stock, product_id))
        
        conn.commit()
        
        return jsonify({
            "success": True,
            "message": "Stock updated successfully",
            "new_stock": new_stock
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# ADMIN: GET ALL USERS
# ---------------------
@app.get("/admin/users")
def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT 
                user_id,
                name,
                email,
                phone,
                address,
                role,
                created_at
            FROM users
            ORDER BY created_at DESC
        """)
        
        users = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "users": users
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# ADMIN: UPDATE USER ROLE
# ---------------------
@app.put("/admin/users/<int:user_id>/role")
def update_user_role(user_id):
    data = request.json
    new_role = data.get('role')
    
    if new_role not in ['admin', 'user']:
        return jsonify({"success": False, "message": "Invalid role"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE users 
            SET role = %s 
            WHERE user_id = %s
        """, (new_role, user_id))
        
        conn.commit()
        
        # Also update admin_users table if needed
        if new_role == 'admin':
            cursor.execute("SELECT * FROM admin_users WHERE user_id = %s", (user_id,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO admin_users (user_id) VALUES (%s)", (user_id,))
                conn.commit()
        
        return jsonify({
            "success": True,
            "message": f"User role updated to {new_role}"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# UPDATE PRODUCT STOCK ON ORDER (CALL THIS WHEN ORDER IS PLACED)
# ---------------------
def update_stock_on_order(order_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get all items in the order
        cursor.execute("""
            SELECT product_id, quantity 
            FROM order_items 
            WHERE order_id = %s
        """, (order_id,))
        
        order_items = cursor.fetchall()
        
        # Update stock for each product
        for item in order_items:
            cursor.execute("""
                UPDATE products 
                SET stock = stock - %s 
                WHERE product_id = %s AND stock >= %s
            """, (item['quantity'], item['product_id'], item['quantity']))
        
        conn.commit()
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

# ---------------------
# MODIFY THE PLACE ORDER ENDPOINT (ADD THIS TO YOUR EXISTING CODE)
# ---------------------
@app.post("/orders")
def create_order():
    data = request.json
    user_id = data.get('user_id')
    items = data.get('items', [])
    
    if not user_id or not items:
        return jsonify({"success": False, "message": "Missing required data"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Calculate total
        total = sum(item['price'] * item['quantity'] for item in items)
        
        # Create order
        cursor.execute("""
            INSERT INTO orders (user_id, total, status)
            VALUES (%s, %s, 'completed')
        """, (user_id, total))
        
        order_id = cursor.lastrowid
        
        # Add order items
        for item in items:
            cursor.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (order_id, item['product_id'], item['quantity'], item['price']))
            
            # Update product stock
            cursor.execute("""
                UPDATE products 
                SET stock = stock - %s 
                WHERE product_id = %s
            """, (item['quantity'], item['product_id']))
        
        # Add payment record
        cursor.execute("""
            INSERT INTO payments (order_id, amount, method)
            VALUES (%s, %s, 'card')
        """, (order_id, total))
        
        conn.commit()
        
        return jsonify({
            "success": True,
            "message": "Order placed successfully",
            "order_id": order_id
        })
        
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    # Add this import at the top
from collections import defaultdict

# ---------------------
# GET PURCHASE ASSOCIATIONS
# ---------------------
@app.get("/analysis/purchase-associations")
def get_purchase_associations():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get all completed orders
        cursor.execute("""
            SELECT o.order_id, oi.product_id
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.status = 'completed'
            ORDER BY o.order_id
        """)
        
        order_items = cursor.fetchall()
        
        # Group items by order
        orders = defaultdict(list)
        for item in order_items:
            orders[item['order_id']].append(item['product_id'])
        
        # Calculate associations
        associations = defaultdict(lambda: defaultdict(int))
        product_counts = defaultdict(int)
        
        for order_id, products in orders.items():
            # Count each product
            for product_id in products:
                product_counts[product_id] += 1
            
            # Count co-purchases
            for i in range(len(products)):
                for j in range(i + 1, len(products)):
                    p1, p2 = products[i], products[j]
                    associations[p1][p2] += 1
                    associations[p2][p1] += 1
        
        # Convert to percentage
        result = {}
        for product_id, related in associations.items():
            result[product_id] = {}
            for related_id, count in related.items():
                # Calculate percentage: (co-purchase count / product purchase count) * 100
                percentage = (count / product_counts[product_id]) * 100 if product_counts[product_id] > 0 else 0
                result[product_id][related_id] = round(percentage, 1)
        
        # Get all products for reference
        cursor.execute("""
            SELECT product_id as id, name, price, stock, image
            FROM products
            ORDER BY name
        """)
        all_products = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "associations": result,
            "products": all_products
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------
# GET ANALYSIS FOR SPECIFIC PRODUCT
# ---------------------
@app.get("/analysis/product/<int:product_id>")
def get_product_analysis(product_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get product details with category
        cursor.execute("""
            SELECT 
                p.product_id as id,
                p.name,
                p.description,
                p.price,
                p.stock,
                c.name as category
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = %s
        """, (product_id,))
        
        product = cursor.fetchone()
        
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404
        
        # Get purchase associations for this product (with categories)
        cursor.execute("""
            WITH product_orders AS (
                SELECT DISTINCT oi.order_id
                FROM order_items oi
                WHERE oi.product_id = %s
            ),
            co_purchased AS (
                SELECT 
                    oi.product_id,
                    COUNT(DISTINCT oi.order_id) as co_purchase_count,
                    p.name,
                    p.price,
                    p.stock,
                    c.name as category
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE oi.order_id IN (SELECT order_id FROM product_orders)
                    AND oi.product_id != %s
                GROUP BY oi.product_id, p.name, p.price, p.stock, c.name
                ORDER BY co_purchase_count DESC
                LIMIT 5
            ),
            total_product_orders AS (
                SELECT COUNT(DISTINCT order_id) as total_orders
                FROM product_orders
            )
            SELECT 
                cp.*,
                ROUND((cp.co_purchase_count * 100.0 / tpo.total_orders), 1) as percentage
            FROM co_purchased cp
            CROSS JOIN total_product_orders tpo
        """, (product_id, product_id))
        
        associated_products = cursor.fetchall()
        
        # Get sales statistics for this product
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT o.order_id) as total_orders,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as total_revenue,
                AVG(oi.quantity) as avg_quantity_per_order
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE oi.product_id = %s AND o.status = 'completed'
        """, (product_id,))
        
        stats = cursor.fetchone()
        
        # Get monthly sales trend
        cursor.execute("""
            SELECT 
                DATE_FORMAT(o.created_at, '%Y-%m') as month,
                SUM(oi.quantity) as monthly_sold,
                SUM(oi.quantity * oi.price) as monthly_revenue
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE oi.product_id = %s AND o.status = 'completed'
            GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
            ORDER BY month DESC
            LIMIT 6
        """, (product_id,))
        
        monthly_trend = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "product": product,
            "associated_products": associated_products,
            "stats": stats or {},
            "monthly_trend": monthly_trend
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ---------------------
# RUN APP AT THE END
# ---------------------
if __name__ == "__main__":
    print("🚀 Flask backend running on http://127.0.0.1:5000")
    app.run(debug=True)

