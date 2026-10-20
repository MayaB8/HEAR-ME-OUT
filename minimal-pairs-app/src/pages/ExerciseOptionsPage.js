import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import PersonRounded from '@mui/icons-material/PersonRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import leftArrowBtn from '../images/buttons/leftArrowBtn.png';
import { makeStyles } from '@mui/styles';
import { SettingDropDown } from '../component/SettingDropDown';
import PageBg from './../images/pagesBg/skyAndCloudsBg.png';
import InfoDialog from '../component/InfoDialog';
import { manWomanOptions, options, placeInWordOp, voiceOptions } from '../component/utils/options';
import { getChildren } from '../usersApi';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100dvh',
      padding: '84px 16px 12px',
      boxSizing: 'border-box',
      backgroundImage: `url(${PageBg})`,
      backgroundSize: 'cover',
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 720px) minmax(240px, 1fr)',
      gap: 'clamp(32px, 5vw, 90px)',
      alignItems: 'center',
      width: '100%',
      maxWidth: 1200,
      '@media (max-width: 900px)': { gridTemplateColumns: 'minmax(0, 720px)', justifyContent: 'center', gap: 8 },
    },
    title: {
      textAlign: 'center',
      fontSize: 'clamp(48px, 10dvh, 96px)',
      fontWeight: 'bold',
      lineHeight: 1.1,
      color: theme.palette.darkBlue,
      '& span': { display: 'block', color: theme.palette.redOrange },
      '@media (max-width: 900px)': { order: -1, fontSize: 'clamp(26px, 4.5dvh, 36px)', '& span': { display: 'inline', marginInlineStart: 10 } },
    },
    container: {
      width: '100%',
      maxWidth: 720,
      backgroundColor: theme.palette.white,
      borderRadius: 36,
      padding: 'clamp(10px, 2dvh, 20px)',
      boxSizing: 'border-box',
      color: theme.palette.darkBlue,
    },
    field: {
      minWidth: 0,
      '& > .MuiTypography-root': { fontSize: 'clamp(17px, 2.7dvh, 22px)', lineHeight: 1.2, paddingTop: 0, marginBottom: 2, color: theme.palette.darkBlue },
      '& .MuiFormControl-root': { width: '100%' },
      '& .MuiInputBase-root': { width: '100% !important', fontSize: '18px !important' },
      '& .MuiSelect-select': { paddingTop: 'clamp(5px, 1dvh, 9px)', paddingBottom: 'clamp(5px, 1dvh, 9px)' },
    },
    childSection: {
      padding: 'clamp(8px, 1.5dvh, 14px) 16px',
      marginBottom: 'clamp(6px, 1.5dvh, 12px)',
      borderRadius: 24,
      backgroundColor: alpha(theme.palette.redOrange, .08),
      '& .MuiInputBase-root': { backgroundColor: `${theme.palette.white} !important`, color: `${theme.palette.darkBlue} !important`, border: `1px solid ${theme.palette.green}` },
      '& .MuiSelect-icon': { color: `${theme.palette.green} !important` },
    },
    settingsSection: {
      padding: 'clamp(8px, 1.5dvh, 14px) 16px',
      borderRadius: 24,
      backgroundColor: alpha(theme.palette.lightBlue, .35),
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      color: theme.palette.redOrange,
      fontSize: 'clamp(20px, 3dvh, 26px)',
      lineHeight: 1.2,
      fontWeight: 'bold',
      marginBottom: 'clamp(4px, 1dvh, 10px)',
      '& svg': { fontSize: 24 },
    },
    settings: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 'clamp(6px, 1.5dvh, 12px) 16px',
      '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
    },
  }));


function ExerciseOptionsPage({ user = null }) {
    const classes = useStyles();
    const theme = useTheme();
    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [childrenLoading, setChildrenLoading] = useState(true);
    const [childrenError, setChildrenError] = useState(null);

    useEffect(() => {
        let active = true;
        setSelectedChildId(null);
        setChildren([]);
        setChildrenError(null);
        if (!user) return;
        setChildrenLoading(true);
        getChildren()
            .then(loadedChildren => { if (active) setChildren(loadedChildren); })
            .catch(() => { if (active) setChildrenError('לא ניתן לטעון את רשימת הילדים.'); })
            .finally(() => { if (active) setChildrenLoading(false); });
        return () => { active = false; };
    }, [user]);

    const childOptions = [
        { value: null, label: 'ללא בחירת ילד' },
        ...children.map(child => ({
            value: child.id,
            label: `${child.first_name}${child.last_name ? ` ${child.last_name}` : ''} — ${child.child_code}`,
        })),
    ];

    //---------------NAVIGATE-------------------
    const navigate = useNavigate();
    const navigateExercise = () => {
        navigate('/ExercisePage', {
            state: {
                category: category.value,
                letters: letters.label,
                placeInWord: placeInWord.value,
                voice: voice.label,
                ...(user ? { childId: selectedChildId } : {}),
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
    <main className={classes.root} dir="rtl" lang="he">
      <div className={classes.layout}>
      <div className={classes.container}>
          {user && <section className={classes.childSection} aria-labelledby="exercise-child-title">
            <Typography component="h2" id="exercise-child-title" className={classes.sectionTitle}><PersonRounded aria-hidden="true" />עבור מי התרגול?</Typography>
            <div className={classes.field}>
            {childrenLoading ? <Typography role="status">טוען ילדים…</Typography> : childrenError ? (
              <Typography role="alert" color={theme.palette.darkBlue}>{childrenError}</Typography>
            ) : children.length === 0 ? (
              <Typography color={theme.palette.darkBlue}>
                עדיין אין ילדים ברשימה שלך.
                <Button onClick={() => navigate('/children')} sx={{ color: theme.palette.green, borderRadius: '50px' }}>ניהול ילדים</Button>
              </Typography>
            ) : (
              <SettingDropDown title="בחירת ילד" options={childOptions}
                value={childOptions.find(option => option.value === selectedChildId) || childOptions[0]}
                updateState={option => setSelectedChildId(option.value)} />
            )}
            </div>
          </section>}
          <section className={classes.settingsSection} aria-labelledby="exercise-settings-title">
          <Typography component="h2" id="exercise-settings-title" className={classes.sectionTitle}><SettingsRounded aria-hidden="true" />הגדרות התרגול</Typography>
          <div id="select" className={classes.settings}>
          <div className={classes.field}>
          <SettingDropDown
            title={<><InfoDialog />סוג תרגול</>}
            value={category}
            options={options}
            updateState={handleChangeCategory}
          />
          </div>
          <div className={classes.field}>
          <SettingDropDown
            title="זוג צלילים"
            options={category.letterOptions}
            value={letters}
            updateState={handleChangelLetters}
            includeEngSounds={true}
          />
          </div>
          <div className={classes.field}>
          <SettingDropDown
            title="מיקום במילה"
            options={letters.placeInWordOptions}
            value={placeInWord}
            updateState={setPlaceInWord}
          />
          </div>
          <div className={classes.field}>
          <SettingDropDown
            title="קול"
            value={voice}
            options={manWomanOptions}
            updateState={setVoice}
          />
          </div>
          </div>
          </section>
      </div>
      <div className={classes.title}>
        <Typography component="h1" sx={{ font: 'inherit' }}>התחלת<span>תרגול</span></Typography>
        <IconButton aria-label="התחלת תרגול" onClick={navigateExercise}>
          <img src={leftArrowBtn} alt="" width="64" height="64" />
        </IconButton>
      </div>
      </div>
    </main>
  );
}

export default ExerciseOptionsPage;
