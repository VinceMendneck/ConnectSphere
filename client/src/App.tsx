// client/src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HashtagPage from './pages/HashtagPage';
import Profile from './pages/Profile';

function App() {
  useEffect(() => {
    // Define o modo escuro como padrão ao carregar a página
    document.documentElement.classList.add('dark-theme');
    // Remove a classe light-theme, se presente
    document.documentElement.classList.remove('light-theme');
  }, []);

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
              <Route path="/profile/:id" element={<Profile />} />
            </Routes>
          </div>
        </BrowserRouter>
      </PostProvider>
    </AuthProvider>
  );
}

export default App;