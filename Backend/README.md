# Promact AI Recruitment Screening Project

## Setup & Run

### Clone the Repository

```bash
git clone https://github.com/yourusername/ATS_Recruitment_Screening_System.git
cd ATS_Recruitment_Screening_System
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

Create a `.env` file and add:

```env
# Set Environment: "development" for local, "production" for live server
NODE_ENV=development

# ===== Development Database (Local) =====
DEV_DB_HOSTNAME=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=aprss
DEV_DB_USERNAME=postgres
DEV_DB_PASSWORD=your_password
DEV_DB_DIALECT=postgres

# ===== UAT Database =====
UAT_DB_HOSTNAME=your_uat_db_host
UAT_DB_PORT=5432
UAT_DB_NAME=your_uat_db_name
UAT_DB_USERNAME=your_uat_db_user
UAT_DB_PASSWORD=your_uat_db_password
UAT_DB_DIALECT=postgres
UAT_DB_SSL=true

# ===== Production Database =====
PROD_DB_HOSTNAME=your_production_db_host
PROD_DB_PORT=5432
PROD_DB_NAME=your_production_db_name
PROD_DB_USERNAME=your_production_db_user
PROD_DB_PASSWORD=your_production_db_password
PROD_DB_DIALECT=postgres
PROD_DB_SSL=true

# JWT Secret
JWT_SECRET=your_jwt_secret

# Server Port
SERVER_PORT=3000

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# AI Server Configuration
AI_SERVER_URL=http://127.0.0.1:8000
AI_BACKEND_URL=http://127.0.0.1:8000/api

# For debugging
DEBUG=true
```

### Database Setup

#### Run Migrations

```bash
# Reset database (undo all migrations)
npx sequelize-cli db:migrate:undo:all

# Apply migrations
npx sequelize-cli db:migrate
```

#### Create New Migrations

```bash
# Example: Create a migration for users table
npx sequelize-cli migration:generate --name create_users_table
```

### Run the Server

```bash
# Start the server in development mode
npm run dev

# Start the server in production mode
npm start
```
