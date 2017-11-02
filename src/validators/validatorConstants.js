module.exports = {
  signup: {
    fname: { max: 20, regex: /[0-9!@#$%^&*()_+=\[\]{};:"\\|,<>\/?]/ },
    username: { min: 5, max: 12, regex: /^[a-zA-Z]+[a-zA-Z0-9.]*$/ },
    password: { min: 8, max: 100 }
  },
  models: { User: {}, Listing: {} },
  user: {
    fname: { max: 20, regex: /[0-9!@#$%^&*()_+=\[\]{};:"\\|,<>\/?]/ }, // if this matches, thats bad
    username: { min: 5, max: 12, regex: /^[a-zA-Z]+[a-zA-Z0-9.]*$/ }, // if this matches, thats good
    password: {
      signup: { min: 8, max: 100 },
      model: { max: 100 }
    }
  }
};
