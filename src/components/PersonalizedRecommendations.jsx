import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUserPreferences } from "../context/UserPreferencesContext";
import getIcon from "../utils/iconUtils";

const LightbulbIcon = getIcon("Lightbulb");
const RefreshCwIcon = getIcon("RefreshCw");

// This component displays personalized event recommendations based on user interests
const PersonalizedRecommendations = ({ allEvents }) => {
  const { userInterests } = useUserPreferences();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState({});

  // Calculate recommendations whenever user interests or available events change
  useEffect(() => {
    if (!allEvents || allEvents.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Simulate API delay for realistic behavior
    setTimeout(() => {
      const personalized = generateRecommendations(allEvents, userInterests);
      setRecommendations(personalized.recommendations);
      setExplanations(personalized.explanations);
      setLoading(false);
    }, 600);
  }, [allEvents, userInterests]);

  // Algorithm to generate personalized recommendations and explanations
  const generateRecommendations = (events, interests) => {
    // Skip personalization if no interests are recorded yet
    const hasInterests = Object.values(interests).some(
      category => Object.keys(category).length > 0
    );

    if (!hasInterests && interests.recentlyViewed.length === 0) {
      // Return random recommendations when no preference data exists
      const randomRecommendations = [...events]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      return {
        recommendations: randomRecommendations,
        explanations: randomRecommendations.reduce((acc, event) => {
          acc[event.id] = "New and trending events you might enjoy";
          return acc;
        }, {})
      };
    }

    // Calculate scores for each event based on user interests
    const scoredEvents = events.map(event => {
      let score = 0;
      let explanation = [];

      // Score based on category interest
      if (interests.categories[event.category]) {
        const categoryScore = interests.categories[event.category] * 2;
        score += categoryScore;
        if (categoryScore > 3) {
          explanation.push(`Based on your interest in ${event.category} events`);
        }
      }

      // Score based on event type interest
      if (interests.types[event.type]) {
        const typeScore = interests.types[event.type] * 1.5;
        score += typeScore;
        if (typeScore > 4 && explanation.length === 0) {
          explanation.push(`Because you like ${event.type}s`);
        }
      }

      // Score based on location interest
      if (interests.locations[event.location]) {
        const locationScore = interests.locations[event.location];
        score += locationScore;
        if (locationScore > 2 && explanation.length === 0) {
          explanation.push(`Events at ${event.location} you might enjoy`);
        }
      }

      // Exclude recently viewed items
      if (interests.recentlyViewed.includes(event.id)) {
        score = -1; // Negative score to filter out
      }

      return { event, score, explanation: explanation[0] || "Recommended for you" };
    });

    // Sort by score and pick top 4
    const topRecommendations = scoredEvents
      .filter(item => item.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.event);

    // Create explanations object
    const eventExplanations = scoredEvents.reduce((acc, { event, explanation }) => {
      acc[event.id] = explanation;
      return acc;
    }, {});

    return { recommendations: topRecommendations, explanations: eventExplanations };
  };

  if (loading) {
    return <div className="w-full py-8 text-center"><RefreshCwIcon className="w-8 h-8 mx-auto animate-spin text-primary opacity-70" /></div>;
  }

  return recommendations.length > 0 ? { 
    recommendations,
    explanations
  } : {
    recommendations: [],
    explanations: {}
  };
};

export default PersonalizedRecommendations;