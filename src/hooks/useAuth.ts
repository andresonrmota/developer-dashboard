import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

// UID do owner — o mesmo que está em firestore.rules, que é quem de fato
// protege a escrita; aqui só decide o que a interface mostra. Fica fixo no
// código porque a Vercel nunca teve VITE_OWNER_UID e isso deixava o dono
// sem edição nem Smart Sync em produção. A variável segue valendo pra testar
// com outra conta.
const OWNER_UID = import.meta.env.VITE_OWNER_UID || 'O805TXABLZeD2ns3u1jwTPAj2a33'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [])

  const isOwner = !!user && user.uid === OWNER_UID

  return { user, loading, login, logout, isOwner }
}
