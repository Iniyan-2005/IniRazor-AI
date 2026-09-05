import { useState, useEffect } from 'react';
import { getStore, subscribeToStore } from '../services/dataService';

export const useStore = () => {
  // We initialize with the current store.
  // Using a separate incrementing state ensures we force a re-render 
  // even if the store reference remains identical but its contents mutated.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setTick(t => t + 1); // Force re-render on any store save
    });
    return () => unsubscribe();
  }, []);

  // Return the live store object. It will always have the latest data 
  // when the component re-renders due to the tick.
  return getStore();
};
