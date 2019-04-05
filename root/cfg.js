module.exports = {
  port: process.env.PORT || 3000,
  mongoURI: "mongodb+srv://Oleg:999666333@testcluster-sn45m.mongodb.net/AdvTestNode?retryWrites=true",
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
};
