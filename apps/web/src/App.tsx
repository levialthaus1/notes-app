import { authClient } from './lib/auth-client'
import { AuthForm } from './components/AuthForm'
import { NotesPage } from './components/NotesPage'

function App() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <main className="container">
        <p>Loading…</p>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="container">
        <h1>Notes</h1>
        <AuthForm />
      </main>
    )
  }

  return (
    <main className="container">
      <header className="app-header">
        <h1>Notes</h1>
        <div className="user">
          <span>{session.user.email}</span>
          <button onClick={() => void authClient.signOut()}>Sign out</button>
        </div>
      </header>
      <NotesPage key={session.user.id} />
    </main>
  )
}

export default App
