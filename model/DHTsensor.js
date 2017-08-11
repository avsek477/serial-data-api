const mongoose = require('mongoose');
const schema = mongoose.Schema;
var tempHumData = new schema({
    humidity: {
      type: String,
      trim: true
    },
    temperature: {
      type: String,
      trim: true
    },
    co: {
      type: String,
      trim: true
    },
    co2: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: new Date()
    }
})

module.exports = mongoose.model('TempHum', tempHumData, 'TempHum');
