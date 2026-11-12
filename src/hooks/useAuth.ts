import { useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  linkWithPopup,
  signOut,
  GithubAuthProvider,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../lib/firebase'

// UID do owner — o mesmo que está em firestore.rules, que é quem de fato
// protege a escrita; aqui só decide o que a interface mostra. Fica fixo no
// código porque a Vercel nunca teve VITE_OWNER_UID e isso deixava o dono
// sem edição nem Smart Sync em produção. A variável segue valendo pra testar
// com outra conta.
const OWNER_UID = import.meta.env.VITE_OWNER_UID || 'O805TXABLZeD2ns3u1jwTPAj2a33'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Token do GitHub da sessão atual. Fica só em memória: some ao recarregar a página.
  const [githubToken, setGithubToken] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Login error:', err)
    }
  }, [])

  /**
   * Conecta o GitHub à conta atual. Se já há um owner logado com Google, vincula
   * o GitHub a ESSA conta (mesmo UID); senão, faz login com GitHub.
   */
  const loginGithub = useCallback(async () => {
    try {
      const result = auth.currentUser
        ? await linkWithPopup(auth.currentUser, githubProvider)
        : await signInWithPopup(auth, githubProvider)
      const credential = GithubAuthProvider.credentialFromResult(result)
      if (credential?.accessToken) setGithubToken(credential.accessToken)
    } catch (err) {
      console.error('GitHub login error:', err)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setGithubToken(null)
      await signOut(auth)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [])

  const isOwner = !!user && user.uid === OWNER_UID

  return { user, loading, login, loginGithub, githubToken, logout, isOwner }
}
