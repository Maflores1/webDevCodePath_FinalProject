import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'
import Layout from './routes/Layout'
import Home from './routes/Home'
import CreatePost from './routes/CreatePost'
import PostDetail from './routes/PostDetail'
import EditPost from './routes/EditPost'
import Register from './routes/Register'
import Login from './routes/Login'
import Profile from './routes/Profile'
import EditProfile from './routes/EditProfile'
import About from './routes/About'
import ProtectedRoute from './Components/ProtectedRoute'
import AdminDashboard from './routes/AdminDashboard'
import Community from './routes/Community'
import Toast from './Components/Toast'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/admin" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/community" element={<Community />} />

            {/* Protected Routes */}
            <Route path="/create" element={
              <ProtectedRoute><CreatePost /></ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute><EditPost /></ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute><EditProfile /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App