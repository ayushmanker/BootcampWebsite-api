//Controllers are the files that control the functions of the routes
//We will define the function of the routes in these controller functions and call it form the router folder

// The following function taking  3 parameters are req,res,next is a middleware function that has access to the response-request cycle and can run between the request and response process.

//importing model in the bootcamp routes
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// to find the extension of the file (photo)
const path = require('path');

//@desc   Get all bootcamps
//@route  Get /api/v1/bootcamps
//@access Public
// exports.getBootcamps = async (req, res, next) => {
//   try {
//     const bootcamps = await Bootcamp.find();
//     //.find() will give all the bootcamps

//     res.status(200).json({
//       success: true,
//       count: bootcamps.length,
//       data: bootcamps,
//     });
//   } catch (err) {
//     res.status(404).json({ success: false });
//   }
// };
//below code using async/await expressjs to remove try catch
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // console.log(req.query);

  //to filter bootcamp with lte,gte etc or for searching in list ex. careers.
  // let query;
  // //copy req.query
  // const reqQuery = { ...req.query };

  // //Fields to exclude
  // const removeFields = ['select', 'sort', 'page', 'limit'];

  // //Loop over removeFields and delete them from reqQuery
  // removeFields.forEach((param) => delete reqQuery[param]);
  // // console.log(reqQuery);
  // //Create query string
  // let queryStr = JSON.stringify(reqQuery);
  // // console.log(queryStr);

  // //create operators ($gt, $gte,etc)
  // queryStr = queryStr.replace(
  //   /\b(gt|gte|lt|lte|in)\b/g,
  //   (match) => `$${match}`
  // ); //in operator here will search a list, and g will look for all of it not only the first one find

  // // Finding resource
  // query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // //Select Fields
  // if (req.query.select) {
  //   const fields = req.query.select.split(',').join(' ');
  //   // console.log(fields);
  //   query = query.select(fields);
  // }

  // //Sort
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  //   //default sort on the basis of createdAT time
  //   query = query.sort('-createdAt');
  // }
  // //Pagination
  // const page = parseInt(req.query.page, 10); //10 is regix i.e. conversion of decimal no. string to interger.
  // const limit = parseInt(req.query.limit, 10) || 25;
  // const startIndex = (page - 1) * limit;
  // const endIndex = page * limit;
  // const total = await Bootcamp.countDocuments(); //countDocuments is used to count the total no. of bootcamps
  // query = query.skip(startIndex).limit(limit);

  // //executing query
  // const bootcamps = await query;

  // //Pagination result
  // const pagination = {};
  // if (endIndex < total) {
  //   pagination.next = {
  //     page: page + 1,
  //     limit, // limit: limit
  //   };
  // }

  // if (startIndex > 0) {
  //   pagination.prev = {
  //     page: page - 1,
  //     limit,
  //   };
  // }
  // const bootcamps = await Bootcamp.find(req.query);
  //.find() will give all the bootcamps

  res.status(200).json(res.advancedResults);
});

//@desc   Get single bootcamp
//@route  Get /api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  //to check if the id is formatted correctly
  if (!bootcamp) {
    // return next(err); it gives ReferenceError when length of id is same but different number
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  //if  we have two res.status.... in the block it will give an error, so we will put return in front of the first one. err; headers are only send if we dont do that

  res.status(200).json({ success: true, data: bootcamp });
  // } catch (err) {
  // console.log(err);
  // res.status(400).json({ success: false });
  // next(err); //this will return a html file having error to the client side, but what we want is to send a json object. So we will make a middleware errorHandler in error.js
  // next(
  //   new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  // ); it will give caste error if we dont pass it through middleware
  // next(err);
  // }
});

//@desc   Create new bootcamp
//@route  POST /api/v1/bootcamps
//@access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;

  //check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  //If the user is not an admin,they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has alredy published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});
//@desc   Update bootcamp
//@route  PUT /api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404);
  }

  //Make sure the user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp `,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runvalidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc   Delete bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  //now we are using middleware that will be triggered by remove method
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404);
  }

  //Make sure the user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this bootcamp `,
        401
      )
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

//by using geocoder
//@desc Get bootcamps within a radius
//@route Get /api/v1/bootcamps/radius/:zipcode/:distance
//@access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calc radius using radians
  //divivde dist by radius of earth
  //earth radius = 3,963 miles /6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//Filtering:- if we want to return bootcamp on the basis of certain limitation, provided by the client so we use express req.query
//We will edit getbootcamps
//{{URL}}/api/v1/bootcamps?location.state=MA&housing=true by passing req.query in the find of Bootcamp.find()

//to do lte gte gt lt and etc for that we need to do smthing else
//{{URL}}/api/v1/bootcamps?averageCost[lte]=1000 it returns an object without $ sign so we have to add a $ sign in front of the lte or gt in the object and pass through the find.

//bcs of in operator in regular expression
//{{URL}}/api/v1/bootcamps?careers[in]=Business

//we can select only certain fields form the database by using select command in query of url
//by passing the filds to query.select()
//the fields must be space seperated instead of comma

//As we do select, we can do sorting by using sort(on what basic u want to sort, -1 or 1) 1 for ascending and -1 for descending

//Pagination :- how many resources will be visible on a page and next and previous page
//{{URL}}/api/v1/bootcamps?page=2&limit=2
// page is page.no. and limit is how many resources can be on same page

//@desc   Upload photo for bootcamp
//@route  PUT /api/v1/bootcamps/:id/photo
//@access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure the user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp `,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;
  // console.log(req.files.file);
  //Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload a image file `, 400));
  }

  //Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
        400
      )
    );
  }

  //Create custom filename and add it to the custom directory
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  //mv means move
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
