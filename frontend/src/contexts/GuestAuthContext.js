import React, { createContext, useContext, useState, useEffect } from 'react';

const GuestAuthContext = createContext(null);

export const useGuestAuth = () => {
  return useContext(GuestAuthContext);
};

export function GuestAuthProvider({ children }) {
  const [guestUser, setGuestUser] = useState(null);
  
  useEffect(() => {
    const storedGuestUser = localStorage.getItem('guestUser');
    if (storedGuestUser) {
      setGuestUser(JSON.parse(storedGuestUser));
    }
  }, []);
  
  const loginAsGuest = () => {
    const newGuestUser = {
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      isGuest: true,
      loginTime: new Date().toISOString(),
      access_token: `guest_${Date.now()}`
    };
    
    localStorage.setItem('guestUser', JSON.stringify(newGuestUser));
    setGuestUser(newGuestUser);
    return newGuestUser;
  };
  
  const logoutGuest = () => {
    localStorage.removeItem('guestUser');
    setGuestUser(null);
  };
  
  const isGuestLoggedIn = !!guestUser;
  
  const value = {
    guestUser,
    loginAsGuest,
    logoutGuest,
    isGuestLoggedIn
  };
  
  return (
    <GuestAuthContext.Provider value={value}>
      {children}
    </GuestAuthContext.Provider>
  );
} 