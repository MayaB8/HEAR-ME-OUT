
// 2ND ATTEMPT
import './App.css';
import React, { useState } from 'react';
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
//import Contact from './component/Contact';

export default function App() {
  return (
      <Router>
      <Toolbar />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/ExerciseOptionsPage" element={<ExerciseOptionsPage />} />
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
