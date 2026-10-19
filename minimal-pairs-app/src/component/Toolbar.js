import { Button, IconButton, Menu, MenuItem as MuiMenuItem, Toolbar as MuiToolbar } from "@mui/material";
import PersonRounded from '@mui/icons-material/PersonRounded';
import ArrowDropDownRounded from '@mui/icons-material/ArrowDropDownRounded';
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
        zIndex: 10,
    },
    accountButton: {
        margin: '20px auto 20px 24px !important',
        padding: '8px 24px !important',
        borderRadius: '40px !important',
        backgroundColor: '#fff !important',
        color: '#1C4755 !important',
        fontSize: '24px !important',
        fontWeight: 'bold !important',
        textTransform: 'none !important',
        gap: '12px',
        maxWidth: 'calc(100% - 120px)',
        '& .account-name': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        '& svg': { fontSize: '32px', flexShrink: 0 },
        '@media (max-width: 600px)': {
            margin: '12px auto 12px 12px !important',
            padding: '6px 16px !important',
            fontSize: '20px !important',
        },
    },
}));

export const PAGES = {
    login: { path: '/login', label: 'התחברות' },
    home: { path: '/', label: 'ראשי' },
    exerciseOptionsPage: { path: '/ExerciseOptionsPage', label: 'תרגול' },
    exercisePage: { path: '/ExercisePage' },
    gamesOptionsPage: { path: '/GamesOptionsPage', label: 'משחק' },
    helpPage: { path: '/HelpPage', label: 'עזרה' },
    aboutPage: { path: '/AboutPage', label: 'אודות' },
};

const Toolbar = ({ user = null, onLogout }) => {
const navigate = useNavigate();
const [accountAnchorEl, setAccountAnchorEl] = useState(null);
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
            <Button className={classes.accountButton}
                aria-haspopup={user ? 'menu' : undefined}
                aria-expanded={user ? Boolean(accountAnchorEl) : undefined}
                aria-controls={accountAnchorEl ? 'account-menu' : undefined}
                onClick={event => user ? setAccountAnchorEl(event.currentTarget) : navigate(PAGES.login.path)}>
                <PersonRounded aria-hidden="true" />
                <span className="account-name" dir="auto">{user ? user.username : 'התחברות'}</span>
                {user && <ArrowDropDownRounded aria-hidden="true" />}
            </Button>
            <Menu id="account-menu" anchorEl={accountAnchorEl} open={Boolean(accountAnchorEl)}
                onClose={() => setAccountAnchorEl(null)}
                PaperProps={{ dir: 'rtl', sx: { borderRadius: '20px', minWidth: 200, color: '#1C4755' } }}>
                <MuiMenuItem disabled>הצג פרופיל (בקרוב)</MuiMenuItem>
                <MuiMenuItem onClick={() => { setAccountAnchorEl(null); onLogout(); }}>התנתקות</MuiMenuItem>
            </Menu>
            <IconButton aria-label="תפריט" color="inherit" onClick={handleMenuClick}>
                <img src={MenuIcon} alt="" />
            </IconButton>
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem page={PAGES.login} />
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
