const express = require("express");
const app = express();
var cors = require('cors')
const bodyParser= require('body-parser');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const mongoose=require('mongoose');
require('dotenv/config');
const LightSwitch = require('./Routes/lightswitch.js');
const user = require('./Routes/user.js');
const house = require('./Routes/house.js');
const room = require('./Routes/room.js');

app.use(cors());
app.use(bodyParser.json());


mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser: true , useUnifiedTopology: true });

app.use('/api/LightSwitch',LightSwitch);
app.use('/api/users',user);
app.use('/api/house',house);
app.use('/api/room',room);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Smart house Express API with Swagger",
      version: "0.0.1",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "smart house",
        url: "test",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./Routes/*.js","./Models/*.js"],
};

const specs = swaggerJsdoc(options);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.listen(process.env.port, () => {
  console.log(`Example app listening on port ${process.env.port}!`);
});