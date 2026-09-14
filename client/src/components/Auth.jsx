import { useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabaseClient.js';

export default function Auth() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  if (!supabaseConfigured) {
    return (
      <div className="auth-shell" data-theme="dark">
        <div className="panel-card auth-card">
          <h1 className="header-title">Studio Tracker</h1>
          <p className="research-status" style={{ marginTop: 8 }}>
            Supabase isn't configured yet. Set <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> (see <code>client/.env.example</code>) and reload.
          </p>
        </div>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setNotice('Account created — check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell" data-theme="dark">
      <form className="panel-card auth-card" onSubmit={submit}>
        <h1 className="header-title">Studio Tracker</h1>
        <p className="header-sub" style={{ marginBottom: 8 }}>
          {mode === 'signin' ? 'Sign in to your studio' : 'Create your studio account'}
        </p>

        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 14 }}>
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>

        {error && <div className="hint-warning">{error}</div>}
        {notice && <div className="auto-research-success">{notice}</div>}

        <button
          type="button"
          className="panel-link-btn"
          style={{ marginTop: 14 }}
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setNotice(null);
          }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
