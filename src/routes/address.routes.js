const express = require('express');
const router = express.Router();

const addressController = require('../controllers/address.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createAddressSchema, updateAddressSchema } = require('../validations/address.validation');

router.use(auth); // All address routes require auth

router.get('/', addressController.getAddresses);
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.put('/:id', validate(updateAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/set-default', addressController.setDefaultAddress);

module.exports = router;
