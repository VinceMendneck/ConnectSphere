// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HashtagPage from './pages/HashtagPage';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen bg-[#ffffff] dark:bg-[#4b5563]">
          <Sidebar />
          <main className="flex-1 w-full bg-[#ffffff] dark:bg-[#4b5563]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/hashtag/:tag" element={<HashtagPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;