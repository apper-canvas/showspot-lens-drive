/**
 * Booking Service - Handles booking-related API operations
 */

const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Create a new booking
 * @param {string} userId - User ID
 * @param {number} eventId - Event ID
 * @returns {Promise<Object>}
 */
export const createBooking = async (userId, eventId) => {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!eventId) throw new Error("Event ID is required");
    
    const apperClient = getApperClient();
    
    const bookingData = {
      Name: `Booking-${eventId}-${userId}`,
      user_id: userId,
      event_id: eventId,
      booking_date: new Date().toISOString(),
      status: "pending"
    };
    
    const response = await apperClient.createRecord("booking", {
      record: bookingData
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error creating booking for user ${userId}, event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Update booking status
 * @param {number} bookingId - Booking ID
 * @param {string} status - New status (pending, confirmed, cancelled)
 * @returns {Promise<Object>}
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    if (!bookingId) throw new Error("Booking ID is required");
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      throw new Error("Invalid status. Must be pending, confirmed, or cancelled");
    }
    
    const apperClient = getApperClient();
    
    const response = await apperClient.updateRecord("booking", {
      record: {
        Id: bookingId,
        status: status
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating booking status for booking ${bookingId}:`, error);
    throw error;
  }
};

/**
 * Fetch user bookings
 * @param {string} userId - User ID
 * @param {string} status - Optional filter by status
 * @returns {Promise<Array>}
 */
export const fetchUserBookings = async (userId, status = null) => {
  try {
    if (!userId) throw new Error("User ID is required");
    
    const apperClient = getApperClient();
    
    // Setup where conditions
    const whereConditions = [
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
    ];
    
    // Add status filter if provided
    if (status && ["pending", "confirmed", "cancelled"].includes(status)) {
      whereConditions.push({
        fieldName: "status",
        operator: "ExactMatch",
        values: [status]
      });
    }
    
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "user_id" } },
        { Field: { Name: "event_id" } },
        { Field: { Name: "booking_date" } },
        { Field: { Name: "status" } }
      ],
      where: whereConditions,
      orderBy: [
        {
          field: "booking_date",
          direction: "desc"
        }
      ]
    };
    
    // Add expands to include event details
    params.expands = [
      {
        name: "event_id",
        alias: "event",
        fields: ["Id", "title", "date", "location", "image", "price"]
      }
    ];
    
    const response = await apperClient.fetchRecords("booking", params);
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Cancel booking
 * @param {number} bookingId - Booking ID
 * @returns {Promise<Object>}
 */
export const cancelBooking = async (bookingId) => {
  return updateBookingStatus(bookingId, "cancelled");
};