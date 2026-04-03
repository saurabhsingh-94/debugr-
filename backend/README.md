# Debugr Backend - Day 1

The foundational backend for **Debugr**, a Bug Bounty platform. This is an Express.js server built with ES Modules, connected to a PostgreSQL database on Railway.

## 🚀 Features

- **Express.js** with ES Modules.
- **PostgreSQL** connection pooling via `pg`.
- **Morgan/Logging**: Development logging enabled.
- **Standardized Error Handling**: Centralized error and 404 handling.
- **Railway Ready**: Environment variable support for seamless deployment.

## 🛠️ Setup & Installation

1.  **Clone the Repository**:
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the `backend` directory:
    ```env
    DATABASE_URL=your_postgres_connection_string
    PORT=3000
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

## 🔌 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | GET | Check server status and uptime. |
| `/db-test` | GET | Test PostgreSQL connection. |

## 🚢 Deployment (Railway)

1.  **Connect GitHub**: In the Railway dashboard, create a new service and select the `debugr-backend` repository.
2.  **Variables**: Add `DATABASE_URL` (Internal) to your service environment variables.
3.  **Deploy**: Railway will automatically build and deploy the application.
