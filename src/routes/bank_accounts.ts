import Router from 'express';

const router = Router();
const bank_accounts_controller = require('../controllers/bank_accounts');

// Create a bank account
router.post('/', bank_accounts_controller.bank_accounts_create_post);

// Remove all existing bank accounts and populate with demo data
router.post('/reset-accounts', bank_accounts_controller.bank_accounts_reset_post);

// Get all bankAccounts
router.get('/', bank_accounts_controller.bank_accounts_list_get);

// Get a single account
router.get('/:id', bank_accounts_controller.bank_accounts_detail_get);

// Update an existing account
router.put('/:id', bank_accounts_controller.bank_accounts_update_put);

// Delete account
router.delete('/:id', bank_accounts_controller.bank_accounts_remove_delete);

export default router;