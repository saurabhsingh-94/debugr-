# Debugr Backend - Day 4 (Enterprise Hardened)

The enterprise-grade backend for **Debugr**, a Bug Bounty platform. Built with Express.js, PostgreSQL, and Winston for robust observability and security.

## 🚀 Features (Day 4 Update)

- **Express.js** with ES Modules.
- **PostgreSQL** connection pooling via `pg`.
- **Winston / Professional Logging**: Centralized logging to console and files (`logs/app.log`, `logs/error.log`).
- **Standardized Error Handling**: Custom `ApiError` class for consistent, safe error responses.
- **Security Hardening**:
    - **Helmet**: Strict security headers.
    - **Rate Limiting**: Brute-force protection on Auth and Reports.
    - **CORS Whitelist**: Origin-based access control.
    - **Request Validation**: Strict Joi/Express-Validator rules for all inputs.
- **Cloud Evidence**: Integrated with Cloudinary for bug report attachments.
- **SMTP Ready**: Production-ready mailer with SMTP and JSON logging support.
- **Railway Ready**: Environment variable validation on startup.

## 🛠️ Setup & Installation

1.  **Clone the Repository**:
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the `backend` directory (vetted on boot):
    ```env
    DATABASE_URL=your_postgres_connection_string
    JWT_SECRET=your_secure_secret
    CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    # Optional SMTP
    SMTP_HOST=...
    SMTP_PORT=...
    SMTP_USER=...
    SMTP_PASS=...
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

## 🔌 API Endpoints

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/health` | GET | No | Check server status and uptime. |
| `/api/auth/register` | POST | No | Register a new researcher. |
| `/api/auth/login` | POST | No | Login and receive JWT. |
| `/api/reports` | POST | JWT | Submit a new bug report. |
| `/api/reports/my-reports`| GET | JWT | List reports submitted by the user. |
| `/api/admin/stats` | GET | Admin | Get platform-wide statistics. |
| `/api/admin/reports` | GET | Admin | List and filter all reports. |
| `/api/admin/reports/:id` | PATCH | Admin | Update report status/bounty. |

## 🚢 Testing

Run the hardening test suite:
```bash
node test-day4-hardening.js
```
