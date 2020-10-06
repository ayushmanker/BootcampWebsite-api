const express = require('express');
const dotenv = require('dotenv');
// const { response } = require('express');
const colors = require('colors');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

//Load env vars
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

//Route Files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

//To use req.body from the bootcamp routes
//Body Parser (a middleware)
app.use(express.json());

//Cookie parser
app.use(cookieParser());

// express and mongoose has thier own type of middleware
//this is a simple logger middlerware (it is express middleware)
// const logger = (req, res, next) => {
//   req.hello = 'Hello World'; //we can access to this var in any routes
//   console.log('Middleware ran');
//   next(); //it tells to go to the next middleware in the cycle, that is being passed to this middelware as third argument
// };

// app.use(logger);
//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //different parameter will print different things as here dev will print the method and whole url in console
}

//File uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Set public as static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);
//middlerwares must be use in one after another bcs it executes in linear form.
// Using express makes it easy to response and request as it automatically detects the headers and the content type that we are gona return to the client
//X-powered-By express and the content type is text/html
// app.get('/', (req, res) => {
// res.send('Hello from express');
// res.send('<h1>Hello from express<h1>');
// res.send({ name: 'Brad' }); //we dont need to do JSON.stringify, and content-type application/json
// res.sendStatus(400); //Bad request

// res.status(400).json({ success: false });
//it is gona send a status with a json object

// res.status(200).json({ success: true, data: { id: 1 } });
// });

//We are gona have the url as / => /api/v1/bootcamps bcs we are going to have bootcamps,reviews, users etc and there will be more versions of the api if required in future so this will be version one as v1.
// app.get('/api/v1/bootcamps', (req, res) => {
//   res.status(200).json({ success: true, msg: 'Show all bootcamps' });
// });

// app.get('/api/v1/bootcamps/:id', (req, res) => {
//   res
//     .status(200)
//     .json({ success: true, msg: `show bootcamp ${req.params.id}` });
// });

// app.post('/api/v1/bootcamps', (req, res) => {
//   res.status(200).json({ success: true, msg: 'Create new bootcamp' });
// });

// app.put('/api/v1/bootcamps/:id', (req, res) => {
//   res
//     .status(200)
//     .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
// });

// app.delete('/api/v1/bootcamps/:id', (req, res) => {
//   res
//     .status(200)
//     .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
// });

const PORT = process.env.PORT || 5000; //to use the environment variables we have to write process.env. in front of the var and can be accessed from anywhere in the server.js
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle unhandled promise rejections i.e. if we put the wrong password in the environment var so it will give error and close the server while the application still works
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  server.close(() => process.exit(1));
});

// node_env in config.env may be development or testing or production.
//we have scripts in package.json start and dev with different purpose
//GET,PUT,POST,DELETE are all called routes

//CORS is a good package to make our api public i.e. if we dont install cors in our server.js and use it ,so we will get an error when we want access our api through different domains.
// So if we want to make our api public so we need install cors.
//I havent install it till now for more details see last lecture of api securtiy folder(10)
