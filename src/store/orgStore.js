import { create } from "zustand";
import { persist } from "zustand/middleware";

const useOrganizerStore = create(
  persist(
    (set) => ({
      organization: null,
      events: [],

      setOrganization: (organization) => set({ organization }),

      setEvents: (events) => set({ events }),

      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),

      updateEvent: (updatedEvent) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          ),
        })),

      removeEvent: (eventId) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
        })),

      clearStore: () => set({ organization: null, events: [] }),
    }),
    {
      name: "organizer-storage", // localStorage key
    }
  )
);

export default useOrganizerStore;
