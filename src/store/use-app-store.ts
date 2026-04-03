import { create } from 'zustand';
import type { 
  AppView, User, PG, Room, Bed, Booking, Payment, 
  Complaint, Vendor, Worker, AnalyticsData, SearchFilters,
  UserRole, CommunityPost, CommunityGroup, KYCStatus
} from '@/lib/types';

interface AppState {
  // Auth state
  isLoggedIn: boolean;
  isGuest: boolean;
  currentUser: User | null;
  currentRole: UserRole;
  setIsLoggedIn: (val: boolean) => void;
  setIsGuest: (val: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  viewHistory: AppView[];
  goBack: () => void;
  
  // Selected PG for detail view
  selectedPG: PG | null;
  setSelectedPG: (pg: PG | null) => void;
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
  selectedBed: Bed | null;
  setSelectedBed: (bed: Bed | null) => void;
  selectedBooking: Booking | null;
  setSelectedBooking: (booking: Booking | null) => void;
  
  // Data
  pgs: PG[];
  setPGs: (pgs: PG[]) => void;
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  complaints: Complaint[];
  setComplaints: (complaints: Complaint[]) => void;
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
  workers: Worker[];
  setWorkers: (workers: Worker[]) => void;
  analytics: AnalyticsData | null;
  setAnalytics: (analytics: AnalyticsData) => void;
  communityPosts: CommunityPost[];
  setCommunityPosts: (posts: CommunityPost[]) => void;
  communityGroups: CommunityGroup[];
  setCommunityGroups: (groups: CommunityGroup[]) => void;
  
  // Search filters
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  
  // UI state
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isAIChatOpen: boolean;
  setAIChatOpen: (open: boolean) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
  appliedCoupon: string | null;
  setAppliedCoupon: (code: string | null) => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  gender: 'ALL',
  minPrice: 0,
  maxPrice: 30000,
  amenities: [],
  sortBy: 'rating',
  city: 'Bangalore',
};

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  isLoggedIn: false,
  isGuest: true,
  currentUser: null,
  currentRole: 'TENANT',
  setIsLoggedIn: (val) => set({ isLoggedIn: val, isGuest: !val }),
  setIsGuest: (val) => set({ isGuest: val, isLoggedIn: !val }),
  setCurrentUser: (user) => set({ currentUser: user }),
  login: (user) => set({ 
    isLoggedIn: true, 
    isGuest: false, 
    currentUser: user, 
    currentRole: user.role || 'TENANT',
    currentView: user.role === 'OWNER' ? 'OWNER_DASHBOARD' : user.role === 'VENDOR' ? 'VENDOR_DASHBOARD' : 'LANDING',
    viewHistory: []
  }),
  logout: () => set({ 
    isLoggedIn: false, 
    isGuest: true, 
    currentUser: null, 
    currentRole: 'TENANT',
    currentView: 'LANDING',
    viewHistory: []
  }),
  switchRole: (role) => set({ 
    currentRole: role,
    currentView: role === 'OWNER' ? 'OWNER_DASHBOARD' : role === 'ADMIN' ? 'ADMIN_DASHBOARD' : role === 'VENDOR' ? 'VENDOR_DASHBOARD' : 'LANDING',
    viewHistory: []
  }),
  
  // Navigation
  currentView: 'LANDING',
  setCurrentView: (view) => set((s) => ({ 
    currentView: view, 
    viewHistory: [...s.viewHistory.slice(-9), s.currentView] 
  })),
  viewHistory: [],
  goBack: () => {
    const history = get().viewHistory;
    if (history.length > 0) {
      const prev = history[history.length - 1];
      set({ currentView: prev, viewHistory: history.slice(0, -1) });
    } else {
      set({ currentView: 'LANDING' });
    }
  },
  
  // Selected items
  selectedPG: null,
  setSelectedPG: (pg) => set({ selectedPG: pg }),
  selectedRoom: null,
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  selectedBed: null,
  setSelectedBed: (bed) => set({ selectedBed: bed }),
  selectedBooking: null,
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  
  // Data
  pgs: [],
  setPGs: (pgs) => set({ pgs }),
  bookings: [],
  setBookings: (bookings) => set({ bookings }),
  payments: [],
  setPayments: (payments) => set({ payments }),
  complaints: [],
  setComplaints: (complaints) => set({ complaints }),
  vendors: [],
  setVendors: (vendors) => set({ vendors }),
  workers: [],
  setWorkers: (workers) => set({ workers }),
  analytics: null,
  setAnalytics: (analytics) => set({ analytics }),
  communityPosts: [],
  setCommunityPosts: (posts) => set({ communityPosts: posts }),
  communityGroups: [],
  setCommunityGroups: (groups) => set({ communityGroups: groups }),
  
  // Search
  searchFilters: defaultFilters,
  setSearchFilters: (filters) => set((state) => ({ 
    searchFilters: { ...state.searchFilters, ...filters } 
  })),
  resetFilters: () => set({ searchFilters: defaultFilters }),
  
  // UI
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  isAIChatOpen: false,
  setAIChatOpen: (open) => set({ isAIChatOpen: open }),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  toastMessage: null,
  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => set({ toastMessage: null }), 3000);
  },
  appliedCoupon: null,
  setAppliedCoupon: (code) => set({ appliedCoupon: code }),
}));
