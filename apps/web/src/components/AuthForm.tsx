import { useState } from 'react'
import { authClient } from '../lib/auth-client'

type Mode = 'signIn' | 'signUp'

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('signIn')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSignUp = mode === 'signUp'

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const result = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password })

    if (result.error) {
      setError(result.error.message ?? 'Something went wrong')
    }
    setSubmitting(false)
  }

  function switchMode() {
    setMode(isSignUp ? 'signIn' : 'signUp')
    setError(null)
  }

  return (
    <form
      className="note-form auth-form"
      onSubmit={(e) => {
        e.preventDefault()
        void handleSubmit()
      }}
    >
      <h2>{isSignUp ? 'Create an account' : 'Sign in'}</h2>

      {isSignUp && (
        <input
          placeholder="Name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder={isSignUp ? 'Password (min. 8 characters)' : 'Password'}
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
        required
        minLength={isSignUp ? 8 : undefined}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
      </button>

      <p className="auth-switch">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button type="button" className="link-button" onClick={switchMode}>
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </p>
    </form>
  )
}
