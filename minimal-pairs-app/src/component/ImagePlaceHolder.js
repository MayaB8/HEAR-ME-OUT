import { Typography, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import imgWhiteBg from './../images/buttons/imgBg.png';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '350px',
  },
  imageButton: {
    '&:hover': {
      filter: 'drop-shadow(0px 0px 16px #68859A) brightness(1.1)',
      backgroundColor: 'transparent',
    },
    position: 'relative',
  },
  imageStyle: {
    maxWidth: '230px',
    maxHeight: '230px',
    position: 'relative',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'absolute',
    bottom: -15,
  },
  text: {
    fontWeight: 'bold',
  },
}));

function ImagePlaceHolder({
  innerImage,
  textColor,
  imageText,
  handleClick,
  borderColor,
  isInExercise,
  externalImage,
}) {
  const classes = useStyles();

  return (
    <div className={classes.container} style={{ height: isInExercise ? '390px' : '260px' }}>
      <Button
        disableRipple
        className={classes.imageButton}
        onClick={handleClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '90%',
          width: '100%',
        }}
        disabled={externalImage != null}
      >
        <img
          src={ externalImage == null ? imgWhiteBg : externalImage}
          alt="Background"
          style={{
            width: isInExercise ? '100%' : '75%',
            position: 'absolute',
            filter: borderColor
              ? `drop-shadow(2px 4px 6px ${borderColor})`
              : undefined,
          }}
        />
        { externalImage == null && (
          <img
            src={innerImage}
            alt={imageText}
            data-image="1"
            className={classes.imageStyle}
          />
        )}
      </Button>

      <div className={classes.textContainer}>
          <Typography color={textColor} fontSize={isInExercise ? '50px' : '30px'} style={{ opacity: externalImage == null ? 1 : 0.8 }} className={classes.text}>
            {imageText}
          </Typography>
        </div>
    </div>
  );
}

export default ImagePlaceHolder;
