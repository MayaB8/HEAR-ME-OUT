const apiBaseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '');

export async function getCurrentUser() {
  const response = await fetch(`${apiBaseUrl}/api/me`, {
    method: 'GET',
    credentials: 'include',
  });
  if (response.status === 401) return null;
  if (response.status !== 200) {
    throw new Error('Unable to restore current user.');
  }
  return response.json();
}

export async function logoutUser() {
  const response = await fetch(`${apiBaseUrl}/api/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (response.status !== 204) {
    throw new Error('Unable to log out.');
  }
}

export async function submitCredentials(register, username, password) {
  if (!apiBaseUrl) throw new Error('כתובת השרת אינה מוגדרת.');
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/api/${register ? 'users' : 'login'}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error('לא הצלחנו להתחבר לשרת. נסו שוב בעוד רגע.');
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error('שם המשתמש או הסיסמה אינם נכונים.');
    if (response.status === 409) throw new Error('שם המשתמש כבר תפוס. בחרו שם אחר.');
    if (response.status === 400) throw new Error('בדקו את שם המשתמש והסיסמה ונסו שוב.');
    throw new Error('משהו השתבש. נסו שוב בעוד רגע.');
  }
  return response.json();
}