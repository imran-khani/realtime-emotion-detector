import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import LandingPage from './components/LandingPage';
import { useState } from 'react';

function App() {
  const [showApp, setShowApp] = useState(() => {
    // Check if user has already visited before
    return localStorage.getItem('hasVisited') === 'true';
  });

  const handleGetStarted = () => {
    localStorage.setItem('hasVisited', 'true');
    setShowApp(true);
  };

  return (
    <ThemeProvider>
      {!showApp ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="about" element={<About />} />
            </Route>
          </Routes>
        </Router>
      )}
    </ThemeProvider>
  );
}

export default App;