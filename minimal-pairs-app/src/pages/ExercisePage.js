import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from "react-router-dom";
import { Typography, IconButton, Grid, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import replaySound from './../images/buttons/replaySoundBtn.png';
import exercisePage from './../images/pagesBg/exercisePageWithoutText.png';
import nextBtn from './../images/buttons/leftArrowBlueBtn.png';
import prevBtn from './../images/buttons/rightArrowBlueBtn.png';
import returnSettingsBtn from './../images/buttons/leftArrowBtn.png';
import ImagePlaceHolder from '../component/ImagePlaceHolder';
import Confetti from 'react-confetti';
import { randomReaction } from '../component/utils/Reaction';
import { useNavigate } from 'react-router-dom';
import { getMinimalPairs } from '../minimalPairsApi';
import ExerciseSummaryDialog, { ExerciseSavedDialog } from '../component/ExerciseSummaryDialog';

function playAudio(voice) {
  if (!voice) return;
  const audio = new Audio(voice);
  audio.play().catch(() => {});
}

export default function ExercisePage() {
  const location = useLocation();
  const theme = useTheme();
  const [words, setWords] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState(null);
  const [voice, setVoice] = useState(null);
  const [borderColorImg, setBorderColorImg] = useState([null, null]);
  const [imgSelected, setImgSelected] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [completedPairs, setCompletedPairs] = useState(new Set());
  const [mistakenPairs, setMistakenPairs] = useState(new Set());
  const [summary, setSummary] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const exerciseCompleted = useRef(false);
  const loadedSettings = useRef(null);
  const retryTimeout = useRef(null);
  useEffect(() => () => clearTimeout(retryTimeout.current), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setImages(null);
    setWords(null);
    setCurrentIndex(0);
    clearTimeout(retryTimeout.current);
    setImgSelected(null);
    setBorderColorImg([null, null]);
    setConfetti(false);
    setPairs([]);
    setCompletedPairs(new Set());
    setMistakenPairs(new Set());
    setSummary(null);
    setSummaryOpen(false);
    setSaveSuccessOpen(false);
    exerciseCompleted.current = false;
    loadedSettings.current = null;
    const getFromDB = async () => {
      try {
        if (!location.state?.category) throw new Error('בחרו הגדרות תרגול לפני תחילת התרגול.');
        const { category, placeInWord, letters } = location.state;
        const pairs = await getMinimalPairs(category, letters, placeInWord);
        if (!pairs) throw new Error('לא ניתן לטעון את התרגול מהשרת. נסו שוב מאוחר יותר.');
        if (!controller.signal.aborted) {
          loadedSettings.current = location.state;
          setPairs(pairs);
          setWords(pairs.map(pair => pair.words));
          setVoice(location.state.voice);
        }
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    getFromDB();
    return () => controller.abort();
  }, [location.state]);

  const openExerciseSummary = useCallback(() => {
    if (loadedSettings.current !== location.state || !pairs.length) return;
    setSummary({
      isCompleted: completedPairs.size === pairs.length,
      childId: location.state?.childId ?? null,
      childName: location.state?.childName ?? null,
      exerciseType: location.state?.category,
      soundPair: location.state?.letters,
      positionInWord: location.state?.placeInWord,
      voice: location.state?.voice,
      totalPairs: pairs.length,
      pairsWithMistakes: mistakenPairs.size,
      pairsWithoutMistakes: [...completedPairs].filter(index => !mistakenPairs.has(index)).length,
      incompletePairs: pairs.length - completedPairs.size,
      mistakenPairs: pairs.flatMap((pair, index) => mistakenPairs.has(index)
        ? [{ id: pair.id, words: pair.words.map(word => word.text) }] : []),
    });
    setSummaryOpen(true);
  }, [completedPairs, mistakenPairs, pairs, location.state]);

  useEffect(() => {
    if (loadedSettings.current !== location.state || !pairs.length || completedPairs.size !== pairs.length || exerciseCompleted.current) return;
    exerciseCompleted.current = true;
    clearTimeout(retryTimeout.current);
    openExerciseSummary();
  }, [completedPairs, pairs, openExerciseSummary, location.state]);

  useEffect(() => {
    const getImageData = () => {
      const imagesData = words.map((w) => {
        const primaryId = Math.round(Math.random());
        return {
          image0: {
            id: 0, src: w[0].imageUrl, description: w[0].text
          },
          image1: {
            id: 1, src: w[1].imageUrl, description: w[1].text
          },
          primaryImg: {
            primaryId,
            ManVoice: w[primaryId].maleAudioUrl,
            WomanVoice: w[primaryId].femaleAudioUrl,
          }
        }
      });
      setImages(imagesData);
    }
    if (words) {
      getImageData();
    }
  }, [words]);

  useEffect(() => {
    const firstWord = images?.[0]?.primaryImg;
    if (!firstWord || !voice) return;
    playAudio(voice === 'גבר' ? firstWord.ManVoice : firstWord.WomanVoice);
  }, [images, voice]);

  useEffect(() => {
    if (!confetti) return;
    const timeout = setTimeout(() => {
      setConfetti(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [confetti]);

  function handleImageClick(id) {
    if (!images?.[currentIndex] || exerciseCompleted.current) return;
    if (imgSelected === null) {
      if (id === images[currentIndex].primaryImg.primaryId) {
        setCompletedPairs(current => new Set(current).add(currentIndex));
        setImgSelected(true);
        setBorderColorImg((colors) => {
          colors[id] = "green";
          return [...colors];
        })
        console.log("voice to send: " + voice);
        playAudio(randomReaction(true, voice)); ///!!!!!!!!!!!!
        setConfetti(true);
        console.log('Good job!');
      } else {
        setMistakenPairs(current => new Set(current).add(currentIndex));
        setImgSelected(false);
        setBorderColorImg((colors) => {
          colors[id] = "red";
          return [...colors];
        })
        retryTimeout.current = setTimeout(() => {
          setImgSelected(null);
          setBorderColorImg((colors) => {
            colors[id] = "";
            return [...colors];
          })
        }, 2000);
        playAudio(randomReaction(false, voice)); //!!!!!!!!
        console.log('Try again');

      }
    }
  };

  const handleListenClick = () => {
    playAudio(voice === 'גבר' ? images?.[currentIndex]?.primaryImg.ManVoice : images?.[currentIndex]?.primaryImg.WomanVoice);
  };

  const handleNextClick = () => {
    if (images?.length && currentIndex < images.length - 1) {
      clearTimeout(retryTimeout.current);
      setImgSelected(null);
      setBorderColorImg([null, null]);
      setCurrentIndex((i) => i + 1);
      playAudio(voice === 'גבר' ? images[currentIndex + 1]?.primaryImg.ManVoice : images[currentIndex + 1]?.primaryImg.WomanVoice);
    }
    //end of words
  };
  const handlePreviousClick = () => {
    if (currentIndex !== 0) {
      clearTimeout(retryTimeout.current);
      setImgSelected(null);
      setBorderColorImg([null, null]);
      setCurrentIndex((i) => i - 1);
      playAudio(voice === 'גבר' ? images[currentIndex - 1]?.primaryImg.ManVoice : images[currentIndex - 1]?.primaryImg.WomanVoice);
    }
  };

  const navigate = useNavigate();
  const navigateBackToSetting = () => {
    navigate("/ExerciseOptionsPage");
  };

  const handleSummarySave = () => {
    if (!summary?.isCompleted || summary.childId == null) return;
    console.log('Exercise summary (not persisted):', summary);
    setSummaryOpen(false);
    setSaveSuccessOpen(true);
  };

  return (
    <div className="App" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      position: 'absolute',
      width: '100%',
      backgroundImage: `url(${exercisePage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      zIndex: -1,
      direction: 'rtl',
    }}>
      {confetti && <Confetti tweenDuration={10000} gravity={0.45} />}
      <div className="board-container" style={{
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '1000px',
        maxHeight: '700px',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center',
      }}>
        <Typography fontSize={'350%'} color={theme.palette.darkBlue}>
          הקשיבו ובחרו את התמונה הנכונה
        </Typography>
        {(loading || error || !images?.length) && (
          <div>
            <Typography role={error ? 'alert' : 'status'}>
              {error || (loading || images === null ? 'טוען תרגול…' : 'לא נמצאו זוגות מתאימים להגדרות שבחרתם.')}
            </Typography>
            {!loading && (error || images?.length === 0) && (
              <Button onClick={navigateBackToSetting}>חזרה להגדרות</Button>
            )}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', height: '50%', width: '100%' }}>
          {images?.length > 0 && (
            <>
              <ImagePlaceHolder
                innerImage={images[currentIndex]?.image0?.src}
                textColor={theme.palette.yellow}
                imageText={images[currentIndex]?.image0?.description}
                handleClick={() => handleImageClick(images[currentIndex]?.image0.id)}
                borderColor={borderColorImg[0]}
                isInExercise={true}
              />
              <ImagePlaceHolder
                innerImage={images[currentIndex]?.image1?.src}
                textColor={theme.palette.yellow}
                imageText={images[currentIndex]?.image1?.description}
                handleClick={() => handleImageClick(images[currentIndex]?.image1.id)}
                borderColor={borderColorImg[1]}
                isInExercise={true}
              />
            </>
          )}
        </div>
        <Grid container justifyContent='center' style={{ textAlign: 'center', marginTop: '40px' }}>
          <Grid item xs={4}>
            <IconButton aria-label="הקודם" disabled={currentIndex === 0} onClick={handlePreviousClick} style={{
              left: '130px',
              opacity: currentIndex === 0 ? 0.5 : 1,
              pointerEvents: currentIndex === 0 ? 'none' : 'auto',
            }}>
              <img src={prevBtn} alt="" style={{ width: '100%', height: '100%' }} />
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <IconButton aria-label="השמעה חוזרת" disabled={!images?.length} onClick={handleListenClick}>
              <img src={replaySound} alt="" style={{ width: '100%', height: '100%' }} />
            </IconButton>
          </Grid>
          { currentIndex === images?.length - 1 ?
            (<Grid item xs={4}>
              <IconButton aria-label="סיכום התרגול" onClick={openExerciseSummary} style={{ right: '130px' }}>
                <img src={returnSettingsBtn} alt="" style={{ width: '80px', height: '100%' }} />
              </IconButton>
            </Grid>) :
            (<Grid item xs={4}>
              <IconButton aria-label="הבא" disabled={!images?.length} onClick={handleNextClick} style={{ right: '130px' }}>
                <img src={nextBtn} alt="" style={{ width: '100%', height: '100%' }} />
              </IconButton>
            </Grid>)
          }
        </Grid>
      </div>
      <ExerciseSummaryDialog open={summaryOpen} summary={summary}
        onClose={() => setSummaryOpen(false)} onSave={handleSummarySave} />
      <ExerciseSavedDialog open={saveSuccessOpen}
        onClose={() => setSaveSuccessOpen(false)}
        onHome={() => navigate('/')} />
    </div>
  );
}
