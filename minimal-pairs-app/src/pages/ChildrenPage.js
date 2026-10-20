import React, { useEffect, useState } from 'react';
import { Box, Dialog, Typography } from '@mui/material';
import PersonRounded from '@mui/icons-material/PersonRounded';
import BadgeRounded from '@mui/icons-material/BadgeRounded';
import { createChild, getChildren } from '../usersApi';
import './LoginPage.css';
import './ChildrenPage.css';

export default function ChildrenPage() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [childCode, setChildCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [notice, setNotice] = useState('');

  function openForm() {
    setChildCode('');
    setFirstName('');
    setLastName('');
    setSaveError(null);
    setNotice('');
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setSaveError(null);
    if (!childCode.trim() || !firstName.trim()) {
      setSaveError('יש למלא קוד ילד ושם פרטי.');
      return;
    }
    setSaving(true);
    try {
      const child = await createChild(childCode.trim(), firstName.trim(), lastName.trim());
      setChildren(current => [child, ...current]);
      setOpen(false);
      setNotice('הילד נוסף בהצלחה.');
    } catch (failure) {
      setSaveError(failure.message === 'Child code already exists for this clinician.'
        ? 'קוד הילד כבר קיים ברשימה שלך. בחרו קוד אחר.'
        : 'לא ניתן להוסיף את הילד כרגע. נסו שוב.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
  let active = true;

  async function loadChildren() {
    try {
      const loadedChildren = await getChildren();
      if (active) setChildren(current => [
        ...current.filter(child => !loadedChildren.some(loaded => loaded.id === child.id)),
        ...loadedChildren,
      ]);
    } catch {
      if (active) setError('לא ניתן לטעון את רשימת הילדים.');
    } finally {
      if (active) setLoading(false);
    }
  }

  loadChildren();

  return () => {
    active = false;
  };
}, []);

  return (
    <Box component="main" className="auth-page children-page" dir="rtl" lang="he"
      sx={{ '--children-yellow': theme => theme.palette.yellow }}>
      <section className="children-content" aria-labelledby="children-title">
      <header className="children-header">
        <div>
          <Typography component="h1" id="children-title" sx={{ fontSize: { xs: 30, sm: 40 }, fontWeight: 'bold', color: theme => theme.palette.darkBlue }}>הילדים שלי</Typography>
          <p>כל הילדים שלך, במקום אחד</p>
        </div>
        <button className="auth-primary children-add" type="button" onClick={openForm}>הוספת ילד</button>
      </header>
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      {loading && <p role="status">טוען ילדים…</p>}
      {children.length === 0 ? (!loading && !error && (
        <section className="children-empty">
          <PersonRounded aria-hidden="true" />
          <p>עדיין אין ילדים ברשימה. לחצו על ״הוספת ילד״ כדי להתחיל.</p>
        </section>
      )) : (
        <ul className="children-list">
          {children.map(child => (
            <li className="children-row" key={child.id}>
              <span className="children-avatar"><PersonRounded aria-hidden="true" /></span>
              <div className="children-details">
                <h2>{child.first_name}{child.last_name ? ` ${child.last_name}` : ''}</h2>
                <p className="children-code">קוד ילד: <bdi>{child.child_code}</bdi></p>
              </div>
              <div className="children-actions">
                <button className="auth-secondary" type="button" disabled title="בקרוב">פרטים</button>
                <button className="auth-secondary" type="button" disabled title="בקרוב">סטטיסטיקות</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      </section>
      <Dialog open={open} onClose={() => { if (!saving) setOpen(false); }}
        aria-labelledby="add-child-title" maxWidth="sm" fullWidth
        BackdropProps={{ className: 'auth-backdrop' }}
        PaperProps={{ className: 'auth-dialog children-dialog', dir: 'rtl', lang: 'he' }}>
        <button className="auth-close" type="button" aria-label="סגירת הוספת ילד" disabled={saving} onClick={() => setOpen(false)}>×</button>
        <h2 id="add-child-title">הוספת ילד</h2>
        <form className="auth-form" onSubmit={handleSubmit} aria-busy={saving}>
          <label htmlFor="child-code">קוד ילד</label>
          <div className="auth-input-wrap"><BadgeRounded aria-hidden="true" />
            <input id="child-code" autoFocus required disabled={saving} value={childCode} placeholder="הזינו קוד ילד" onChange={event => setChildCode(event.target.value)} />
          </div>
          <label htmlFor="child-first-name">שם פרטי</label>
          <div className="auth-input-wrap"><PersonRounded aria-hidden="true" />
            <input id="child-first-name" required disabled={saving} value={firstName} placeholder="הזינו שם פרטי" onChange={event => setFirstName(event.target.value)} />
          </div>
          <label htmlFor="child-last-name">שם משפחה (לא חובה)</label>
          <div className="auth-input-wrap"><PersonRounded aria-hidden="true" />
            <input id="child-last-name" disabled={saving} value={lastName} placeholder="הזינו שם משפחה" onChange={event => setLastName(event.target.value)} />
          </div>
          {saveError && <p className="auth-error" role="alert">{saveError}</p>}
          <div className="children-dialog-actions">
            <button className="auth-primary" type="submit" disabled={saving}>{saving ? 'מוסיף ילד…' : 'הוספת ילד'}</button>
            <button className="auth-secondary" type="button" disabled={saving} onClick={() => setOpen(false)}>ביטול</button>
          </div>
        </form>
      </Dialog>
    </Box>
  );
}
