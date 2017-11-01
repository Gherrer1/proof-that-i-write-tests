module.exports = {
  signup: {
    fname: { max: 20, regex: /^/ },
    username: { min: 5, max: 12, regex: /^/ },
    email: { max: 40 },
    password: { min: 8, max: 100 }
  },
  models: { User: {}, Listing: {} }
};
