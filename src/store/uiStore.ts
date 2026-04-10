import { create } from "zustand";

type UiStoreState = {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;

  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  isSidebarOpen: true,
  isMobileMenuOpen: false,

  openSidebar: () => {
    set({ isSidebarOpen: true });
  },

  closeSidebar: () => {
    set({ isSidebarOpen: false });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  openMobileMenu: () => {
    set({ isMobileMenuOpen: true });
  },

  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },

  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },
}));