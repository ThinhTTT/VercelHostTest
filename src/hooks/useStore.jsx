import { subscribeWithSelector } from 'zustand/middleware'
import { create } from 'zustand'

export const useLocalCharacter = create(
    subscribeWithSelector((set) => ({ 
        gesture: '',
        setGesture: (v) => set((state) => ({ gesture : v })),
        viewMode: true, // false: 1st person, true: 3rd person - default is 3rd person
        setViewMode: (v) => set((state) => ({ viewMode : v })),
        isChatActive: false,
        setIsChatActive: (v) => set((state) => ({ isChatActive : v })),
        inMeeting: false,
        setInMeeting: (v) => set((state) => ({ inMeeting : v })),
    }))
)
