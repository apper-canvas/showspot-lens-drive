import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import getIcon from "../utils/iconUtils";
import { fetchEvents } from "../services/eventService";
import { fetchUserBookings } from "../services/bookingService";
import { fetchRecentlyViewedEvents } from "../services/recentlyViewedService";
import { recordUserInterest } from "../services/userInterestService";
import { recordEventView } from "../services/recentlyViewedService";
import { createBooking } from "../services/bookingService";

// Icons
const TicketIcon = getIcon("Ticket");
const CalendarIcon = getIcon("Calendar");
const StarIcon = getIcon("Star");
const LogOutIcon = getIcon("LogOut");
const HomeIcon = getIcon("Home");
const UserIcon = getIcon("User");
const SearchIcon = getIcon("Search");
const SparklesIcon = getIcon("Sparkles");
const MapPinIcon = getIcon("MapPin");
const RefreshCwIcon = getIcon("RefreshCw");

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  const { logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  // Load events data when component mounts
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await fetchEvents({ featured: true }, 0, 6);
        setEvents(response.data);
      } catch (error) {
        console.error("Error loading events:", error);
        toast.error("Failed to load events");
      } finally {
        setIsLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  // Load user's bookings
  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.emailAddress) return;
      
      try {
        setIsLoadingBookings(true);
        const bookingsData = await fetchUserBookings(user.emailAddress);
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load your bookings");
      } finally {
        setIsLoadingBookings(false);
      }
    };

    loadBookings();
  }, [user]);

  // Load recently viewed events
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      if (!user?.emailAddress) return;
      
      try {
        setIsLoadingRecent(true);
        const recentData = await fetchRecentlyViewedEvents(user.emailAddress, 4);
        setRecentlyViewed(recentData);
      } catch (error) {
        console.error("Error loading recently viewed:", error);
      } finally {
        setIsLoadingRecent(false);
      }
    };

    loadRecentlyViewed();
  }, [user]);

  // Handle viewing an event (track user interest)
  const handleEventView = async (event) => {
    if (!user?.emailAddress) return;
    
    try {
      // Record the view in recently_viewed table
      await recordEventView(user.emailAddress, event.Id);
      
      // Record interest in this category
      await recordUserInterest(user.emailAddress, 'category', event.category, 1);
      
      // Record interest in this event type
      await recordUserInterest(user.emailAddress, 'event_type', event.type, 1);
      
      toast.info(`Viewing details for ${event.title}`);
    } catch (error) {
      console.error("Error recording event view:", error);
    }
  };

  // Handle booking an event
  const handleBookEvent = async (event) => {
    if (!user?.emailAddress) return;
    
    try {
      // Create booking record
      await createBooking(user.emailAddress, event.Id);
      
      // Record stronger interest for booking (value 3)
      await recordUserInterest(user.emailAddress, 'category', event.category, 3);
      await recordUserInterest(user.emailAddress, 'event_type', event.type, 3);
      
      toast.success(`Booking confirmed for ${event.title}`);
      
      // Refresh bookings
      const bookingsData = await fetchUserBookings(user.emailAddress);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error booking event:", error);
      toast.error("Failed to book event. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Header */}
      <header className="bg-surface-100 dark:bg-surface-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-2xl font-bold text-surface-900 dark:text-surface-100">
                spotshow<span className="text-primary">45</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                <span className="text-surface-600 dark:text-surface-300">Welcome,</span>
                <span className="font-medium">{user?.firstName || user?.emailAddress}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                aria-label="Logout"
              >
                <LogOutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Featured Events</h2>
            {isLoadingEvents ? (
              <div className="flex justify-center py-10">
                <RefreshCwIcon className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map((event) => (
                  <motion.div
                    key={event.Id}
                    className="card overflow-hidden"
                    whileHover={{ y: -5 }}
                    onClick={() => handleEventView(event)}
                  >
                    <div className="relative h-40">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                        {event.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                      <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-2">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-surface-600 dark:text-surface-400 mb-3">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">{event.price}</span>
                        <button
                          className="btn-primary text-sm py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookEvent(event);
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User's bookings */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <TicketIcon className="h-5 w-5 mr-2 text-primary" />
                Your Bookings
              </h2>

              {isLoadingBookings ? (
                <div className="flex justify-center py-4">
                  <RefreshCwIcon className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.Id} className="flex items-center p-2 bg-surface-50 dark:bg-surface-700 rounded">
                      <div className="flex-shrink-0 w-12 h-12 bg-surface-200 dark:bg-surface-600 rounded overflow-hidden">
                        {booking.event?.image ? (
                          <img src={booking.event.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <TicketIcon className="w-6 h-6 m-3 text-surface-400" />
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{booking.event?.title || "Event"}</p>
                        <p className="text-xs text-surface-500">{booking.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-500 py-2">No bookings yet</p>
              )}
            </div>

            {/* Recently viewed */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <SearchIcon className="h-5 w-5 mr-2 text-primary" />
                Recently Viewed
              </h2>

              {isLoadingRecent ? (
                <div className="flex justify-center py-4">
                  <RefreshCwIcon className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentlyViewed.length > 0 ? (
                <div className="space-y-2">
                  {recentlyViewed.map((viewed) => (
                    <div key={viewed.Id} className="text-sm px-2 py-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded">
                      • Event #{viewed.event_id}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-500 py-2">No recently viewed events</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;