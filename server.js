const express = require('express');
const dotenv = require('dotenv');

//Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

const PORT = process.env.PORT || 5000; //to use the environment variables we have to write process.env. in front of the var and can be accessed from anywhere in the server.js
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// node_env in config.env may be development or testing or production.
//we have scripts in package.json start and dev with different purpose
