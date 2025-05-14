/**
 * Event Service - Handles all event-related API operations
 */

const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Fetch events with optional filtering
 * @param {Object} filters - Optional filter parameters
 * @param {string} filters.category - Filter by category
 * @param {string} filters.type - Filter by event type
 * @param {string} filters.searchQuery - Search text
 * @param {boolean} filters.featured - Filter for featured events
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of records per page
 * @returns {Promise<{data: Array, total: number}>}
 */
export const fetchEvents = async (filters = {}, page = 0, limit = 20) => {
  try {
    const apperClient = getApperClient();
    
    const whereConditions = [];
    
    // Add filter for non-deleted records
    whereConditions.push({
      fieldName: "IsDeleted",
      operator: "ExactMatch",
      values: [false]
    });
    
    // Add category filter if provided
    if (filters.category && filters.category !== 'all') {
      whereConditions.push({
        fieldName: "category",
        operator: "ExactMatch",
        values: [filters.category]
      });
    }
    
    // Add type filter if provided
    if (filters.type && filters.type !== 'all') {
      whereConditions.push({
        fieldName: "type",
        operator: "ExactMatch",
        values: [filters.type]
      });
    }
    
    // Add featured filter if provided
    if (filters.featured === true) {
      whereConditions.push({
        fieldName: "featured",
        operator: "ExactMatch",
        values: [true]
      });
    }
    
    // Add search query if provided
    if (filters.searchQuery) {
      const searchValue = filters.searchQuery.trim();
      if (searchValue) {
        whereConditions.push({
          fieldName: "title",
          operator: "Contains",
          values: [searchValue]
        });
      }
    }
    
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "title" } },
        { Field: { Name: "type" } },
        { Field: { Name: "image" } },
        { Field: { Name: "date" } },
        { Field: { Name: "location" } },
        { Field: { Name: "price" } },
        { Field: { Name: "rating" } },
        { Field: { Name: "category" } },
        { Field: { Name: "featured" } }
      ],
      where: whereConditions,
      orderBy: [
        {
          field: "date",
          direction: "asc"
        }
      ],
      pagingInfo: {
        limit: limit,
        offset: page * limit
      }
    };
    
    const response = await apperClient.fetchRecords("event", params);
    
    return {
      data: response.data || [],
      total: response.totalCount || 0
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

/**
 * Fetch a single event by ID
 * @param {number} eventId - Event ID
 * @returns {Promise<Object>}
 */
export const fetchEventById = async (eventId) => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.getRecordById("event", eventId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>}
 */
export const createEvent = async (eventData) => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.createRecord("event", {
      record: eventData
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

/**
 * Update an existing event
 * @param {number} eventId - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>}
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.updateRecord("event", {
      record: { Id: eventId, ...eventData }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    throw error;
  }
};