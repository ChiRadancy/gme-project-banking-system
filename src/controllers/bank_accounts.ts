import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { usersList } from './users';
import { BankAccount } from '../models/bank_accounts';
import { populateDemoBankAccounts } from './demo-functions/demo-bank-accounts';

const asyncHandler = require("express-async-handler");
let bankAccounts: BankAccount[] = [];

// Rules for modifying existing bank accounts
const accountValidationRules = [
    body('account_name').notEmpty().withMessage('Account name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('balance').notEmpty().isFloat({min: 100.00}).withMessage('Balance must be a number and at least 100.00'),
    body('owner').isInt({min: 1}).withMessage('Owner ID is required and has to be greater than 0.'),
];

// Create a bank account
exports.bank_accounts_create_post = [
    // Validation rules for Bank Account creation
    body('account_name').notEmpty().withMessage('Account name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('balance').notEmpty().isFloat({min: 100.00}).withMessage('Balance must be a number and at least 100.00'),

    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const accountOwner = usersList.find((u) => u.id === parseInt(req.params.user_id));
        
        if (!accountOwner) {
            return res.status(422).send('User not found: bank accounts need to be assigned to an existing user.');
        } else if( !accountOwner.is_active ) {
            console.log('Account is not active');
            return res.status(403).send('This account is not active, please contact us.');
        } else {
            const balanceToFloat: any = (Math.round(parseFloat(req.body.balance) * 100) / 100);
            
            const account: BankAccount = {
                id: bankAccounts.length + 1,
                account_name: req.body.account_name,
                description: req.body.description,
                balance: balanceToFloat,
                owner: accountOwner.id
            };
            
            bankAccounts.push(account);
            res.status(201).json(account)
        }
    }),
];


// Remove all existing bank accounts and populate with demo data
exports.bank_accounts_reset_post = asyncHandler(async (req: Request, res: Response) => {
    // Remove all existing account data
    bankAccounts.splice(0);

    // Populate bank accounts list with demo data
    populateDemoBankAccounts(bankAccounts);

    console.log('Reset accounts');
    res.json(bankAccounts);
});

// Get all bankAccounts - Demo use ONLY
exports.bank_accounts_demo_list_get = asyncHandler(async (req: Request, res: Response) => {
    res.json(bankAccounts);
});

// Get users bankAccounts
exports.bank_accounts_list_get = asyncHandler(async (req: Request, res: Response) => {
    const accountOwner = usersList.find((u) => u.id === parseInt(req.params.user_id));

    if (!accountOwner) {
        return res.status(422).send('User not found: bank accounts need to be assigned to an existing user.');
    }

    const userBankAccounts:BankAccount[] = bankAccounts.filter((acc) => acc.owner === accountOwner.id);

    res.json(userBankAccounts);
});

// Get a single account
exports.bank_accounts_detail_get = asyncHandler(async (req: Request, res: Response) => {
    const accountOwner = usersList.find((u) => u.id === parseInt(req.params.user_id));

    if (!accountOwner) {
        return res.status(422).send('User not found: bank accounts need to be assigned to an existing user.');
    }

    const account = bankAccounts.find((u) => u.id === parseInt(req.params.id));

    if (!account) {
        console.log(`Account doesn't exist`);
        res.status(404).send('account not found');

    } else if (accountOwner.id !== account.owner) {
        console.log(`Accound does not belong to this user`);
        res.status(400).send('Error: something went wrong!');

    } else {
        // No errors - return bank account
        res.json(account);
    }
});

// Update an existing account
exports.bank_accounts_update_put = [
    accountValidationRules,
    
    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Update existing account`);
        console.log(`Method: PUT`);
        
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log(`Error: invalid data sent`);
            return res.status(400).json({ errors: errors.array() });
        }

        const accountOwner = usersList.find((u) => u.id === parseInt(req.params.user_id));

        if (!accountOwner) {
            return res.status(422).send('User not found: bank accounts need to be assigned to an existing user.');
            
        } else if( !accountOwner.is_active ) {
            console.log('Account is not active');
            return res.status(403).send('This account is not active, please contact us.');
        }

        const account = bankAccounts.find((t) => t.id === parseInt(req.params.id));

        if (!account) {
            console.log(`Error: account doesn't exist`);
            return res.status(404).send('account not found');

        } else if (accountOwner.id !== account.owner) {
            console.log(`Accound does not belong to this user`);
            return res.status(400).send('Error: something went wrong!');
    
        } else {
            
            // Account balance rule checks

            // Rule: A user cannot deposit more than 10,000z in a single transaction.
            if (req.body.balance > (account.balance + 10000.00)) {
                console.log(`Unable to process request: Cannot deposit more than 10,000z in a single transaction. Requested: ${req.body.balance} Balance: ${account.balance}`);
                return res.status(400).send('Unable to process request: Cannot deposit more than 10,000z in a single transaction.');
            }

            // Rule: An account cannot have less than 100z at any time in an account.
            if (req.body.balance < 100.00) {
                console.log(`Unable to process request: Remaining balance is less than 100.00z. Requested: ${req.body.balance} Balance: ${account.balance}`);
                return res.status(400).send('Unable to process request: Minimum remaining balance of 100.00z is required after a withdrawal.');
            }

            // Rule: A user cannot withdraw more than 90% of their total balance from an account in a single transaction.
            if (req.body.balance < (account.balance * 0.1)) {
                console.log(`Unable to process request: Withdrawing more than 90% of total balance. Requested: ${req.body.balance} Balance: ${account.balance}`);
                return res.status(400).send('Unable to process request: Cannot withdraw more than 90% of total balance.');
            }

            // Passed checks, go ahead and update account
            console.log(`Passed validation and checks.`);
            account.account_name = req.body.account_name || account.account_name;
            account.description = req.body.description || account.description;
            account.balance = req.body.balance || account.balance;

            console.log(`New account details: ${account}`);
            res.json(account);
        }
    }),
];

// Deposit money into an existing account
exports.bank_accounts_deposit_put = [
    accountValidationRules,
    
    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Update existing account`);
        console.log(`Method: PUT`);
        
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log(`Error: invalid data sent`);
            return res.status(400).json({ errors: errors.array() });
        }

        const accountOwner = usersList.find((u) => u.id === parseInt(req.params.user_id));

        if (!accountOwner) {
            return res.status(422).send('User not found: bank accounts need to be assigned to an existing user.');
            
        } else if( !accountOwner.is_active ) {
            console.log('Account is not active');
            return res.status(403).send('This account is not active, please contact us.');
        }

        const account = bankAccounts.find((t) => t.id === parseInt(req.params.id));

        if (!account) {
            console.log(`Error: account doesn't exist`);
            return res.status(404).send('account not found');

        } else if (accountOwner.id !== account.owner) {
            console.log(`Accound does not belong to this user`);
            return res.status(400).send('Error: something went wrong!');
    
        } else {
            // Account balance rule checks

            // Rule: A user cannot deposit more than 10,000z in a single transaction.
            if (req.body.balance > (account.balance + 10000.00)) {
                console.log(`Unable to process request: Cannot deposit more than 10,000z in a single transaction. Requested: ${req.body.balance} Balance: ${account.balance}`);
                return res.status(400).send('Unable to process request: Cannot deposit more than 10,000z in a single transaction.');
            }

            // Rule: An account cannot have less than 100z at any time in an account.
            if (req.body.balance < 100.00) {
                console.log(`Unable to process request: Remaining balance is less than 100.00z. Requested: ${req.body.balance} Balance: ${account.balance}`);
                return res.status(400).send('Unable to process request: Minimum remaining balance of 100.00z is required after a withdrawal.');
            }

            // Rule: A user cannot withdraw more than 90% of their total balance from an account in a single transaction.
            if (req.body.balance < (account.balance * 0.1)) {
                console.log(`Unable to process request: Withdrawing more than 90% of total balance. Requested: ${req.body.balance} Balance: ${account.balance}`);
                return res.status(400).send('Unable to process request: Cannot withdraw more than 90% of total balance.');
            }

            // Passed checks, go ahead and update account
            console.log(`Passed validation and checks.`);
            account.balance = req.body.balance || account.balance;

            console.log(`New account details: ${account}`);
            res.json(account);
        }
    }),
];

// Delete account
exports.bank_accounts_remove_delete = asyncHandler(async (req: Request, res: Response) => {

    const accountOwner = usersList.find((u) => u.id === parseInt(req.params.user_id));

    if (!accountOwner) {
        return res.status(422).send('User not found: Unable to complete request.');
        
    } else if( !accountOwner.is_active ) {
        console.log('Account is not active');
        return res.status(403).send('This account is not active: Unable to complete requeest.');
    }

    const index = bankAccounts.findIndex((t) => t.id === parseInt(req.params.id));

    if (index === -1) {
        res.status(404).send('account not found');
    } else {
        bankAccounts.splice(index, 1);
        res.status(204).send();
    }
});