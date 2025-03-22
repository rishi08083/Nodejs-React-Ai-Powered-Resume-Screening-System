# Promact_AI_Recruitement_Screening_Project

# Recruitment Screening System

## Setup & Run

### Clone the Repository

```
git clone https://github.com/yourusername/ATS_Recruitment_Screening_System.git
cd ATS_Recruitment_Screening_System
```

## install Dependencies

```
npm install
npm install

```

### Set Up Environment Variables

Create a .env file and add:

```
# Set Environment: "development" for local, "production" for live server
NODE_ENV=development

# ===== Development Database (Local) =====
DEV_DB_HOSTNAME=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=your_local_db_name
DEV_DB_USERNAME=your_local_db_user
DEV_DB_PASSWORD=your_local_db_password
DEV_DB_DIALECT=postgres

# ===== Production Database (Render, Heroku, AWS, etc.) =====
PROD_DB_HOSTNAME=your_production_db_host
PROD_DB_PORT=5432
PROD_DB_NAME=your_production_db_name
PROD_DB_USERNAME=your_production_db_user
PROD_DB_PASSWORD=your_production_db_password
PROD_DB_DIALECT=postgres
PROD_DB_SSL=true



```

### Set Up the Database

```
npx sequelize-cli db:migrate
```

### Run the Server

```
npm start    # Production
npm run dev  # Development (auto-restart)
```
