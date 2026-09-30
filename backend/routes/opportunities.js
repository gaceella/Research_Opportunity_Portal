const express = require('express');
const router = express.Router();
const controller = require('../controllers/opportunitiesController');

router.post('/', controller.createOpportunity);
router.get('/', controller.getAllOpportunities);
router.get('/:id', controller.getOpportunityById);
router.put('/:id', controller.updateOpportunity);
router.delete('/:id', controller.deleteOpportunity);

module.exports = router;
