module.exports = {
  user: {
    fname: { max: 20, regex: /^[^0-9!@#$%^&*()_+=\[\]{};:"\\|,<>\/?]+$/ }, // if this matches, thats good
    username: { min: 5, max: 12, regex: /^[a-zA-Z]+[a-zA-Z0-9_]*$/ }, // if this matches, thats good
    password: {
      signup: { min: 8, max: 100 },
      model: { max: 100 }
    },
    email: { max: 75 }
  },
  listing: {
    typeEnum: require('../models/listingConstants').typeEnum,
    langEnum: require('../models/listingConstants').langEnum
  }
};

// old fnam regex: /[0-9!@#$%^&*()_+=\[\]{};:"\\|,<>\/?]/
