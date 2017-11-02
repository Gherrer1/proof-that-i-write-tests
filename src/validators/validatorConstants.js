module.exports = {
  signup: {
    fname: { max: 20, regex: /[0-9!@#$%^&*()_+\-=\[\]{};:"\\|,<>\/?]/ },
    username: { min: 5, max: 12, regex: /^/ },
    password: { min: 8, max: 100 }
  },
  models: { User: {}, Listing: {} }
};
