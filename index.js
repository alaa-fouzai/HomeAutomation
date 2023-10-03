const express = require("express");
const app = express();
var cors = require('cors')
const bodyParser = require('body-parser');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require('./swagger-output.json')
const mongoose = require('mongoose');
require('dotenv/config');
const Switch = require('./Routes/switch.js');
const user = require('./Routes/user.js');
const house = require('./Routes/house.js');
const room = require('./Routes/room.js');
const hub = require('./Routes/hub.js');
const contact = require('./Routes/contactSensor');


app.use(cors());
app.use(bodyParser.json());


mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/Switch', Switch);
app.use('/api/users', user);
app.use('/api/house', house);
app.use('/api/room', room);
app.use('/api/hub', hub);
app.use('/api/contactSensor', contact);

app.get("/", (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, { explorer: true })
);

app.listen(process.env.port, () => {
  console.log(`Back End listening on port ${process.env.port}!`);
});