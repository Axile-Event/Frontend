import { create } from "zustand";
import { persist } from "zustand/middleware";

const useOrganizerStore = create(
  persist(
    (set) => ({
      organization: null,
      events: [],
      lastUpdate: null,

      setOrganization: (organization) => set({ organization }),

      setEvents: (events) => set({ events, lastUpdate: Date.now() }),

      setLastUpdate: () => set({ lastUpdate: Date.now() }),

      setLastUpdate: (timestamp) => set({ lastUpdate: timestamp }),

      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
          lastUpdate: Date.now(),
        })),

      updateEvent: (updatedEvent) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          ),
          lastUpdate: Date.now(),
        })),

      removeEvent: (eventId) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
          lastUpdate: Date.now(),
        })),

      clearStore: () => set({ organization: null, events: [], lastUpdate: null }),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "organizer-storage", // localStorage key
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);

export default useOrganizerStore;
