import React, { createContext, useContext, useState } from 'react';

const CursorContext = createContext();

export const CursorProvider = ({ children }) => {
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem('inirazor_cursor_preference') || null;
  });

  const [hasDismissedPopup, setHasDismissedPopup] = useState(() => {
    return sessionStorage.getItem('inirazor_cursor_popup_dismissed') === 'true';
  });

  const updatePreference = (value) => {
    setPreference(value);
    if (value) {
      localStorage.setItem('inirazor_cursor_preference', value);
    } else {
      localStorage.removeItem('inirazor_cursor_preference');
    }
  };

  const dismissPopup = () => {
    setHasDismissedPopup(true);
    sessionStorage.setItem('inirazor_cursor_popup_dismissed', 'true');
  };

  return (
    <CursorContext.Provider value={{ preference, updatePreference, hasDismissedPopup, dismissPopup }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursorContext = () => useContext(CursorContext);
