// client/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HashtagPage from './pages/HashtagPage';

function App() {
  return (
    <AuthProvider>
      <PostProvider>
        <BrowserRouter>
          <div className="flex">
            <Sidebar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/hashtag/:id" element={<HashtagPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </PostProvider>
    </AuthProvider>
  );
}

export default App;