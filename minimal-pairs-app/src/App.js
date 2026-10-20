
// 2ND ATTEMPT
import './App.css';
import React, { useEffect, useState } from 'react';
//import { Button, Typography, AppBar, Toolbar, IconButton, Menu, MenuItem } from '@mui/material';
//import MenuIcon from '@mui/icons-material/Menu';
//import VolumeUp from '@mui/icons-material/VolumeUp';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
//import { Menu as MenuIcon, VolumeUp } from '@material-ui/icons';
//import Replay from '@mui/icons-material/ReplayRounded';
//import Next from '@mui/icons-material/ArrowBackTwoTone'; // ArrowBackIosTwoTone // ArrowBackTwoTone
import Home from './pages/Home';
import ExercisePage from './pages/ExercisePage';
import GamesOptionsPage from './pages/GamesOptionsPage';
import ExerciseOptionsPage from './pages/ExerciseOptionsPage';
import HelpPage from './pages/HelpPage';
import AboutPage from './pages/AboutPage';
import TicTacToeGame from './pages/Games/TicTacToe/Game';
import Toolbar from './component/Toolbar';
import LoginPage from './pages/LoginPage';
import ChildrenPage from './pages/ChildrenPage';
import { getCurrentUser, logoutUser } from './usersApi';
//import Contact from './component/Contact';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [logoutError, setLogoutError] = useState(null);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then(currentUser => {
        if (active && currentUser) setUser(currentUser);
      })
      .catch(() => {
        if (active) setAuthError('לא ניתן לבדוק את מצב ההתחברות. נסו לרענן את הדף.');
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (authLoading) return <p role="status" dir="rtl">בודק את מצב ההתחברות…</p>;
  if (authError) return <p role="alert" dir="rtl">{authError}</p>;

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logoutUser();
      setUser(null);
    } catch {
      setLogoutError('לא ניתן להתנתק. נסו שוב.');
    }
  }

  return (
      <Router>
      <Toolbar user={user} onLogout={handleLogout} />
      {logoutError && <p role="alert" dir="rtl">{logoutError}</p>}
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={setUser} />} />
          <Route path="/children" element={<ChildrenPage />} />
          <Route exact path="/" element={<Home />} />
          <Route exact path="/ExerciseOptionsPage" element={<ExerciseOptionsPage user={user} />} />
          <Route path="/ExercisePage" element={<ExercisePage />} />
          <Route path="/GamesOptionsPage" element={<TicTacToeGame />} />
          <Route path="/HelpPage" element={<HelpPage />} />
          <Route path="/AboutPage" element={<AboutPage />} />
          <Route path="/TicTacToeGame" element={<TicTacToeGame />} />
        </Routes>
      </Router>
    // const pagesWithRamkol = [1,2,3]
    // const isPageRamkol = () => {
    //   return [1,2,3].includes(currentPage)
    // }
    // <menu></menu>
    // {isPageRamkol && (
    //   <ramkol></ramkol>
    //   )}
  );
}
