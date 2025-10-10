# 📚 Online Exam Application

A comprehensive online exam management system built with modern web technologies. This application allows administrators and teachers to create and manage exams, questions, and students efficiently.

## ✨ Features

### 👨‍💼 Admin Features
- **User Management**: Control students and instructors
- **System Administration**: Complete system oversight and configuration
- **Role-Based Access Control**: Secure role-based permissions

### 👨‍🏫 Teacher Features
- **Question Bank**: Create and manage different types of questions
- **Exam Creation**: Build custom exams using the question bank
- **Student Assignment**: Assign exams to specific students
- **Results Management**: View and analyze exam results

### 👨‍🎓 Student Features
- **Exam Taking**: Interactive exam interface
- **Results Viewing**: Access to exam results and performance
- **User Profile**: Manage personal information

## 🛠️ Technologies Used

### Backend
- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Frontend
- **Vue 3** with **TypeScript**
- **Vite** - Build tool
- **Vue Router** - Routing
- **Pinia** - State management
- **Axios** - HTTP client
- **SCSS** - Styling
- **i18n** - Internationalization (Turkish & English)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd examapp
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/examapp
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

### ⚡ Initial Setup (Choose One)

#### Option 1: Interactive Setup (Recommended)
```bash
cd backend
npm run install-app
```
This will launch an interactive installer in Turkish that guides you through creating your admin user.

#### Option 2: Quick Setup with Default Admin
```bash
cd backend
npm run setup
```
This creates a default admin user:
- **Email**: admin@examapp.com
- **Password**: admin123
- **Role**: admin

⚠️ **Important**: Change the default password after first login!

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start Backend**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3001`

2. **Start Frontend**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Mode

1. **Build Backend**
```bash
cd backend
npm run build
npm start
```

2. **Build Frontend**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
examapp/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Database configuration
│   │   ├── scripts/        # Setup and utility scripts
│   │   └── app.ts          # Express app entry point
│   ├── dist/               # Compiled JavaScript
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Vue components
    │   ├── views/          # Page components
    │   ├── stores/         # Pinia stores
    │   ├── composables/    # Vue composables
    │   ├── services/       # API services
    │   ├── types/          # TypeScript type definitions
    │   ├── locales/        # i18n translations
    │   └── router/         # Vue Router configuration
    └── package.json
```

## 🔧 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run install-app` - Interactive setup wizard
- `npm run seed-admin` - Create default admin user
- `npm run setup` - Quick setup with default admin

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 API Endpoints

The backend provides RESTful APIs for:
- `/api/auth` - Authentication (login, register)
- `/api/users` - User management
- `/api/teachers` - Teacher operations
- `/api/students` - Student operations
- `/api/exams` - Exam management
- `/api/questions` - Question bank

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. The frontend automatically includes the authentication token in API requests through Axios interceptors.

## 🌍 Internationalization

The application supports multiple languages:
- **Turkish** (tr)
- **English** (en)

Language can be switched through the UI language selector.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues during setup or usage, please check:
1. MongoDB connection is working
2. All environment variables are set correctly
3. Both backend and frontend servers are running
4. Admin user has been created successfully

For additional help, please create an issue in the repository.
