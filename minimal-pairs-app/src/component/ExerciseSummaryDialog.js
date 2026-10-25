import React from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Button, Dialog, Typography } from '@mui/material';
import '../pages/LoginPage.css';

const positions = { start: 'תחילת מילה', middle: 'אמצע מילה', end: 'סוף מילה' };

export default function ExerciseSummaryDialog({ open, summary, onClose, onSave }) {
  if (!summary) return null;
  const linkedToChild = summary.childId !== null && summary.childId !== undefined;
  const canSave = summary.isCompleted && linkedToChild;
  const details = [
    ...(linkedToChild ? [['שם הילד', summary.childName || `ילד מספר ${summary.childId}`]] : []),
    ['סוג תרגול', summary.exerciseType],
    ['זוג צלילים', summary.soundPair],
    ['מיקום במילה', positions[summary.positionInWord] || summary.positionInWord],
    ['קול', summary.voice],
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      aria-labelledby="exercise-summary-title" aria-describedby="exercise-summary-description"
      BackdropProps={{ className: 'auth-backdrop' }}
      PaperProps={{ className: 'auth-dialog', dir: 'rtl', lang: 'he', sx: {
        '&.auth-dialog': { boxSizing: 'border-box', width: 'calc(100% - 32px)', maxWidth: 560, margin: '16px', padding: 'clamp(40px, 7dvh, 48px) 24px clamp(12px, 2dvh, 24px)', textAlign: 'right', maxHeight: 'calc(100dvh - 32px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.4dvh, 12px)' },
        '&.auth-dialog h2': { textAlign: 'right', fontSize: 'clamp(24px, 4.5dvh, 32px)', lineHeight: 1.2, margin: 0, flexShrink: 0, color: theme => theme.palette.redOrange },
        '& .auth-close': { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, width: 34, height: 34, font: '26px/1 Arial', top: 12, left: 12 },
      } }}>
      <button type="button" className="auth-close" aria-label="סגירת סיכום התרגול" onClick={onClose}>×</button>
      <h2 id="exercise-summary-title">{summary.isCompleted ? 'התרגול הסתיים!' : 'סיכום ביניים'}</h2>
      <Typography id="exercise-summary-description" sx={{ flexShrink: 0, lineHeight: 1.3 }}>
        {!summary.isCompleted ? 'אפשר לסגור את הסיכום ולהמשיך בתרגול.' : canSave ? 'לשמור את התרגול בהיסטוריה של הילד?' : 'כל הכבוד! הנה סיכום התרגול שלכם.'}
      </Typography>

      <Box sx={{ minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.4dvh, 12px)' }}>
      <Box component="dl" sx={{ m: 0, p: 'clamp(8px, 1.5dvh, 16px)', bgcolor: theme => alpha(theme.palette.lightBlue, .4), borderRadius: '20px', display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '4px 20px', lineHeight: 1.3 }}>
        {details.map(([label, value]) => <React.Fragment key={label}>
          <Box component="dt" sx={{ fontWeight: 'bold' }}>{label}</Box>
          <Box component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }}>{value || 'הכל'}</Box>
        </React.Fragment>)}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
        {[
          ['סה״כ זוגות', summary.totalPairs, 'darkBlue', 'lightBlue'],
          ['זוגות ללא טעויות', summary.pairsWithoutMistakes, 'green', 'green'],
          ['זוגות עם טעויות', summary.pairsWithMistakes, 'redOrange', 'redOrange'],
        ].map(([label, count, color, background]) => (
          <Box key={label} role="group" aria-label={label} sx={{ p: 1, borderRadius: '16px', bgcolor: theme => alpha(theme.palette[background], .12), color: theme => theme.palette[color] }}>
            <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>{label}</Typography>
            <Typography sx={{ fontSize: 'clamp(24px, 4dvh, 30px)', fontWeight: 'bold', lineHeight: 1.2 }}>{count}</Typography>
          </Box>
        ))}
      </Box>

      {summary.incompletePairs > 0 && <Typography>זוגות שלא הושלמו: {summary.incompletePairs}</Typography>}
      <Box component="section" aria-labelledby="mistaken-pairs-title" sx={{ p: 'clamp(8px, 1.5dvh, 16px)', borderRadius: '20px', bgcolor: theme => alpha(theme.palette.lightBlue, .4) }}>
        <Typography id="mistaken-pairs-title" component="h3" sx={{ fontWeight: 'bold' }}>זוגות שבהם הייתה לפחות טעות אחת</Typography>
        {summary.mistakenPairs.length ? (
          <Box component="ul" sx={{ my: .5, paddingInlineStart: 3, maxHeight: 'min(100px, 15dvh)', overflowY: 'auto' }}>
            {summary.mistakenPairs.map((pair, index) => <li key={pair.id ?? index}>{pair.words.join(' / ')}</li>)}
          </Box>
        ) : <Typography>לא היו טעויות בתרגול הזה!</Typography>}
      </Box>
      </Box>

      {canSave && <Typography sx={{ fontSize: 14, lineHeight: 1.2, flexShrink: 0 }}>השמירה עדיין אינה פעילה. לחיצה על שמירה תדפיס את הסיכום למסוף בלבד.</Typography>}
      <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
        {canSave && <Button onClick={onSave} sx={{ flex: 3, borderRadius: '50px', fontSize: 20, fontWeight: 'bold', bgcolor: theme => theme.palette.green, color: theme => theme.palette.white, '&:hover': { bgcolor: theme => theme.palette.green } }}>שמירת התרגול</Button>}
        <button className="auth-secondary" type="button" style={{ flex: 1, width: 'auto', borderRadius: 50 }} onClick={onClose}>{canSave ? 'לא עכשיו' : 'סגירה'}</button>
      </Box>
    </Dialog>
  );
}
