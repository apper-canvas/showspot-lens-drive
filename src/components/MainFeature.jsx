import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import getIcon from "../utils/iconUtils";

// Icon declarations
const MapPinIcon = getIcon("MapPin");
const CalendarIcon = getIcon("Calendar");
const ClockIcon = getIcon("Clock");
const UsersIcon = getIcon("Users");
const PlusIcon = getIcon("Plus");
const MinusIcon = getIcon("Minus");
const TicketIcon = getIcon("Ticket");
const ChevronRightIcon = getIcon("ChevronRight");
const DollarSignIcon = getIcon("DollarSign");
const XIcon = getIcon("X");

// Sample data
const movieShowtimes = [
  { id: 1, time: "10:30 AM", seats: { available: 145, total: 200 } },
  { id: 2, time: "1:15 PM", seats: { available: 112, total: 200 } },
  { id: 3, time: "4:00 PM", seats: { available: 89, total: 200 } },
  { id: 4, time: "7:30 PM", seats: { available: 67, total: 200 } },
  { id: 5, time: "10:45 PM", seats: { available: 187, total: 200 } }
];

const seatTypes = [
  { id: "standard", name: "Standard", price: 12.99 },
  { id: "premium", name: "Premium", price: 16.99 },
  { id: "vip", name: "VIP", price: 24.99 }
];

const theaters = [
  { id: 1, name: "AMC Century City 15", location: "Century City, CA", distance: "1.2 mi" },
  { id: 2, name: "Regal LA Live Stadium 14", location: "Downtown LA, CA", distance: "3.5 mi" },
  { id: 3, name: "Landmark Theatres", location: "West Los Angeles, CA", distance: "4.1 mi" }
];

const MainFeature = () => {
  // State for ticket booking
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTheaterId, setSelectedTheaterId] = useState(1);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeatType, setSelectedSeatType] = useState("standard");
  const [ticketCount, setTicketCount] = useState(2);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Generate available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Get current theater
  const selectedTheater = theaters.find(theater => theater.id === selectedTheaterId);

  // Handle ticket count changes
  const incrementTickets = () => {
    if (ticketCount < 10) setTicketCount(ticketCount + 1);
    else toast.warn("Maximum 10 tickets per booking");
  };

  const decrementTickets = () => {
    if (ticketCount > 1) setTicketCount(ticketCount - 1);
  };

  // Get seat type price
  const getSeatPrice = () => {
    const type = seatTypes.find(type => type.id === selectedSeatType);
    return type ? type.price : 0;
  };

  // Calculate total price
  const calculateTotal = () => {
    return (getSeatPrice() * ticketCount).toFixed(2);
  };

  // Handle booking submission
  const handleBookTickets = () => {
    if (!selectedShowtime) {
      toast.error("Please select a showtime first");
      return;
    }
    
    setIsBookingModalOpen(true);
  };

  // Complete booking
  const completeBooking = () => {
    // In a real app, this would submit data to an API
    toast.success(`Successfully booked ${ticketCount} tickets!`);
    setIsBookingModalOpen(false);
    setSelectedShowtime(null);
    setTicketCount(2);
  };

  return (
    <div className="my-8">
      <motion.div 
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-primary text-white py-4 px-6">
          <h2 className="text-xl font-semibold flex items-center">
            <TicketIcon className="mr-2 w-5 h-5" />
            Book Movie Tickets
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <CalendarIcon className="mr-2 w-4 h-4" />
                Select Date
              </h3>
              <div className="flex overflow-x-auto scrollbar-hide pb-2 space-x-2">
                {availableDates.map((date, index) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 w-16 sm:w-20 rounded-lg p-2 ${
                        isSelected 
                          ? 'bg-primary text-white' 
                          : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                      }`}
                    >
                      <div className="text-center">
                        <p className="text-xs font-medium mb-1">
                          {format(date, 'EEE')}
                        </p>
                        <p className="text-xl font-bold">
                          {format(date, 'd')}
                        </p>
                        <p className="text-xs mt-1">
                          {isToday ? 'Today' : format(date, 'MMM')}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            {/* Theater Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <MapPinIcon className="mr-2 w-4 h-4" />
                Select Theater
              </h3>
              <div className="space-y-2">
                {theaters.map((theater) => (
                  <motion.button
                    key={theater.id}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTheaterId(theater.id)}
                    className={`w-full flex justify-between items-center p-3 rounded-lg border ${
                      selectedTheaterId === theater.id 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">{theater.name}</h4>
                        {selectedTheaterId === theater.id && (
                          <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">Selected</span>
                        )}
                      </div>
                      <p className="text-sm text-surface-500 mt-1">{theater.location}</p>
                    </div>
                    <div className="text-sm text-surface-500">
                      {theater.distance}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Showtime Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <ClockIcon className="mr-2 w-4 h-4" />
                Select Showtime
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {movieShowtimes.map((showtime) => {
                  const availability = (showtime.seats.available / showtime.seats.total) * 100;
                  let availabilityColor = 'text-green-600 dark:text-green-400';
                  
                  if (availability < 30) {
                    availabilityColor = 'text-red-600 dark:text-red-400';
                  } else if (availability < 70) {
                    availabilityColor = 'text-amber-600 dark:text-amber-400';
                  }
                  
                  return (
                    <motion.button
                      key={showtime.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedShowtime(showtime)}
                      className={`flex flex-col items-center p-3 rounded-lg border ${
                        selectedShowtime?.id === showtime.id 
                          ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                          : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      <p className="font-medium">{showtime.time}</p>
                      <p className={`text-xs mt-1 ${availabilityColor}`}>
                        {showtime.seats.available} seats left
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            {/* Ticket Selection */}
            {selectedShowtime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="border border-surface-200 dark:border-surface-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <TicketIcon className="mr-2 w-4 h-4" />
                  Ticket Details
                </h3>
                
                {/* Seat Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Seat Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {seatTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSeatType(type.id)}
                        className={`p-3 rounded-lg flex justify-between items-center ${
                          selectedSeatType === type.id 
                            ? 'bg-primary text-white' 
                            : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                        }`}
                      >
                        <span>{type.name}</span>
                        <span>${type.price.toFixed(2)}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Ticket Quantity */}
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">Number of Tickets</label>
                  <div className="flex items-center">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decrementTickets}
                      className="p-2 rounded-l-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700"
                      disabled={ticketCount <= 1}
                    >
                      <MinusIcon className="w-5 h-5" />
                    </motion.button>
                    <div className="px-6 py-2 bg-white dark:bg-surface-900 border-y border-surface-200 dark:border-surface-700 font-medium">
                      {ticketCount}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={incrementTickets}
                      className="p-2 rounded-r-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700"
                      disabled={ticketCount >= 10}
                    >
                      <PlusIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-surface-600 dark:text-surface-400">Date</span>
                    <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-surface-600 dark:text-surface-400">Time</span>
                    <span className="font-medium">{selectedShowtime.time}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-surface-600 dark:text-surface-400">Theater</span>
                    <span className="font-medium">{selectedTheater.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-surface-600 dark:text-surface-400">Seat Type</span>
                    <span className="font-medium">
                      {seatTypes.find(type => type.id === selectedSeatType).name}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-surface-600 dark:text-surface-400">Tickets</span>
                    <span className="font-medium">{ticketCount} × ${getSeatPrice().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-surface-200 dark:border-surface-700 mt-3 pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">${calculateTotal()}</span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBookTickets}
                  className="w-full btn-primary py-3 flex items-center justify-center"
                >
                  <span>Continue to Book</span>
                  <ChevronRightIcon className="ml-2 w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsBookingModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-lg max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-primary text-white py-4 px-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center">
                  <TicketIcon className="mr-2 w-5 h-5" />
                  Confirm Booking
                </h3>
                <button 
                  onClick={() => setIsBookingModalOpen(false)}
                  className="text-white hover:text-surface-200"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg text-center mb-6">
                    <p className="text-sm text-surface-600 dark:text-surface-400">You are about to book</p>
                    <p className="text-2xl font-bold text-primary">
                      {ticketCount} {ticketCount === 1 ? 'Ticket' : 'Tickets'}
                    </p>
                    <p className="font-medium">
                      {seatTypes.find(type => type.id === selectedSeatType).name} Seats
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 text-surface-500 mr-2" />
                      <span>{format(selectedDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-surface-500 mr-2" />
                      <span>{selectedShowtime.time}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 text-surface-500 mr-2" />
                    <span>{selectedTheater.name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 text-surface-500 mr-2" />
                    <span>{ticketCount} {ticketCount === 1 ? 'person' : 'people'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSignIcon className="w-4 h-4 text-surface-500 mr-2" />
                    <span>Total: <strong>${calculateTotal()}</strong></span>
                  </div>
                  
                  <div className="pt-4 border-t border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setIsBookingModalOpen(false)}
                      className="flex-1 py-2 px-4 border border-surface-300 dark:border-surface-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={completeBooking}
                      className="flex-1 py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                    >
                      Confirm & Pay
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;