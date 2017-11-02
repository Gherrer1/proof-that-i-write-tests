module.exports = {
  signup: {
    fname: { max: 20, regex: /[0-9!@#$%^&*()_+=\[\]{};:"\\|,<>\/?]/ },
    username: { min: 5, max: 12, regex: /^[a-zA-Z]+[a-zA-Z0-9.]*$/ },
    password: { min: 8, max: 100 }
  },
  models: { User: {}, Listing: {} }
};
