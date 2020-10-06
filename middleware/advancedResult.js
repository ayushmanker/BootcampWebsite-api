const { populate } = require('../models/Bootcamp');

const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  // console.log(reqQuery);
  //Create query string
  let queryStr = JSON.stringify(reqQuery);
  // console.log(queryStr);

  //create operators ($gt, $gte,etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  ); //in operator here will search a list, and g will look for all of it not only the first one find

  // Finding resource
  query = model.find(JSON.parse(queryStr));

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    // console.log(fields);
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    //default sort on the basis of createdAT time
    query = query.sort('-createdAt');
  }
  //Pagination
  const page = parseInt(req.query.page, 10); //10 is regix i.e. conversion of decimal no. string to interger.
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(); //countDocuments is used to count the total no. of bootcamps
  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //executing query
  const results = await query;

  //Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit, // limit: limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.lenght,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResults;
