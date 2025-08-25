import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFootballBall, FaChartLine, FaUsers, FaCog } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaFootballBall /> },
    { path: '/draft-board', label: 'Draft Board', icon: <FaChartLine /> },
    { path: '/suggestions', label: 'Suggestions', icon: <FaChartLine /> },
    { path: '/roster', label: 'My Team', icon: <FaUsers /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <FaFootballBall className="navbar-logo" />
          <span className="navbar-title">Fantasy Draft Calculator</span>
        </div>
        
        <ul className="navbar-nav">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
