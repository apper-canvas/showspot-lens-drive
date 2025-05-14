import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useUserPreferences } from "../context/UserPreferencesContext";
import getIcon from "../utils/iconUtils";
import MainFeature from "../components/MainFeature";

// Predefined icon components
const MapPinIcon = getIcon("MapPin");
const CalendarIcon = getIcon("Calendar");
const SearchIcon = getIcon("Search");
const ChevronLeftIcon = getIcon("ChevronLeft");
const ChevronRightIcon = getIcon("ChevronRight");
const SparklesIcon = getIcon("Sparkles");
const LightbulbIcon = getIcon("Lightbulb");
const EmptyStarIcon = getIcon("Star");
const TicketIcon = getIcon("Ticket");

// Sample event data
const events = [
  {
    id: 1,
    title: "Avengers: Endgame",
    type: "movie",
    image: "https://source.unsplash.com/random/800x450?movie",
    date: "May 15, 2023",
    location: "AMC Theaters",
    price: "$12.99",
    rating: 4.8,
    category: "Action"
  },
  {
    id: 2,
    title: "Taylor Swift: Eras Tour",
    type: "concert",
    image: "https://source.unsplash.com/random/800x450?concert",
    date: "Jun 22, 2023",
    location: "Madison Square Garden",
    price: "$89.99",
    rating: 4.9,
    category: "Music"
  },
  {
    id: 3,
    title: "Hamilton",
    type: "play",
    image: "https://source.unsplash.com/random/800x450?theater",
    date: "Jul 10, 2023",
    location: "Broadway Theater",
    price: "$59.99",
    rating: 4.7,
    category: "Theater"
  },
  {
    id: 4,
    title: "NBA Finals 2023",
    type: "sports",
    image: "https://source.unsplash.com/random/800x450?basketball",
    date: "Jun 12, 2023",
    location: "Staples Center",
    price: "$120.00",
    rating: 4.5,
    category: "Sports"
  },
  {
    id: 5,
    title: "Comedy Night with Kevin Hart",
    type: "comedy",
    image: "https://source.unsplash.com/random/800x450?comedy",
    date: "May 29, 2023",
    location: "The Comedy Store",
    price: "$35.99",
    rating: 4.6,
    category: "Comedy"
  },
  {
    id: 6,
    title: "Dune: Part Two",
    type: "movie",
    image: "https://source.unsplash.com/random/800x450?sci-fi",
    date: "May 20, 2023",
    location: "IMAX Cinema",
    price: "$15.99",
    rating: 4.7,
    category: "Sci-Fi"
  }
];

// Categories for filter
const categories = [
  { id: "all", name: "All Events", icon: TicketIcon },
  { id: "movie", name: "Movies", icon: getIcon("Film") },
  { id: "concert", name: "Concerts", icon: getIcon("Music") },
  { id: "play", name: "Theater", icon: getIcon("Sparkles") },
  { id: "sports", name: "Sports", icon: getIcon("Trophy") },
  { id: "comedy", name: "Comedy", icon: getIcon("Laugh") }
];

const Home = () => {
  const { userInterests, trackEventView, trackEventBooking, resetPreferences } = useUserPreferences();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const [recommendationExplanations, setRecommendationExplanations] = useState({});
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Generate personalized recommendations based on user interests
  useEffect(() => {
    // Simulate API delay for generating recommendations
    setLoadingRecommendations(true);
    
    setTimeout(() => {
      const recommendations = generateRecommendations(events, userInterests);
      setPersonalizedRecommendations(recommendations.slice(0, 4));
      
      // Create explanation messages for why each event is recommended
      const explanations = recommendations.reduce((acc, event) => {
        acc[event.id] = getRecommendationReason(event, userInterests);
        return acc;
      }, {});
      setRecommendationExplanations(explanations);
      setLoadingRecommendations(false);
    }, 800);
  }, [userInterests]);

  // Filter events based on selected category and search query
  useEffect(() => {
    const filtered = events.filter(event => {
      const matchesCategory = selectedCategory === "all" || event.type === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    
    setFilteredEvents(filtered);
  }, [selectedCategory, searchQuery]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    toast.info(`Showing ${categories.find(c => c.id === categoryId).name}`);
  };

  // Function to determine why an event is being recommended
  const getRecommendationReason = (event, interests) => {
    // If user has no recorded interests yet
    if (Object.keys(interests.categories).length === 0 && 
        Object.keys(interests.types).length === 0) {
      return "Popular in your area";
    }

    // Check if user has interest in this category
    if (interests.categories[event.category] && 
        interests.categories[event.category] > 2) {
      return `Based on your interest in ${event.category}`;
    }

    // Check if user has interest in this type of event
    if (interests.types[event.type] && 
        interests.types[event.type] > 2) {
      return `Because you enjoy ${event.type}s`;
    }

    // Check if user has interest in this location
    if (interests.locations[event.location] && 
        interests.locations[event.location] > 1) {
      return `Events at ${event.location} you might like`;
    }

    return "Recommended for you";
  };

  // Algorithm to generate personalized recommendations
  const generateRecommendations = (allEvents, interests) => {
    // If user has no recorded interests yet, return trending events
    if (Object.keys(interests.categories).length === 0 && 
        Object.keys(interests.types).length === 0 &&
        interests.recentlyViewed.length === 0) {
      return allEvents.sort(() => 0.5 - Math.random());
    }

    // Calculate a score for each event based on user interests
    const scoredEvents = allEvents.map(event => {
      let score = 0;
      
      // Score based on category interest
      if (interests.categories[event.category]) {
        score += interests.categories[event.category] * 2;
      }

      // Score based on event type interest
      if (interests.types[event.type]) {
        score += interests.types[event.type] * 1.5;
      }

      // Score based on location interest
      if (interests.locations[event.location]) {
        score += interests.locations[event.location];
      }

      // Avoid recommending recently viewed events
      if (interests.recentlyViewed.includes(event.id)) {
        score = -1;
      }

      return { event, score };
    });

    // Sort by score and return just the events
    return scoredEvents
      .filter(item => item.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.event);
  };

  // Event card component
  const EventCard = ({ event, isRecommended = false, recommendationReason = "" }) => {
    const { title, image, date, location, price, category, rating } = event;
    const StarIcon = getIcon("Star");
    
    // Track when user views event details by clicking on it
    const handleEventView = () => {
      trackEventView(event);
      toast.info(`Viewing details for ${title}`);
    };
    
    // Track when user books an event (stronger interest signal)
    const handleEventBooking = () => {
      trackEventBooking(event);
      toast.success(`Booking started for ${title}`);
    };
    
    return (
      <motion.div 
        className={`card overflow-hidden flex flex-col w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1rem)] ${isRecommended ? 'ring-2 ring-primary/30' : ''}`}
        onClick={handleEventView}
        whileHover={{ y: -5, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.15)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative overflow-hidden aspect-[16/9]">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
            {isRecommended ? (
              <div className="flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                <span>For You</span>
              </div>
            ) : (
              category
            )}
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded flex items-center">
            <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
            {rating}
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold line-clamp-1 mb-2">{title}</h3>
          <div className="flex items-center text-sm text-surface-500 mb-2">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-sm text-surface-500 mb-4">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span>{location}</span>
          </div>
          
          {isRecommended && recommendationReason && (
            <div className="flex items-center text-xs text-primary mb-3 mt-1">
              <LightbulbIcon className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="italic">{recommendationReason}</span>
            </div>
          )}
          
          <div className="mt-auto flex items-center justify-between">
            <span className="font-bold text-primary">{price}</span>
            <button 
              className="btn-primary text-sm py-1.5"
              onClick={(e) => {
                e.stopPropagation();
                handleEventBooking();
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Featured carousel
  const featuredEvents = events.slice(0, 3);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === featuredEvents.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? featuredEvents.length - 1 : prev - 1));
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-r from-primary-dark via-primary to-secondary">
        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 lg:py-16 relative z-10">
          <div className="text-center text-white mb-8">
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              ShowSpot
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover and book tickets for the best events near you
            </motion.p>
          </div>
          
          {/* Search Bar */}
          <motion.div 
            className="max-w-3xl mx-auto relative mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative flex rounded-xl overflow-hidden shadow-lg">
              <input
                type="text"
                placeholder="Search events, venues, or cities..."
                className="w-full py-4 px-5 pr-12 text-surface-900 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-0 top-0 h-full px-4 flex items-center bg-primary text-white">
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Shape */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 sm:h-16 md:h-20 lg:h-24 text-surface-50 dark:text-surface-900">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>
      
      {/* Featured Events Carousel */}
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Featured Events</h2>
          <div className="relative overflow-hidden rounded-xl">
            <div className="relative bg-surface-800 aspect-[21/9] overflow-hidden">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className={`absolute inset-0 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: index === currentSlide ? 1 : 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="flex items-center text-white/90">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-white/90">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button className="w-max btn-primary" onClick={() => toast.success(`Booking started for ${event.title}`)}>
                      <span onClick={(e) => {
                        e.stopPropagation();
                        trackEventBooking(event);
                      }}>Book Tickets</span>
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {/* Navigation Buttons */}
              <button 
                onClick={prevSlide} 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 focus:outline-none z-10"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={nextSlide} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 focus:outline-none z-10"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              
              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {featuredEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? "bg-white w-6" 
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Category Navigation */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 sm:space-x-4 pb-2">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center space-x-2 transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary text-white shadow-soft"
                      : "bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700"
                  }`}
                >
                  <CategoryIcon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Main Feature Component */}
        <MainFeature />
        
        {/* Personalized Recommendations Section */}
        <div className="my-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center">
              <SparklesIcon className="w-6 h-6 mr-2 text-primary" />
              For You
            </h2>
            <button
              onClick={resetPreferences}
              className="text-sm text-surface-500 hover:text-primary flex items-center"
            >
              <RefreshCwIcon className="w-4 h-4 mr-1" />
              Reset Preferences
            </button>
          </div>
          
          {loadingRecommendations ? (
            <div className="py-12 text-center">
              <RefreshCwIcon className="w-10 h-10 mx-auto animate-spin text-primary opacity-70" />
              <p className="mt-4 text-surface-500">Generating personalized recommendations...</p>
            </div>
          ) : personalizedRecommendations.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {personalizedRecommendations.map((event) => (
                <EventCard 
                  key={`rec-${event.id}`} 
                  event={event} 
                  isRecommended={true} 
                  recommendationReason={recommendationExplanations[event.id]}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-surface-500">We'll personalize recommendations as you browse events.</p>
          )}
        </div>
        
        {/* All Events Listings */}
        <div className="my-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Upcoming Events</h2>
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface-100 dark:bg-surface-800 p-8 rounded-xl max-w-md mx-auto"
              >
                <SearchIcon className="w-12 h-12 mx-auto mb-4 text-surface-400" />
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-surface-500">
                  Try changing your search or filter criteria
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-surface-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ShowSpot</h3>
              <p className="text-surface-300">
                Your one-stop platform for discovering and booking tickets to the best events in your city.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                {["Facebook", "Twitter", "Instagram", "Youtube"].map((social) => {
                  const SocialIcon = getIcon(social);
                  return (
                    <a 
                      key={social} 
                      href="#" 
                      className="bg-surface-700 p-2 rounded-full hover:bg-primary transition-colors"
                      aria-label={social}
                    >
                      <SocialIcon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="border-t border-surface-700 mt-8 pt-8 text-center text-surface-400">
            <p>© {new Date().getFullYear()} ShowSpot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;