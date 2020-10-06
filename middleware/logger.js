//We have actual 3rd party middleware logger called morgan we will use that

//@desc  logs request to console
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  );
  next();
};
module.exports = logger;
// req.method gives GET PUT PUSH or DELETE
//req.protocol gives http i.e. hyper text transfer protocol
//req.get(host) gives localhost:5000 i.e. name and port
//req.originalUrl gives our route i.e. /api/v1/bootcamps etc.
