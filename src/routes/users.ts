import Router from 'express';

const router = Router();
const users_controller = require('../controllers/users');

// Create a user account
router.post('/', users_controller.users_create_post);

// Remove existing User list and populate with demo data
router.post('/reset-users', users_controller.users_reset_post);

// Get all usersList
router.get('/', users_controller.users_list_get);

// Get a single user
router.get('/:id', users_controller.users_detail_get);

// Update an existing user
router.put('/:id', users_controller.users_update_put);

// Delete User
router.delete('/:id', users_controller.users_remove_delete);

export default router;