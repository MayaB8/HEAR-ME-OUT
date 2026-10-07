import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import homePageBg from './../images/pagesBg/homePageBg.png';
import homePageSquare from './../images/pagesBg/homePageSquare.png';
import gamesIcon from './../images/buttons/gamesBtn.png';
import exerciseIcon from './../images/buttons/exercisesBtn.png';
import helpIcon from './../images/buttons/helpBtn.png';
import { makeStyles } from '@mui/styles';
import { PAGES } from '../component/Toolbar';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
  },
  background: {
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundImage: `url(${homePageBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: -1,
  },
  mainMenu: {
    position: 'relative',
    width: '75%',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  backgroundSquare: {
    width: '100%',
    maxHeight: '100%',
  },
  title: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    color: '#fff',
    fontSize: 24,
  },
  iconButton: {
    gap: '7%',
    scale: '1rem',
    display: 'flex',
    position: 'absolute',
    maxHeight: '100px',
    justifyContent: 'center',
    margin: 'auto',
    bottom: '0',
    left: '0',
    right: '0',
  },
  iconButtonImage:{
    '&:hover': {
      filter: 'drop-shadow(0px 0px 16px #68859A) brightness(1.1)',
      backgroundColor: 'transparent',
    },
  }
  }));

function Home() {
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const iconButton = document.getElementById('iconButton');
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (

    <div className={classes.background} >
      <div className={classes.mainMenu}>
        <center><img className={classes.backgroundSquare} src={homePageSquare}></img></center>
        <div className={classes.iconButton} >
          <IconButton className={classes.iconButtonImage} id="iconButton" onClick={() => navigate(PAGES.helpPage.path)} >
            <img src={helpIcon} />
          </IconButton>
          <IconButton aria-label="תרגול" className={classes.iconButtonImage} id="iconButton" onClick={() => navigate(PAGES.exerciseOptionsPage.path)} >
            <img src={exerciseIcon} />
          </IconButton>
          <IconButton className={classes.iconButtonImage} id="iconButton" onClick={() => navigate(PAGES.gamesOptionsPage.path)} >
            <img src={gamesIcon} />
          </IconButton>
        </div>
      </div>
    </div >
  )
}

export default Home;
