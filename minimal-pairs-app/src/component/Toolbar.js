import { IconButton, Menu, MenuItem as MuiMenuItem, Toolbar as MuiToolbar } from "@mui/material";
import { makeStyles } from "@mui/styles"
import { useNavigate, useLocation } from "react-router-dom";
import MenuIcon from './../images/buttons/menuBlueBtn.png';
import { useState } from "react";

const useStyles = makeStyles(() => ({
    toolbar: {
        justifyContent: 'flex-end',
        position: 'absolute !important',
        width: '100%',
        padding: '0 !important',
    },
}));

export const PAGES = {
    home: { path: '/', label: 'ראשי' },
    exerciseOptionsPage: { path: '/ExerciseOptionsPage', label: 'תרגול' },
    exercisePage: { path: '/ExercisePage' },
    gamesOptionsPage: { path: '/GamesOptionsPage', label: 'משחק' },
    helpPage: { path: '/HelpPage', label: 'עזרה' },
    aboutPage: { path: '/AboutPage', label: 'אודות' },
};

const Toolbar = () => {
const MenuItem = ({ page }) => {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <MuiMenuItem disabled={location.pathname === page.path} onClick={() => {navigate(page.path); handleMenuClose();}}
             style={{ justifyContent: 'center' }}>{page.label}</MuiMenuItem>
    );
};

    const classes = useStyles();
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);

    const handleMenuClick = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    return (
        <MuiToolbar className={classes.toolbar} variant="dense">
            <IconButton aria-label="תפריט" color="inherit" onClick={handleMenuClick}>
                <img src={MenuIcon} alt="" />
            </IconButton>
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem page={PAGES.home} />
                <MenuItem page={PAGES.exerciseOptionsPage} />
                <MenuItem page={PAGES.gamesOptionsPage} />
                <MenuItem page={PAGES.helpPage} />
                <MenuItem page={PAGES.aboutPage} />
            </Menu>
        </MuiToolbar>
    );
};

export default Toolbar;
