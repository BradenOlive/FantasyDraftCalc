import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DraftBoard from './pages/DraftBoard';
import PickSuggestions from './pages/PickSuggestions';
import Roster from './pages/Roster';
import Settings from './pages/Settings';
import { DraftProvider } from './context/DraftContext';
import './App.css';

function App() {
  return (
    <DraftProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/draft-board" element={<DraftBoard />} />
              <Route path="/suggestions" element={<PickSuggestions />} />
              <Route path="/roster" element={<Roster />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </Router>
    </DraftProvider>
  );
}

export default App;
