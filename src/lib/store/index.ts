import { create } from 'zustand'
import { UserSubscription, UserCredits } from '@/types'

interface AppState {
  subscription: UserSubscription | null
  credits: UserCredits | null
  setSubscription: (subscription: UserSubscription | null) => void
  setCredits: (credits: UserCredits | null) => void
}

export const useStore = create<AppState>((set) => ({
  subscription: null,
  credits: null,
  setSubscription: (subscription) => set({ subscription }),
  setCredits: (credits) => set({ credits }),
}))
