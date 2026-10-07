import React, { useState } from 'react';
import { Typography, IconButton, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageBg from './../images/pagesBg/skyAndCloudsBg.png';
import HelpBg from './../images/pagesBg/helpBgWithoutText.png';
import nextBtn from './../images/buttons/leftArrowBlueBtn.png';
import prevBtn from './../images/buttons/rightArrowBlueBtn.png';

function HelpPage() {
  const theme = useTheme();
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    <>
      <div style={{ padding: '10px', marginTop: '70px' }}>
        <Typography fontSize={'110%'}>
          מעבר בין המסכים השונים יתבצע דרך כפתור התפריט הממוקם בראש כל מסך מצד ימין.<br/>
          בכל שלב ניתן לעבור למסך אחר דרך כפתור זה.<br/><br/>
        </Typography>
      </div>
      <div style={{ padding: '40px' }}></div>
    </>,
    <>
      <div style={{ padding: '5px' }}>
        <Typography fontSize={'150%'} fontWeight="bold" color={theme.palette.darkBlue}>
          תרגול:
        </Typography>
        <Typography fontSize={'110%'}>
        על הילד לזהות ע"י שמיעה מילה אחת מבין שתי מילים, הנבדלות בתכונה אקוסטית אחת.<br/>
        </Typography>
        <div style={{ padding: '12px' }}>
          <Typography fontSize={'110%'}>
            בכניסה לעמוד יש לבחור את הגדרות התרגול הרצויות, לחיצה על כפתור החץ תציג את עמוד התרגול הנבחר.<br/>
            בכל פעם תוקרא מילה אחת משתי המילים שתמונתן תוצג על המסך.<br/>
            על הילד לבחור את התמונה הנכונה, פידבק מתאים יוצג בכל לחיצה.<br/>
            לחיצה על כפתורי החצים בתחתית העמוד תציג מילים ותמונות קודמות / חדשות על המסך.<br/>
            להשמעה חוזרת של המילה ניתן ללחוץ על הכפתור המתאים.
          </Typography>
        </div>
      </div>
      <div style={{ padding: '10.5px' }}></div>
    </>,
    // <>
    //   <div style={{ padding: '5px' }}>
    //     <Typography fontSize={'150%'} fontWeight="bold" color={theme.palette.darkBlue}>
    //       משחקים:
    //     </Typography>
    //     <Typography fontSize={'110%'}>
    //       בעמוד המשחקים, לחיצה על המשחק הרצוי תפעיל אותו בעמוד חדש.
    //     </Typography>
    //   </div>
    //   <div style={{ padding: '88.5px' }}></div>
    // </>,
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
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '500px',
        margin: '0 auto',
        padding: '20px',
        backgroundImage: `url(${HelpBg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -1,
        textAlign: 'center',
      }}>
          <div className="board-container" style={{
            padding: '20px',
            maxHeight: '400px',
          }}>
            <Typography fontSize={'400%'} fontWeight="bold" color={theme.palette.darkBlue}>
              עזרה
            </Typography>
            {sections[currentSection]}
            <div style={{ display: 'flex',
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

export default HelpPage;
