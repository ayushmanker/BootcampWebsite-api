const express = require('express');

const Review = require('../models/Review');
const advancedResult = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router({ mergeParams: true }); //mergeParams is imp to implement the route from other router, to execute here

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

router
  .route('/')
  .get(
    advancedResult(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
