# MERN Chat Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring Socket.IO for real-time messaging, AI-powered translation, friend requests, group messaging, and comprehensive admin controls.

## ✨ Features

### Core Functionality
- **Real-time Messaging**: Instant messaging powered by Socket.IO
- **User Authentication**: Secure signup/login with JWT and bcrypt
- **Friend System**: Send, accept, and manage friend requests
- **Group Messaging**: Create and participate in group conversations
- **User Profiles**: Customizable profiles with Cloudinary image uploads
- **AI Translation**: Integrated Google Generative AI for message translation
- **Admin Dashboard**: User management, reporting system, and moderation tools

### Additional Features
- **Profanity Filter**: Automatic content moderation using leo-profanity
- **Report System**: Report users and messages for inappropriate content
- **Deleted User Tracking**: Archive system for removed accounts
- **Online Status**: Real-time user presence indicators
- **Message History**: Persistent chat storage with MongoDB
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS and DaisyUI

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Cloudinary** - Media file storage
- **Axios** - HTTP client
- **Dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and development server
- **React Router DOM** - Client-side routing
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **Axios** - API requests
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **Marked** - Markdown parsing
- **Google Generative AI** - AI-powered features

## 📁 Project Structure

```
Chat-application-mern-/
├── ECSFINAL-main/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/      # Request handlers
│   │   │   ├── models/           # MongoDB schemas
│   │   │   │   ├── user.model.js
│   │   │   │   ├── message.model.js
│   │   │   │   ├── groupMessage.model.js
│   │   │   │   ├── friendRequest.model.js
│   │   │   │   ├── report.model.js
│   │   │   │   └── deletedUser.model.js
│   │   │   ├── routes/           # API routes
│   │   │   │   ├── auth.route.js
│   │   │   │   ├── message.route.js
│   │   │   │   ├── user.route.js
│   │   │   │   ├── friendRequest.route.js
│   │   │   │   ├── groupMessage.route.js
│   │   │   │   ├── admin.route.js
│   │   │   │   ├── report.route.js
│   │   │   │   └── translate.route.js
│   │   │   ├── middleware/       # Custom middleware
│   │   │   ├── lib/              # Utilities
│   │   │   │   ├── db.js         # Database connection
│   │   │   │   ├── socket.js     # Socket.IO setup
│   │   │   │   ├── cloudinary.js # Image upload config
│   │   │   │   └── utils.js      # Helper functions
│   │   │   └── index.js          # Entry point
│   │   ├── package.json
│   │   └── .gitignore
│   └── frontend/
│       ├── src/
│       │   ├── components/       # React components
│       │   ├── pages/            # Page components
│       │   ├── store/            # Zustand stores
│       │   ├── lib/              # Utilities & configs
│       │   ├── constants/        # App constants
│       │   ├── App.jsx           # Main app component
│       │   ├── main.jsx          # Entry point
│       │   └── index.css         # Global styles
│       ├── public/               # Static assets
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── index.html
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)
- Google AI API key (for translation features)

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

Create a `.env` file in the `frontend` directory (if needed):

```env
VITE_API_URL=http://localhost:5001
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Achuabhal/Chat-application-mern-.git
cd Chat-application-mern-/ECSFINAL-main
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5001`

2. **Start the frontend development server**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

3. **Access the application**
Open your browser and navigate to `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Messages
- `GET /api/messages/users` - Get all chat users
- `GET /api/messages/:id` - Get messages with specific user
- `POST /api/messages/send/:id` - Send message to user

### Friend Requests
- `POST /api/friends/send` - Send friend request
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/reject` - Reject friend request
- `GET /api/friends/requests` - Get pending friend requests

### Group Messages
- `GET /api/group-messages` - Get group messages
- `POST /api/group-messages` - Send group message

### Users
- `GET /api/users` - Get all users
- `PUT /api/users/profile` - Update user profile

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)
- `GET /api/admin/reports` - View reports (admin)

### Reports
- `POST /api/reports` - Submit report
- `GET /api/reports` - Get user reports

### Translation
- `POST /api/translate` - Translate message using AI

## 🎨 Frontend Features

### Pages
- **Login/Signup** - User authentication interface
- **Home/Chat** - Main chat interface with sidebar
- **Profile** - User profile management
- **Admin Dashboard** - User and content moderation
- **Settings** - Application preferences

### Components
- Real-time message components
- Friend request notifications
- User search and discovery
- Profile picture upload
- Theme customization
- Responsive navigation

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Cookie-based session management
- CORS configuration
- Input validation and sanitization
- Profanity filtering
- Admin-only protected routes

## 🌐 Socket.IO Events

### Client → Server
- `connection` - User connects
- `disconnect` - User disconnects
- `sendMessage` - Send chat message
- `typing` - User typing indicator

### Server → Client
- `newMessage` - Receive new message
- `userStatus` - Online/offline status
- `friendRequest` - New friend request notification
- `messageDeleted` - Message deletion event

## 🎯 Development

### Backend Scripts
```bash
npm run dev    # Start with nodemon
```

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📦 Build for Production

### Backend
```bash
cd backend
# Set NODE_ENV=production in .env
node src/index.js
```

### Frontend
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

## 🐛 Known Issues & Limitations

- Translation feature requires valid Google AI API key
- Large file uploads may require additional backend configuration
- Group messaging features may need optimization for large groups

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Achuabhal**
- GitHub: [@Achuabhal](https://github.com/Achuabhal)

## 🙏 Acknowledgments

- MongoDB for database
- Socket.IO for real-time communication
- Cloudinary for media storage
- Google Generative AI for translation
- DaisyUI for UI components
- React and the MERN stack community

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy Chatting! 💬**
