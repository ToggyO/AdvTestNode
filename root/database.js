const cfg = require('./cfg');
const mongoose = require('mongoose');

module.exports = () => {
 return  mongoose.connect(cfg.mongoURI, { useNewUrlParser: true });
};
