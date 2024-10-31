import Router from 'express';

const router = Router();
const users_controller = require('../controllers/users');
const bank_accounts_controller = require('../controllers/bank_accounts');

// Remove existing User list and populate with demo data
router.post('/reset-users', users_controller.users_reset_post);

// Create a user account
router.post('/users', users_controller.users_create_post);

// Get all usersList
router.get('/users', users_controller.users_list_get);

// Get a single user
router.get('/users/:user_id', users_controller.users_detail_get);

// Update an existing user
router.put('/users/:user_id', users_controller.users_update_put);

// Delete User
router.delete('/users/:user_id', users_controller.users_remove_delete);


// Remove all existing bank accounts and populate with demo data
router.post('/reset-accounts', bank_accounts_controller.bank_accounts_reset_post);

// Create a bank account
router.post('/users/:user_id/accounts', bank_accounts_controller.bank_accounts_create_post);

// Get all bankAccounts - For testing and debugging purposes ONLY
router.get('/accounts', bank_accounts_controller.bank_accounts_demo_list_get);

// Get all bankAccounts for a user
router.get('/users/:user_id/accounts', bank_accounts_controller.bank_accounts_list_get);

// Get a single account
router.get('/users/:user_id/accounts/:id', bank_accounts_controller.bank_accounts_detail_get);

// Update an existing account
router.put('/users/:user_id/accounts/:id', bank_accounts_controller.bank_accounts_update_put);

// Delete account
router.delete('/users/:user_id/accounts/:id', bank_accounts_controller.bank_accounts_remove_delete);

export default router;