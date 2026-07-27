# React + Laravel Project

A simple full-stack web application built with **React** for the frontend and **Laravel** for the backend.

## Requirements

- PHP 8.x
- Composer
- Node.js & npm
- MySQL (or any supported database)

## Installation

### Clone the repository

```bash
git clone https://github.com/your-username/your-repository.git
cd your-repository
```

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Update your `.env` file with your database credentials, then run:

```bash
php artisan migrate
php artisan serve
```

### Frontend (React)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```text
project/
├── backend/    # Laravel API
└── frontend/   # React application
```