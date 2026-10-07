import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { SettingDropDown } from '../component/SettingDropDown';
import optionsWhiteBg from './../images/pagesBg/exerciseSettingsWhiteRectangle.png';
import PageBg from './../images/pagesBg/skyAndCloudsBg.png';
import leftArrowBtn from './../images/buttons/leftArrowBtn.png';
import InfoDialog from '../component/InfoDialog';
import { manWomanOptions, options, placeInWordOp, voiceOptions } from '../component/utils/options';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundImage: `url(${PageBg})`,
      backgroundSize: 'cover',
    },
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '180px',
      position: 'relative',
    },
    select: {
        margin: '0 auto',
        padding: '20px',
        background: `url(${optionsWhiteBg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        textAlign: 'center',
    },
    iconButton: {
      textAlign: 'center',
      '& img': {
        width: '80px',
      },
    },
  }));


function ExerciseOptionsPage() {
    const classes = useStyles();
    const theme = useTheme();

    //---------------NAVIGATE-------------------
    const navigate = useNavigate();
    const navigateExercise = () => {
        navigate('/ExercisePage', {
            state: {
                category: category.value,
                letters: letters.label,
                placeInWord: placeInWord.value,
                voice: voice.label
            }
        });
    };

    //---------------HANDLERS-------------------
    const [category, setCategory] = useState(options[0]);
    const [letters, setLetteres] = useState(options[0].letterOptions[0]);
    const [placeInWord, setPlaceInWord] = useState(placeInWordOp.all);
    const [voice, setVoice] = useState(voiceOptions.man);

    const handleChangeCategory = (value) => {
        setCategory(value);
        setLetteres(value.letterOptions[0]);
        setPlaceInWord(placeInWordOp.all);
    };

    const handleChangelLetters = (value) => {
        setLetteres(value);
        setPlaceInWord(placeInWordOp.all);
    };

    return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.iconButton}>
          <Typography fontSize={'600%'} fontWeight="bold" color={theme.palette.darkBlue}>
            התחלת
          </Typography>
          <Typography style={{ marginTop: '-15%' }} fontSize={'600%'} fontWeight="bold" color={theme.palette.redOrange}>
            תרגול
          </Typography>
          <div className={classes.iconButton} style={{ marginTop: '8%' }}>
            <IconButton color="inherit" onClick={navigateExercise}>
              <img src={leftArrowBtn} alt='leftArrowBtn'></img>
            </IconButton>
          </div>
        </div>
        <div id="select" className={classes.select}>
          <SettingDropDown
            title={<><InfoDialog />סוג תרגול</>}
            value={category}
            options={options}
            updateState={handleChangeCategory}
          />
          <SettingDropDown
            title="זוג צלילים"
            options={category.letterOptions}
            value={letters}
            updateState={handleChangelLetters}
            includeEngSounds={true}
          />
          <SettingDropDown
            title="מיקום במילה"
            options={letters.placeInWordOptions}
            value={placeInWord}
            updateState={setPlaceInWord}
          />
          <SettingDropDown
            title="קול"
            value={voice}
            options={manWomanOptions}
            updateState={setVoice}
          />
        </div>
      </div>
    </div>
  );
}

export default ExerciseOptionsPage;
