import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './routes/Layout'
import Home from './routes/Home'
import CreatePost from './routes/CreatePost'
import PostDetail from './routes/PostDetail'
import EditPost from './routes/EditPost'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/edit/:id" element={<EditPost />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App