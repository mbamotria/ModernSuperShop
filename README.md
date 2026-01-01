# ModernSuperShop

A comprehensive shop stock simulator and management system built with React and Flask. This application allows users to manage inventory, simulate marketplace operations, track orders, and analyze sales data in a modern, user-friendly interface.

## Features

- **User Authentication**: Secure login and registration system
- **Inventory Management**: Add, update, and track product stock levels
- **Marketplace**: Browse and purchase products from the simulated shop
- **Shopping Cart**: Add items to cart and proceed to checkout
- **Order History**: View past orders and generate receipts
- **Analytics Dashboard**: Visualize sales data, inventory trends, and performance metrics
- **Admin Panel**: User management and administrative controls
- **PDF Generation**: Generate receipts and reports using jsPDF
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop compatibility

## Tech Stack

### Frontend
- **React 19**: Modern JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **jsPDF**: PDF generation library

### Backend
- **Flask**: Lightweight Python web framework
- **MySQL**: Relational database for data storage
- **Flask-CORS**: Cross-origin resource sharing support

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MySQL Server
- npm or yarn package manager

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install flask flask-cors mysql-connector-python
   ```

3. Set up the MySQL database:
   - Create a database named `supershop`
   - Import the SQL schema from `src/data/supershop.sql`

4. Update database credentials in `app.py` if necessary (default: host=localhost, user=root, password="", database=supershop)

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your API keys:
   ```
   VITE_API_URL=/api
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Usage

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```
   The backend will run on `http://localhost:5000`

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
├── backend/
│   ├── app.py              # Main Flask application
│   ├── server.py           # Alternative server file
│   ├── create_user.py      # User creation utilities
│   └── generate_hash.py    # Password hashing utilities
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/              # Page components
│   ├── utils/              # Utility functions
│   ├── data/               # Database schema and sample data
│   └── assets/             # Images and icons
├── .env                    # Environment variables (not committed)
├── package.json            # Frontend dependencies
└── vite.config.js          # Vite configuration
```

## API Endpoints

The backend provides RESTful API endpoints for:
- User authentication (`/login`, `/register`)
- Product management (`/products`)
- Cart operations (`/cart`)
- Order processing (`/orders`)
- Analytics data (`/analytics`)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- API keys and sensitive data are stored in environment variables
- Passwords are hashed using Werkzeug security
- CORS is enabled for cross-origin requests

## Acknowledgments

- Built with React and Vite
- Icons provided by Lucide React
- PDF generation powered by jsPDF
