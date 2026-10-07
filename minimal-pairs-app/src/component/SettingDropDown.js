import { MenuItem, Select, FormControl, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
    inputLabel: {
        width: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        transformOrigin: 'top right',
        color: '#fff',
    },
    typography: {
        fontSize: 'xx-large', fontWeight: 'bold', color: 'coral',
        alignItems: 'flex-end', justifyContent: 'flex-end',
        paddingTop: '20px',
    },
}));

export const SettingDropDown = ({ title, options, updateState, value, includeEngSounds }) => {
    const classes = useStyles();
    const theme = useTheme();
    const handleChoice = (choice) => {
        updateState(choice);
    };

    return (
        <>
            <Typography component="div" className={classes.typography} >{title}</Typography>
            <FormControl >
                <Select
                    value={value}
                    sx={{
                        boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 }, "& .MuiSvgIcon-root": {
                            right: "unset",
                            left: "7px",
                        }
                    }}

                    IconComponent={(props) => (
                        <ArrowDropDownIcon {...props} style={{ fontSize: '50px', color: theme.palette.white }} />
                    )}
                    style={{
                        backgroundColor: theme.palette.green,
                        color: theme.palette.white,
                        width: '301px',
                        borderRadius: '50px',
                        fontSize: 'larger'
                    }}
                >
                    {options.map((option) => <MenuItem key={option.label} style={{ justifyContent: 'center' }} value={option}
                        onClick={() => handleChoice(option)}>{includeEngSounds ? `${option.label} ${option.sounds}` : option.label}</MenuItem>)}

                </Select>
            </FormControl>
        </>
    );
};

export default SettingDropDown;
