require("dotenv").config();
const express = require("express");
const cors = require('cors');
const { default: configViewEngine } = require("./configs/viewEngine");
const connection = require('./configs/database');
const bodyParser = require('body-parser');
const path = require('path');

import authRoute from './router/auth.js'
import appointmentRoute from './router/appointment.js';
import serviceRoute from './router/service.js';
import storeRoute from './router/store.js';
import userRoute from './router/user.js';
import staffRoute from './router/staff.js';

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


configViewEngine(app);

app.get("/", (req, res) => {
  res.status(200).send("<h1>Hello World!</h1>");
});
app.get("/html", (req, res) => {
  res.render('index.ejs')
});

app.get("/hello", (req, res) => {
  res.set("Content-Type", "text/html");
  res.status(200).send("<h1>Hello GFG Learner!</h1>");
});

app.use('/store', express.static('src/public/store'));
app.use('/service', express.static('src/public/service'));

app
.use('/api/auth', authRoute)
.use('/api/appointment', appointmentRoute)
.use('/api/service', serviceRoute)
.use('/api/store', storeRoute)
.use('/api/user', userRoute)
.use('/api/staff', staffRoute);

app.use('/*', async (req, res) => {
  res.status(501).send("Don't implement.");
});


(async () => {
  try {
      //using mongoose
      await connection();

      app.listen(port, () => {
          console.log(`Backend Nodejs App listening on port ${port}`)
      })
  } catch (error) {
      console.log(">>> Error connect to DB: ", error)
  }
})()


