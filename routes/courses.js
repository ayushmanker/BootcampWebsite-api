const express = require('express');

const Course = require('../models/Course');
const advancedResult = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router({ mergeParams: true }); //mergeParams is imp to implement the route from other router, to execute here

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

router
  .route('/')
  .get(
    advancedResult(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), addCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
