import * as React from 'react';
import { styled, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, } from '@mui/material'
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import theme from '../theme';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function BootstrapDialogTitle(props) {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        left: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
}

BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
};

export function InfoDialog() {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div style={{ display: 'inline' }}>
            <InfoIcon style={{ color: theme.palette.darkBlue, cursor: 'pointer' }} onClick={handleClickOpen} />
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose} style={{ textAlign: 'right' }}>
                    בחירת  תרגול
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom style={{ textAlign: 'right' }}>
                        ראשית יש לבחור את סוג התרגול <br />
                        .לאחר מכן את זוג הצלילים שרוצים לעבוד עליהם<br />
                    </Typography>
                    <Typography gutterBottom style={{ textAlign: 'right' }}>
                        .ניתן לבחור מיקום במילה עליה רוצים לעבוד, או לתרגל את כל המילים בזוג האותיות הנבחר
                    </Typography>
                    <Typography gutterBottom style={{ textAlign: 'right' }}>
                        .ניתן לבחור את הקול בו יושמעו המילים
                    </Typography>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'flex-start' }}>
                    <Button autoFocus onClick={handleClose} style={{ fontSize: 'x-large', textAlign: 'left' }}>
                        אישור
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
};

export default InfoDialog;
