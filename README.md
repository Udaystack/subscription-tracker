# 💳 Subscription Tracker

> Never get surprised by a renewal charge again.

A full stack finance application that tracks all your subscriptions, calculates your monthly/yearly spend, and sends **automated email/SMS alerts** via AWS SNS before renewal dates — built with Spring Boot microservices, React, AWS Lambda, and Docker.

---

## 🚀 Live Demo

> Coming soon — deploying to AWS Elastic Beanstalk + Amplify

---

## 📸 Screenshots

> Dashboard · Subscription List · Add Subscription form
> *(Add screenshots here after running locally)*

---

## ✨ Features

- 🔐 **JWT Authentication** — secure register/login
- 📋 **Subscription Management** — add, edit, delete subscriptions
- 💰 **Spend Summary** — monthly & yearly cost breakdown
- 🔔 **Smart Alerts** — AWS SNS email/SMS notifications before renewal dates
- ⏰ **AWS Lambda Scheduler** — daily automated renewal checks via EventBridge
- 📊 **Dashboard** — visual spend breakdown by category with charts
- 🐳 **Fully Dockerized** — one command local setup

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  Spring Boot Backend  │────▶│  PostgreSQL DB  │
│   (AWS Amplify)  │     │  (Elastic Beanstalk)  │     │   (AWS RDS)     │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
             ┌──────▼──────┐            ┌─────────▼────────┐
             │  AWS SNS    │            │   AWS Lambda      │
             │  (Alerts)   │            │ (Daily Scheduler) │
             └─────────────┘            └──────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, React Router |
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Auth | JWT (JSON Web Tokens) |
| Database | PostgreSQL (AWS RDS) |
| Messaging | AWS SNS, AWS SQS |
| Serverless | AWS Lambda + EventBridge |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Cloud | AWS EC2 / Elastic Beanstalk, AWS Amplify |

---

## 📁 Project Structure

```
subscription-tracker/
├── backend/                          # Spring Boot application
│   ├── src/main/java/com/subscriptiontracker/
│   │   ├── controller/               # REST controllers
│   │   ├── service/                  # Business logic + SNS service
│   │   ├── repository/               # JPA repositories
│   │   ├── model/                    # JPA entities
│   │   ├── dto/                      # Request/Response DTOs
│   │   └── config/                   # Security, JWT, AWS config
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                         # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/            # Summary cards + charts
│   │   │   └── Subscriptions/        # List + Add/Edit form
│   │   ├── services/api.js           # Axios API client
│   │   └── styles/index.css          # Tailwind styles
│   ├── Dockerfile
│   └── nginx.conf
├── lambda/                           # AWS Lambda function (Node.js)
│   └── index.js                      # Renewal checker + SNS publisher
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- AWS account (for SNS alerts)

### 1. Clone the repo

```bash
git clone https://github.com/Udaystack/subscription-tracker.git
cd subscription-tracker
```

### 2. Set environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
JWT_SECRET=your-256-bit-secret-key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:YOUR_ACCOUNT:subscription-alerts
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| PostgreSQL | localhost:5432 |

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login + get JWT token
```

### Subscriptions
```
GET    /api/subscriptions           Get all subscriptions
POST   /api/subscriptions           Create subscription
GET    /api/subscriptions/:id       Get single subscription
PUT    /api/subscriptions/:id       Update subscription
DELETE /api/subscriptions/:id       Soft delete subscription
GET    /api/subscriptions/summary   Get spend summary
```

---

## ☁️ AWS Setup

### SNS Topic (for alerts)
```bash
aws sns create-topic --name subscription-alerts
aws sns subscribe --topic-arn <TOPIC_ARN> --protocol email --notification-endpoint your@email.com
```

### Lambda Deployment
```bash
cd lambda
npm install
npm run package   # creates lambda-function.zip

aws lambda create-function \
  --function-name subscription-renewal-checker \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://lambda-function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-role \
  --environment Variables="{DB_HOST=...,SNS_TOPIC_ARN=...,REMINDER_DAYS=3}"
```

### EventBridge Rule (daily trigger)
```bash
aws events put-rule \
  --name daily-renewal-check \
  --schedule-expression "cron(0 8 * * ? *)"
```

---

## 🧪 Running Tests

```bash
cd backend
mvn test
```

---

## 🔮 Roadmap

- [ ] AWS deployment (Elastic Beanstalk + Amplify)
- [ ] GitHub Actions CI/CD pipeline
- [ ] SMS alerts via AWS SNS + phone number
- [ ] Multi-currency support
- [ ] Export to CSV
- [ ] Mobile responsive improvements

---

## 👨‍💻 Author

**Uday Kiran Gundapaneni**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/udaykiran-gundapaneni)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Udaystack)
[![LeetCode](https://img.shields.io/badge/LeetCode-FFA116?style=flat&logo=leetcode&logoColor=black)](https://leetcode.com/YOUR_LEETCODE)

---

## 📄 License

MIT License — feel free to use and modify.

---

<p align="center">
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
</p>
