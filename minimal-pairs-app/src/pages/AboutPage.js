import React, { useState } from 'react';
import { Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageBg from './../images/pagesBg/skyAndCloudsBg.png';
import AboutBg from './../images/pagesBg/aboutPageSquar.png';
import nextBtn from './../images/buttons/leftArrowBlueBtn.png';
import prevBtn from './../images/buttons/rightArrowBlueBtn.png';

function AboutPage() {
  const theme = useTheme();
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    <>
      <div style={{ padding: '10px', marginTop: '70px' }}>
        <Typography fontSize={'110%'}>
          אנחנו - עמית ארליך, מיה בן שטח ויובל הוכמן, סטודנטיות בשנה שלישית למדעי המחשב<br />
          באקדמית ת"א-יפו, שמחות לשתף באפליקציה המיוחדת שבנינו.<br /><br />
        </Typography>
        <div style={{ padding: '12px' }}>
          <Typography fontSize={'110%'}>
          בהנחייתה של ברטי בן ישי, קלינאית תקשורת במיח"א וב"שמע" חיפה.<br />
          </Typography>
        </div>
      </div>
      <div style={{ padding: '40px' }}></div>
    </>,
    <>
      <div style={{ padding: '5px' }}>
        <Typography fontSize={'150%'} fontWeight="bold" color={theme.palette.darkBlue}>
          הרעיון שהביא לחיים את האפליקציה
        </Typography>
        <Typography fontSize={'110%'}>
          מדובר בכלי המטרתו לסייע לקלינאי תקשורת באימוני שמיעה מיוחדים,<br />
          מותאמים לילדים בגילאי 5 עד 7, שעברו השתלת שתל השבלול עקב חירשות או לקות שמיעה חמורה. למושתל שבלול יש צורך באימוני שמיעה בכדי לרכוש את היכולת להבחין בין חלקי המילה ע"י שמיעה וזאת כדי שיוכל לקלוט, ללמוד ולהבין את השפה ואת משמעות המילים.
        </Typography>
      </div>
      <div style={{ padding: '49px' }}></div>
    </>,
    <>
      <div style={{ padding: '5px' }}>
        <Typography fontSize={'150%'} fontWeight="bold" color={theme.palette.darkBlue}>
          משימתנו: שדרוג אימוני שמיעה בעזרת כלי טכנולוגי
        </Typography>
        <Typography fontSize={'110%'}>
          יצרנו פתרון טכנולוגי לאימון ההבחנה של הילדים בין חלקי המילה באמצעות השמיעה.<br />
        </Typography>
        <div style={{ padding: '12px' }}>
          <Typography fontSize={'110%'}>
            האפליקציה כוללת תרגולים אטרקטיביים כאשר כל אחד מוגדר לפי סוג תרגול, קוליות, רשימת הגיים וקול הקראה. על הילדים לזהות מילה אחת מתוך שתיים שנבדלות בתכונה אקוסטית אחת. נוסף לכך, האפליקציה כוללת משחקי חיזוק על מנת למשוך את הילדים להמשיך לתרגל ולתגמל
            אותם על הלמידה.
          </Typography>
        </div>
      </div>
      <div style={{ padding: '23.5px' }}></div>
    </>,
    <>
      <div style={{ padding: '5px' }}>
        <Typography fontSize={'150%'} fontWeight="bold" color={theme.palette.darkBlue}>
          הפרויקט שנוצר משיתוף פעולה מיוחד
        </Typography>
        <Typography fontSize={'110%'}>
          תודה ללילך שדה, לילך פאר ולכל קלינאי התקשורת שענו על כל שאלה והכווינו במהלך הפיתוח.
        </Typography>
        <Typography fontSize={'110%'}>
          תודה לגיא דוד וקרן אור שץ שתרמו את קולם והפיחו חיים באפליקציה.
        </Typography>
        <div style={{ padding: '12px' }}>
          <Typography fontSize={'110%'}>
            תודה לכולם על הנתינה הרבה, הזמן והמאמץ שהושקע על הפרויקט.
          </Typography>
        </div>
      </div>
      <div style={{ padding: '37px' }}></div>
    </>,
    <>
      <div style={{ padding: '10px', marginTop: '70px' }}>
        <Typography fontSize={'110%'}>
          אנו גאות להציע את האפליקציה שלנו ככלי ייחודי, מתקדם וטכנולוגי לקלינאי תקשורת והילדים. אנו מתרגשות לחשוף את המוצר לעולם ומזמינות אתכם להיות חלק מהחוויה של אימון שמיעתי משודרג!
          <br /><br />
        </Typography>
      </div>
      <div style={{ padding: '40px' }}></div>
    </>,
  ];

  const goToNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <div className="App" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      position: 'absolute',
      width: '100%',
      backgroundImage: `url(${PageBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      zIndex: -1,
      direction: 'rtl',
    }}>
      <div className="board-container" style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '90%', // Adjust the width of the container
        maxWidth: '1000px', // Set a maximum width
        maxHeight: '500px',
        margin: '0 auto', // Center horizontally
        padding: '20px',
        backgroundImage: `url(${AboutBg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1,
        textAlign: 'center', // Center align the text
      }}>
        <div className="board-container" style={{
          padding: '20px',
          maxHeight: '400px',
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          <Typography fontSize={'400%'} fontWeight="bold" color={theme.palette.darkBlue}>
            אודות
          </Typography>
          {sections[currentSection]}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '80px',
            position: 'relative',
            left: 0,
            right: 0,
          }}>
            <IconButton onClick={goToPreviousSection}
              disabled={currentSection === 0}
              style={{
                opacity: currentSection === 0 ? 0.5 : 1,
                pointerEvents: currentSection === 0 ? 'none' : 'auto',
              }}>
              <img src={prevBtn} style={{ width: '100%', height: '100%' }} alt="Previous" />
            </IconButton>
            <IconButton onClick={goToNextSection}
              disabled={currentSection === sections.length - 1}
              style={{
                opacity: currentSection === sections.length - 1 ? 0.5 : 1,
                pointerEvents: currentSection === sections.length - 1 ? 'none' : 'auto',
              }}>
              <img src={nextBtn} style={{ width: '100%', height: '100%' }} alt="Next" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
