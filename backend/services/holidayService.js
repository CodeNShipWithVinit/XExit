const axios = require('axios');

class HolidayService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://calendarific.com/api/v2';
    this.cache = new Map(); // Simple cache to avoid redundant API calls
  }

  async getHolidays(country, year) {
    const cacheKey = `${country}-${year}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/holidays`, {
        params: {
          api_key: this.apiKey,
          country: country,
          year: year
        }
      });

      if (response.data && response.data.response && response.data.response.holidays) {
        const holidays = response.data.response.holidays;
        this.cache.set(cacheKey, holidays);
        return holidays;
      }

      return [];
    } catch (error) {
      console.error('Error fetching holidays from Calendarific:', error.message);
      // If API fails, return empty array to not block the application
      return [];
    }
  }

  async isHoliday(date, country) {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    
    const holidays = await this.getHolidays(country, year);
    
    // Format date as YYYY-MM-DD
    const dateStr = dateObj.toISOString().split('T')[0];
    
    // Check if the date matches any holiday
    return holidays.some(holiday => {
      return holiday.date.iso === dateStr;
    });
  }

  isWeekend(date) {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  async isValidResignationDate(date, country) {
    // Check if it's a weekend
    if (this.isWeekend(date)) {
      return {
        valid: false,
        reason: 'The date falls on a weekend'
      };
    }

    // Check if it's a holiday
    const isHolidayDate = await this.isHoliday(date, country);
    if (isHolidayDate) {
      return {
        valid: false,
        reason: 'The date falls on a public holiday'
      };
    }

    return {
      valid: true,
      reason: null
    };
  }
}

module.exports = HolidayService;
