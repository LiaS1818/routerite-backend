// services/ItineraryService.js
const { Itinerary, Activity } = require('../models');

class ItineraryService {
  static async getItineraryWithActivities(itineraryId) {
    try {
      const itinerary = await Itinerary.findByPk(itineraryId, {
        include: [
          {
            model: Activity,
            as: 'activities',
            attributes: ['id', 'name', 'day', 'type'],
            order: [['day', 'ASC']],
          },
        ],
      });

      if (!itinerary) {
        throw new Error('Itinerary not found');
      }

      // Agrupamos por día si quieres que quede más ordenado
      const groupedActivities = itinerary.activities.reduce((acc, activity) => {
        if (!acc[activity.day]) acc[activity.day] = [];
        acc[activity.day].push(activity);
        return acc;
      }, {});

      return {
        id: itinerary.id,
        name: itinerary.name,
        description: itinerary.description,
        days: groupedActivities, // 🔑 ya organizado por días
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ItineraryService;
