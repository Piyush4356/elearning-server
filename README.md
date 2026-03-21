# 🎓 E-Learning Platform — Backend (Server)

<p align="center">
  <b>Robust backend API powering a full-stack E-Learning platform</b><br/>
  Built with Node.js, Express, and MongoDB 🚀
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/API-REST-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" />
</p>

---

## 📌 Overview

The **E-Learning Platform Backend** is a scalable REST API that handles:

* 🔐 User authentication & authorization
* 🎓 Course and lecture management
* 💳 Secure payment integration
* ☁️ File uploads and media storage

It is designed with a **modular and clean architecture**, making it easy to extend and maintain.

---

## 🔗 Related Repositories

| Repository                                                      | Description           |
| --------------------------------------------------------------- | --------------------- |
| 🌐 [Frontend](https://github.com/Piyush4356/elearning-frontend) | React-based UI        |
| 🖥️ [Backend](https://github.com/Piyush4356/elearning-server)   | Express + MongoDB API |

---

## 🚀 Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Role-based access (Admin, Instructor, Student)

### 📚 Course Management

* Create, update, delete courses
* Add and manage lectures
* Instructor-controlled content

### ☁️ File Handling

* Upload images/videos using **Multer**
* Cloud storage via **Cloudinary**

### 💳 Payments

* Integrated with **Razorpay / Stripe**
* Secure transaction flow

### ⚙️ Backend Architecture

* Centralized error handling
* Middleware-based structure
* RESTful API design

---

## 🧠 Tech Stack

| Category    | Technology           |
| ----------- | -------------------- |
| Runtime     | Node.js              |
| Framework   | Express.js           |
| Database    | MongoDB + Mongoose   |
| Auth        | JWT (JSON Web Token) |
| File Upload | Multer + Cloudinary  |
| Payments    | Razorpay / Stripe    |
| Environment | dotenv               |

---

## 📁 Project Structure

```
elearning-server/
│── controllers/
│── models/
│── routes/
│── middleware/
│── utils/
│── config/
│── server.js
│── package.json
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Piyush4356/elearning-server.git
cd elearning-server
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### 4️⃣ Run the server

```bash
npm run dev
```

---

## 📡 API Highlights

| Method | Endpoint             | Description     |
| ------ | -------------------- | --------------- |
| POST   | `/api/auth/register` | Register user   |
| POST   | `/api/auth/login`    | Login user      |
| GET    | `/api/courses`       | Get all courses |
| POST   | `/api/courses`       | Create course   |
| POST   | `/api/payment`       | Handle payment  |

---

## 🛡️ Security Features

* Password hashing (bcrypt)
* JWT token validation
* Protected routes middleware
* Secure payment verification

---

## 📈 Future Improvements

* 🔄 Refresh tokens for better auth
* 📊 Analytics dashboard
* 📱 Mobile API optimization
* ⭐ Course rating & reviews

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Piyush Sharma**

* GitHub: https://github.com/Piyush4356

---

<p align="center">
  ⭐ If you like this project, don't forget to star the repo!
</p>
