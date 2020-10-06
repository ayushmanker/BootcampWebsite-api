const express = require('express');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');

const User = require('../models/User');

const advancedResult = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResult');

const router = express.Router({ mergeParams: true }); //mergeParams is imp to implement the route from other router, to execute here

//we have an easy way of writing protect and authorize in every route by using it
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
