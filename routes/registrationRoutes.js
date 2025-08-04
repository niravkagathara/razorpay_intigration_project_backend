// routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const { registerTeam, getTeamStatus } = require('../controllers/registrationController');

router.post('/', registerTeam);
router.post('/status', getTeamStatus);

module.exports = router;
