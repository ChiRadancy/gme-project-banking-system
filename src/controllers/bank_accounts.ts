import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { usersList } from './users';
import { BankAccount } from '../models/bank_accounts';

const asyncHandler = require("express-async-handler");
let bankAccounts: BankAccount[] = [];

const accountValidationRules = [
    body('account_name').notEmpty().withMessage('Account name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('balance').notEmpty().isFloat({min: 100.00}).withMessage('Balance must be a number and at least 100.00'),
    body('owner').notEmpty().isInt({min: 1}).withMessage('Owner ID is required and has to be greater than 0.'),
];

// Create a bank account
exports.bank_accounts_create_post = [
    accountValidationRules,

    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        let balanceToFloat : any = (Math.round(parseFloat(req.body.balance) * 100) / 100).toFixed(2);
    
        const accountOwner = usersList.find((u) => u.id === parseInt(req.body.owner));
    
        if (!accountOwner) {
            res.status(422).send('User not found: bank accounts need to be assigned to an existing user.');
        } else {
    
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
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Travel funds",
        description: "Funds for future travels and events.",
        balance: 500.00,
        owner: 1,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Car collection",
        description: "Money pot for car collection.",
        balance: 8750.00,
        owner: 1,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Future savings",
        description: "Savings for future plans",
        balance: 5750.00,
        owner: 1,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Savings account",
        description: "Funds for cool events.",
        balance: 110.00,
        owner: 2,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Book collection",
        description: "Library collection.",
        balance: 231.26,
        owner: 3,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Account no. 96",
        description: "Duplicate account - keep maxing bank liability limit.",
        balance: 10000.00,
        owner: 4,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Account no. 97",
        description: "Duplicate account - keep maxing bank liability limit.",
        balance: 10000.00,
        owner: 4,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Account no. 98",
        description: "Duplicate account - keep maxing bank liability limit.",
        balance: 10000.00,
        owner: 4,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Account no. 99",
        description: "Duplicate account - keep maxing bank liability limit.",
        balance: 9876.66,
        owner: 4,
    });
    bankAccounts.push({
        id: bankAccounts.length + 1,
        account_name: "Travel funds",
        description: "Funds for future travels and events.",
        balance: 768.35,
        owner: 5,
    });

    console.log('Reset accounts');
    res.json(bankAccounts);
});

// Get all bankAccounts
exports.bank_accounts_list_get = asyncHandler(async (req: Request, res: Response) => {
    res.json(bankAccounts);
});

// Get a single account
exports.bank_accounts_detail_get = asyncHandler(async (req: Request, res: Response) => {
    const account = bankAccounts.find((u) => u.id === parseInt(req.params.id));

    if (!account) {
        console.log(`Account doesn't exist`);
        res.status(404).send('account not found');
    } else {
        console.log(`account created:`, account);
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

        const accountOwner = usersList.find((u) => u.id === parseInt(req.body.owner));

        if (!accountOwner) {
            return res.status(422).send('User not found: bank accounts need to be assigned to an existing user.');
        }

        const account = bankAccounts.find((t) => t.id === parseInt(req.params.id));

        if (!account) {
            console.log(`Error: account doesn't exist`);
            return res.status(404).send('account not found');
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

// Delete account
exports.bank_accounts_remove_delete = asyncHandler(async (req: Request, res: Response) => {
    const index = bankAccounts.findIndex((t) => t.id === parseInt(req.params.id));

    if (index === -1) {
        res.status(404).send('account not found');
    } else {
        bankAccounts.splice(index, 1);
        res.status(204).send();
    }
});