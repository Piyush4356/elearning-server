# 🎓 E-Learning Platform — Backend (Server)

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

> **Backend of a full-stack E-Learning web application**, built using Node.js, Express, and MongoDB.  
> This server manages authentication, course handling, lectures, and payment processing for the platform.

---

## 🧩 Project Overview

The **E-Learning Platform** enables instructors to upload and manage courses while allowing students to enroll, learn, and pay securely.  
This repository contains only the **backend (server)** portion — the frontend is built separately for modular development.

### 🔗 Related Repositories
| Repo | Description |
|------|--------------|
| [E-Learning Frontend](https://github.com/Piyush4356/elearning-frontend) | React-based client interface |
| [E-Learning Server (this)](https://github.com/Piyush4356/elearning-server) | Backend REST API with Express and MongoDB |

---

## 🚀 Features

✅ User Authentication & Authorization (JWT-based)  
✅ Role-based access for Admin, Instructor, and Student  
✅ Course & Lecture Management APIs  
✅ File Uploads using **Multer** & **Cloudinary**  
✅ Secure Payments via **Razorpay / Stripe**  
✅ Robust Error Handling Middleware  
✅ MongoDB Integration using **Mongoose**  
✅ CORS Configured for Cross-Origin Frontend Access  

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JSON Web Token (JWT) |
| **File Uploads** | Multer + Cloudinary |
| **Payments** | Razorpay / Stripe |
| **Environment** | dotenv |
| **Version Control** | Git & GitHub |

---

## ⚙️ Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Piyush4356/elearning-server.git
cd elearning-server
