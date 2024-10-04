// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import DrinksPage from './DrinksPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/drinks" element={<DrinksPage />} />
      </Routes>
    </Router>
  );
}

export default App;
