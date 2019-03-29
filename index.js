const app = require('./app');
const database = require('./root/database');
const cfg = require('./root/cfg');

database()
.then(() =>  {
  console.log('MongoDB connected...');
  app.listen(cfg.port, () => {
    console.log(`Server has been started on port ${cfg.port}`);
  });
})
.catch(err => console.error(err));
