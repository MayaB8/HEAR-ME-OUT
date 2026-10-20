import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Typography } from '@mui/material';
import PersonRounded from '@mui/icons-material/PersonRounded';
import LockRounded from '@mui/icons-material/LockRounded';
import leftArrowBtn from '../images/buttons/leftArrowBtn.png';
import { submitCredentials } from '../usersApi';
import './LoginPage.css';

function CredentialsForm({ register = false, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const prefix = register ? 'register' : 'login';

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('יש למלא שם משתמש וסיסמה.');
      return;
    }
    if (register && new Blob([password]).size > 72) {
      setError('הסיסמה ארוכה מדי. בחרו סיסמה קצרה יותר.');
      return;
    }
    if (register && password !== confirmation) {
      setError('הסיסמאות אינן תואמות. נסו שוב.');
      return;
    }
    setBusy(true);
    try {
      const user = await submitCredentials(register, username, password);
      setPassword('');
      onSuccess(username.trim(), user);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form id={`${prefix}-form`} className="auth-form" onSubmit={handleSubmit} aria-busy={busy}>
      <label htmlFor={`${prefix}-username`}>שם משתמש</label>
      <div className="auth-input-wrap"><PersonRounded aria-hidden="true" />
      <input id={`${prefix}-username`} name="username" dir="rtl" autoComplete="username"
        placeholder="הזן שם משתמש" value={username} required disabled={busy}
        onChange={event => setUsername(event.target.value)} />
      </div>
      <label htmlFor={`${prefix}-password`}>סיסמה</label>
      <div className="auth-input-wrap"><LockRounded aria-hidden="true" />
      <input id={`${prefix}-password`} name="password" type="password" dir="rtl"
        autoComplete={register ? 'new-password' : 'current-password'}
        placeholder="הזן סיסמה" value={password} required disabled={busy}
        onChange={event => setPassword(event.target.value)} />
      </div>
      {register && <>
        <label htmlFor="register-confirmation">אימות סיסמה</label>
        <div className="auth-input-wrap"><LockRounded aria-hidden="true" />
          <input id="register-confirmation" type="password" dir="rtl" autoComplete="new-password"
            placeholder="הזן שוב סיסמה" value={confirmation} required disabled={busy}
            onChange={event => setConfirmation(event.target.value)} />
        </div>
      </>}
      {register && <button className="auth-primary" type="submit" disabled={busy}>
        {busy ? 'רק רגע…' : 'צור חשבון'}
      </button>}
      {error && <p className="auth-error" role="alert"><span aria-hidden="true">!</span>{error}</p>}
    </form>
  );
}

export default function LoginPage({ onLogin = () => {} }) {
  const navigate = useNavigate();
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [notice, setNotice] = useState('');

  return (
    <main className="auth-page" dir="rtl" lang="he">
      <div className="auth-layout">
        <section className="auth-welcome" aria-label="ברוכים הבאים">
          <Typography component="h1" id="login-title" fontSize="600%" fontWeight="bold"
            sx={{ color: theme => theme.palette.darkBlue }}>
            התחברות
            <Typography component="span" fontSize="inherit" fontWeight="bold"
              sx={{ display: 'block', marginTop: '-15%', color: theme => theme.palette.redOrange }}>
              לחשבון
            </Typography>
          </Typography>
          <button className="auth-back" type="submit" form="login-form" aria-label="התחבר"><img src={leftArrowBtn} alt="" /></button>
        </section>
        <section className="auth-card" aria-labelledby="login-title">
          <CredentialsForm onSuccess={(username, user) => {
            onLogin(user);
            navigate('/');
          }} />
          <div className="auth-divider" />
          <p className="auth-signup">אין לך חשבון? <button className="auth-link" onClick={() => { setNotice(''); setRegistrationOpen(true); }}>
            הרשמה חדשה
          </button></p>
        </section>
      </div>
      <Dialog open={registrationOpen} onClose={() => setRegistrationOpen(false)}
        aria-labelledby="register-title" maxWidth="sm" fullWidth
        BackdropProps={{ className: 'auth-backdrop' }}
        PaperProps={{ className: 'auth-dialog', dir: 'rtl', lang: 'he' }}>
        <button className="auth-close" aria-label="סגירת הרשמה" onClick={() => setRegistrationOpen(false)}>×</button>
        <h2 id="register-title">הרשמה חדשה</h2>
        {notice ? <>
          <p className="auth-notice" role="status">{notice}</p>
          <button className="auth-primary" onClick={() => setRegistrationOpen(false)}>למעבר להתחברות</button>
        </> : <>
        <CredentialsForm register onSuccess={username => {
          setNotice(`המשתמש ${username} נוצר בהצלחה! עכשיו אפשר להתחבר.`);
        }} />
        <div className="auth-divider" />
        <p className="auth-signup">כבר יש לך חשבון? <button className="auth-link" onClick={() => setRegistrationOpen(false)}>להתחברות</button></p>
        </>}
      </Dialog>
    </main>
  );
}
