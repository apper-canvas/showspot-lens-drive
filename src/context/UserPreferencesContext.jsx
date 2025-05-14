import { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
};

export const UserPreferencesProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [userInterests, setUserInterests] = useState(() => {
    const savedInterests = localStorage.getItem("userInterests");
    return savedInterests 
      ? JSON.parse(savedInterests)
      : {
          categories: {}, // e.g. {Action: 5, Comedy: 3}
          types: {},      // e.g. {movie: 8, concert: 2}
          locations: {},  // e.g. {"AMC Theaters": 3}
          recentlyViewed: [] // Array of recently viewed event IDs
        };
  });

  // Function to track when a user views an event
  const trackEventView = (event) => {
    setUserInterests(prev => {
      const newInterests = { ...prev };
      
      // Update category interest
      const category = event.category;
      newInterests.categories[category] = (newInterests.categories[category] || 0) + 1;
      
      // Update type interest
      const type = event.type;
      newInterests.types[type] = (newInterests.types[type] || 0) + 1;
      
      // Update location interest
      const location = event.location;
      newInterests.locations[location] = (newInterests.locations[location] || 0) + 1;
      
      // Update recently viewed (max 10 items, no duplicates)
      const updatedRecentlyViewed = [
        event.id,
        ...prev.recentlyViewed.filter(id => id !== event.id)
      ].slice(0, 10);
      
      newInterests.recentlyViewed = updatedRecentlyViewed;
      
      return newInterests;
    });
  };

  // Function to track when a user books an event (stronger interest signal)
  const trackEventBooking = (event) => {
    setUserInterests(prev => {
      const newInterests = { ...prev };
      
      // Booking shows stronger interest, so we increment by 3
      const category = event.category;
      newInterests.categories[category] = (newInterests.categories[category] || 0) + 3;
      
      const type = event.type;
      newInterests.types[type] = (newInterests.types[type] || 0) + 3;
      
      const location = event.location;
      newInterests.locations[location] = (newInterests.locations[location] || 0) + 3;
      
      return newInterests;
    });
  };
  
  // Reset all preferences (for testing or user request)
  const resetPreferences = () => {
    const emptyPreferences = {
      categories: {},
      types: {},
      locations: {},
      recentlyViewed: []
    };
    setUserInterests(emptyPreferences);
    localStorage.setItem("userInterests", JSON.stringify(emptyPreferences));
    toast.info("Your preferences have been reset");
  };

  // Save to localStorage whenever interests change
  useEffect(() => {
    localStorage.setItem("userInterests", JSON.stringify(userInterests));
  }, [userInterests]);

  return (
    <UserPreferencesContext.Provider
      value={{
        userInterests,
        trackEventView,
        trackEventBooking,
        resetPreferences
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export default UserPreferencesContext;