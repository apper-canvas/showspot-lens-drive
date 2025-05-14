/**
 * User Interest Service - Handles user interest tracking API operations
 */

const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Fetch interests for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const fetchUserInterests = async (userId) => {
  try {
    if (!userId) throw new Error("User ID is required");
    
    const apperClient = getApperClient();
    
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "user_id" } },
        { Field: { Name: "category" } },
        { Field: { Name: "interest_type" } },
        { Field: { Name: "interest_value" } },
        { Field: { Name: "interest_score" } }
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
          field: "interest_score",
          direction: "desc"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords("user_interest", params);
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching user interests for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Record or update a user interest
 * @param {string} userId - User ID
 * @param {string} interestType - Type of interest (category, event_type, location)
 * @param {string} interestValue - Value of the interest
 * @param {number} scoreIncrement - How much to increment interest score
 * @returns {Promise<Object>}
 */
export const recordUserInterest = async (userId, interestType, interestValue, scoreIncrement = 1) => {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!interestType) throw new Error("Interest type is required");
    if (!interestValue) throw new Error("Interest value is required");
    
    const apperClient = getApperClient();
    
    // First check if this interest already exists
    const existingParams = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "interest_score" } }
      ],
      where: [
        {
          fieldName: "user_id",
          operator: "ExactMatch",
          values: [userId]
        },
        {
          fieldName: "interest_type",
          operator: "ExactMatch",
          values: [interestType]
        },
        {
          fieldName: "interest_value",
          operator: "ExactMatch",
          values: [interestValue]
        },
        {
          fieldName: "IsDeleted",
          operator: "ExactMatch",
          values: [false]
        }
      ]
    };
    
    const existingResponse = await apperClient.fetchRecords("user_interest", existingParams);
    
    if (existingResponse.data && existingResponse.data.length > 0) {
      // Update existing interest
      const existingInterest = existingResponse.data[0];
      const newScore = (existingInterest.interest_score || 0) + scoreIncrement;
      
      const response = await apperClient.updateRecord("user_interest", {
        record: {
          Id: existingInterest.Id,
          interest_score: newScore
        }
      });
      
      return response.data;
    } else {
      // Create new interest
      const interestData = {
        Name: `${interestType}-${interestValue}`,
        user_id: userId,
        category: interestType === 'category' ? interestValue : null,
        interest_type: interestType,
        interest_value: interestValue,
        interest_score: scoreIncrement
      };
      
      const response = await apperClient.createRecord("user_interest", {
        record: interestData
      });
      
      return response.data;
    }
  } catch (error) {
    console.error(`Error recording user interest for user ${userId}:`, error);
    throw error;
  }
};