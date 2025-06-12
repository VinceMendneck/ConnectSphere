import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import HashtagPage from './pages/HashtagPage';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { Component, type ReactNode, useLayoutEffect, useState } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo deu errado. Tente recarregar a página.</h1>;
    }
    return this.props.children;
  }
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme || savedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    setIsInitialized(true);
  }, []);

  if (!isInitialized) return null; // Evita renderização antes da inicialização

  return (
    <Router>
      <AuthProvider>
        <PostProvider>
          <ErrorBoundary>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 ml-64">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/hashtag/:tag" element={<HashtagPage />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </ErrorBoundary>
        </PostProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;