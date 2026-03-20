# 🌊 ProvisionFlow
**deploy link.**:https://provisionflow.vercel.app/signup

**For try:   Admin  Email:admin@gmail.com   password:admin@26**
         

**Elevate Your Workflow Automation.** 🚀

ProvisionFlow is a cutting-edge, full-stack workflow automation and management platform designed to streamline business processes, from complex approvals to automated notifications. Built with modern aesthetics and high performance in mind, it provides a seamless experience for both administrators and clients.

---

## ✨ Key Features

- **🛠️ Custom Workflow Builder**: Design complex multi-step workflows with intuitive logic.
- **🔄 Version Control**: Track changes, create versions, and restore previous workflow states.
- **🛡️ Secure Transitions**: Role-based access control (RBAC) ensuring only authorized users manage critical flows.
- **📧 Email-Powered Interactions**: Approve or decline requests directly from your inbox via SMTP-integrated notifications.
- **📊 Interactive Dashboards**: Premium UI with glassmorphism, GSAP-powered animations, and real-time activity tracking.
- **⚡ High Performance**: Low-latency responses powered by Redis caching and Neon PostgreSQL.
- **🔒 Enterprise Security**: Rate limiting and protection powered by Arcjet, with JWT-based authentication.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **State Management**: React Hooks & Context API

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **Security**: [Arcjet](https://arcjet.com/) & [JSON Web Tokens (JWT)](https://jwt.io/)
- **Mailing**: [Nodemailer](https://nodemailer.com/)

---

## 📂 Project Structure

```bash
ProvisionFlow/
├── frontend/           # Next.js Application
│   ├── app/            # App Router (User & Admin Dashboards)
│   ├── components/     # Reusable UI Components
│   ├── lib/            # Utility functions & API clients
│   └── public/         # Static assets
├── backend/            # Express.js Server
│   ├── controller/     # Business logic for routes
│   ├── routes/         # API endpoint definitions
│   ├── middleware/     # Authentication & Security
│   ├── db.js           # Database connection setup
│   └── server.js       # Entry point
└── docs/               # Documentation & Resources (Optional)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (Neon recommended)
- Redis instance

### 1. Clone the repository
```bash
git clone https://github.com/pranitha080511/provisionflow.git
cd provisionflow
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your credentials:
```env
PORT=5000
DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
JWT_SECRET=your_secret_key
ARCJET_KEY=your_arcjet_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Run the development server:
```bash
npm run dev
```

---

## 🚧 Future Enhancements

* 🤖 AI-based workflow recommendations  
* 📱 Mobile App (Flutter / React Native)  
* 📊 Advanced analytics dashboard  
* 🔗 Advanced Redis integration for caching, queue management, and real-time updates  

---

## 🎨 UI/UX Design

ProvisionFlow prioritizes **Visual Excellence**:
- **Glassmorphism**: Sleek, frosted-glass effects for dash cards and sidebars.
- **Micro-animations**: Smooth hover transitions and entrance animations using GSAP.
- **Dark Mode First**: A sophisticated dark-themed interface designed for focus.
- **Dynamic Updates**: Real-time status updates for active workflows.

---

## 🔄 Example Workflow (Loan Approval)

* User submits loan request  
* Manager reviews application  
* Admin gives final approval  
* System sends notification (Email + Dashboard)  

---

## 📄 License

This project is licensed under the **ISC License**.

---

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ by [Pranitha](https://github.com/pranitha080511)**
