/**
 * Recently Viewed Service - Handles recently viewed events tracking
 */

const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Record a user viewing an event
 * @param {string} userId - User ID
 * @param {number} eventId - Event ID that was viewed
 * @returns {Promise<Object>}
 */
export const recordEventView = async (userId, eventId) => {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!eventId) throw new Error("Event ID is required");
    
    const apperClient = getApperClient();
    
    // Check if this view already exists
    const existingParams = {
      Fields: [
        { Field: { Name: "Id" } }
      ],
      where: [
        {
          fieldName: "user_id",
          operator: "ExactMatch",
          values: [userId]
        },
        {
          fieldName: "event_id",
          operator: "ExactMatch",
          values: [eventId]
        },
        {
          fieldName: "IsDeleted",
          operator: "ExactMatch",
          values: [false]
        }
      ]
    };
    
    const existingResponse = await apperClient.fetchRecords("recently_viewed", existingParams);
    
    if (existingResponse.data && existingResponse.data.length > 0) {
      // Update existing record with new timestamp
      const existingView = existingResponse.data[0];
      
      const response = await apperClient.updateRecord("recently_viewed", {
        record: {
          Id: existingView.Id,
          viewed_at: new Date().toISOString()
        }
      });
      
      return response.data;
    } else {
      // Create new recently viewed record
      const viewData = {
        Name: `View-${eventId}-${userId}`,
        user_id: userId,
        event_id: eventId,
        viewed_at: new Date().toISOString()
      };
      
      const response = await apperClient.createRecord("recently_viewed", {
        record: viewData
      });
      
      return response.data;
    }
  } catch (error) {
    console.error(`Error recording event view for user ${userId}, event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Fetch recently viewed events for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>}
 */
export const fetchRecentlyViewedEvents = async (userId, limit = 10) => {
  try {
    if (!userId) throw new Error("User ID is required");
    
    const apperClient = getApperClient();
    
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "user_id" } },
        { Field: { Name: "event_id" } },
        { Field: { Name: "viewed_at" } }
      ],
      where: [
        {
          fieldName: "user_id",
          operator: "ExactMatch",
          values: [userId]
        },
        {
          fieldName: "IsDeleted",
          operator: "ExactMatch",
          values: [false]
        }
      ],
      orderBy: [
        {
          field: "viewed_at",
          direction: "desc"
        }
      ],
      pagingInfo: {
        limit: limit,
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords("recently_viewed", params);
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching recently viewed events for user ${userId}:`, error);
    throw error;
  }
};