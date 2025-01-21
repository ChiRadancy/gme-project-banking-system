import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { usersList } from './users';
import { BankAccount } from '../models/bank_accounts';
import { populateDemoBankAccounts } from './demo-functions/demo-bank-accounts';
import { CustomErrorUserNotActive } from './customErrors';

const asyncHandler = require("express-async-handler");
let bankAccounts: BankAccount[] = [];

// Maximum amount a user can make in a single transaction transaction
const maxSingleAmount = 10_000.00;

// Validation rules for bank accounts
const accountValidationRules = [
    param('user_id').notEmpty().isInt({min: 0}).toInt().withMessage('Not a valid user id.'),
    param('id').isInt({min: 0}).withMessage('Not a valid bank account id.'),
];

// async to simulate connecting to a db.
async function getAccountOwner(userId: number, res: Response) {
    try {
        // double check user input is a number
        if ( typeof userId !== 'number') {
            throw new TypeError('Not a valid user id.');
        }

        // pretend it's connecting to external resource (db) instead of an array.
        const accountOwner = await usersList.find((u) => u.id === userId);
        
        // user not found 
        if( typeof accountOwner === 'undefined') {
            throw new RangeError('User not found: bank accounts need to be assigned to an existing user.');
        }
        
        if( !accountOwner.is_active ) {
            throw new CustomErrorUserNotActive('User account is not active.');
        }

        return accountOwner;
    }
    catch (e: unknown) {
        let errorCode = 400;
        let errorLog = 'Not a valid user.';
        let errorMsg = 'Failed.';

        if (e instanceof TypeError) {
            errorLog = 'UserId provided in the wrong type.';
            errorCode = 422;
            errorMsg = e.message;
        }
        else if (e instanceof RangeError) {
            errorLog = 'User account does not exist.';
            errorCode = 422;
            errorMsg = e.message;
        }
        else if (e instanceof CustomErrorUserNotActive) {
            errorLog = 'User account is not active.';
            errorCode = 403;
            errorMsg = e.message;
        }
        
        console.log(errorLog);
        res.status(errorCode).send(errorMsg);
        return null;
    }
}

// Create a bank account
exports.bank_accounts_create_post = [
    // Validation rules for Bank Account creation
    param('user_id').notEmpty().isInt({min: 0}).toInt().withMessage('Not a valid user id.'),
    body('account_name').notEmpty().escape().withMessage('Account name is required.'),
    body('description').notEmpty().escape().withMessage('Description is required.'),
    body('balance').notEmpty().isFloat({min: 100.00, max: maxSingleAmount}).withMessage('Balance must be a minimum 100.00z and a maximum of 10,000.00z.'),

    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Create new bank account.`);
        console.log(`Method: POST.`);

        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            console.log('Failed to create account', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        
        const accountOwner = await getAccountOwner(parseInt(req.params.user_id), res);
        
        if (accountOwner !== null) {

            const balanceToFloat: any = (Math.round(parseFloat(req.body.balance) * 100) / 100);
            
            const account: BankAccount = {
                id: bankAccounts.length + 1,
                account_name: req.body.account_name,
                description: req.body.description,
                balance: balanceToFloat,
                owner: accountOwner.id
            };
            
            bankAccounts.push(account);
            console.log('New bank account created: ', bankAccounts);
            res.status(201).json(account);
        }
    }),
];


// Remove all existing bank accounts and populate with demo data
exports.bank_accounts_reset_post = asyncHandler(async (req: Request, res: Response) => {
    // Remove all existing account data
    bankAccounts.splice(0);

    // Populate bank accounts list with demo data
    populateDemoBankAccounts(bankAccounts);

    console.log('Reset accounts.');
    res.json(bankAccounts);
});

// Get all bankAccounts - Demo use ONLY
exports.bank_accounts_demo_list_get = asyncHandler(async (req: Request, res: Response) => {
    console.log('Demo: Display all bank accounts.');
    res.json(bankAccounts);
});

// Get all bank accounts tied to single user
exports.bank_accounts_list_get = [
    // Only need to validate the User ID
    param('user_id').notEmpty().isInt({min: 0}).toInt().withMessage('Not a valid user id.'),

    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Get all account.`);
        console.log(`Method: GET.`);

        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const accountOwner = await getAccountOwner(parseInt(req.params.user_id), res);

        if (accountOwner !== null) {
            const userBankAccounts:BankAccount[] = bankAccounts.filter((acc) => acc.owner === accountOwner.id);
            
            console.log(`Retrieved bank accounts for account: ${accountOwner.id}.`);
            res.json(userBankAccounts);
        }
    }),
];

// Get a single bank account
exports.bank_accounts_detail_get = [
    accountValidationRules,

    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Retrieve single bank account details.`);
        console.log(`Method: GET.`);

        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const accountOwner = await getAccountOwner(parseInt(req.params.user_id), res);
        
        if (accountOwner !== null) {

            const account = bankAccounts.find((u) => u.id === parseInt(req.params.id));

            if (!account) {
                console.log(`Bank account doesn't exist.`);
                res.status(404).send('Bank account not found.');

            } else if (accountOwner.id !== account.owner) {
                // Reason for non specific error message is for security - less information given the better.
                console.log(`Bank account does not belong to this account holder.`);
                res.status(400).send('Error: something went wrong!');
                
            } else {
                // No errors - return bank account
                console.log(`Retrieved bank account: ${account.id}.`);
                res.json(account);
            }
        }
    }),
];

// Update an existing bank account
exports.bank_accounts_update_put = [
    // Validation rules for updating an existing account
    accountValidationRules,
    body('account_name').notEmpty().escape().withMessage('Account name is required.'),
    body('description').notEmpty().escape().withMessage('Description is required.'),

    // Maximum amount removed because account could've accummulated a balance higher than allowed single transaction amount.
    body('balance').notEmpty().isFloat({min: 100.00}).withMessage('Balance must be a minimum 100.00z.'),
    // "owner" field is omitted as this can never change.
    
    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Update existing bank account.`);
        console.log(`Method: PUT.`);
        
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log(`Error: invalid data sent.`);
            return res.status(400).json({ errors: errors.array() });
        }

        const accountOwner = await getAccountOwner(parseInt(req.params.user_id), res);
        
        if (accountOwner !== null) {

            const account = bankAccounts.find((t) => t.id === parseInt(req.params.id));

            if (!account) {
                console.log(`Error: bank account doesn't exist.`);
                return res.status(404).send('bank account not found.');

            } else if (accountOwner.id !== account.owner) {
                console.log(`Bank account does not belong to this user.`);
                return res.status(400).send('Error: something went wrong!');
        
            } else {
                
                // Account balance rule checks

                // Rule: A user cannot deposit more than 10,000z in a single transaction.
                if (req.body.balance > (account.balance + maxSingleAmount)) {
                    console.log(`Unable to process request: Cannot deposit more than 10,000z in a single transaction. Requested: ${req.body.balance} Balance: ${account.balance}.`);
                    return res.status(400).send('Unable to process request: Cannot deposit more than 10,000z in a single transaction.');
                }

                // Rule: An account cannot have less than 100z at any time in an account.
                if (req.body.balance < 100.00) {
                    console.log(`Unable to process request: Remaining balance is less than 100.00z. Requested: ${req.body.balance} Balance: ${account.balance}.`);
                    return res.status(400).send('Unable to process request: Minimum remaining balance of 100.00z is required after a withdrawal.');
                }

                // Rule: A user cannot withdraw more than 90% of their total balance from an account in a single transaction.
                if (req.body.balance < (account.balance * 0.1)) {
                    console.log(`Unable to process request: Withdrawing more than 90% of total balance. Requested: ${req.body.balance} Balance: ${account.balance}.`);
                    return res.status(400).send('Unable to process request: Cannot withdraw more than 90% of total balance.');
                }

                // Passed checks, go ahead and update account
                console.log(`Passed validation and checks.`);
                account.account_name = req.body.account_name || account.account_name;
                account.description = req.body.description || account.description;
                account.balance = req.body.balance || account.balance;
                // "owner" field is omitted as this can never change.

                console.log(`New account details: ${account}.`);
                res.json(account);
            }
        }
    }),
];

// Deposit money into an existing bank account
exports.bank_accounts_deposit_put = [
    accountValidationRules,
    body('deposit').notEmpty().isFloat({min: 1.00, max: maxSingleAmount}).withMessage('Minimum deposit amount is 1.00z and the maximum amount is 10,000.00z.'),
    
    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Deposit into a bank account.`);
        console.log(`Method: PUT.`);
        
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log(`Error: invalid data sent.`);
            return res.status(400).json({ errors: errors.array() });
        }

        const accountOwner = await getAccountOwner(parseInt(req.params.user_id), res);
        
        if (accountOwner !== null) {

            const account = bankAccounts.find((t) => t.id === parseInt(req.params.id));

            if (!account) {
                console.log(`Error: bank account doesn't exist.`);
                return res.status(404).send('Bank account not found.');

            } else if (accountOwner.id !== account.owner) {
                console.log(`Bank account does not belong to this user.`);
                return res.status(400).send('Error: something went wrong!');
        
            } else {

                // Passed checks, go ahead and update account
                console.log(`Passed validation and checks.`);
                account.balance += parseFloat(req.body.deposit);

                console.log(`New account details: ${account}.`);
                res.json(account);
            }
        }
    }),
];

// Withdraw money from an existing account
exports.bank_accounts_withdraw_put = [
    accountValidationRules,
    body('withdraw').notEmpty().isFloat({min: 1.00}).withMessage('Minimum withdrawal amount is 1.00z.'),
    
    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Withdraw from existing bank account.`);
        console.log(`Method: PUT.`);
        
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log(`Error: invalid data sent.`);
            return res.status(400).json({ errors: errors.array() });
        }
        
        const accountOwner = await getAccountOwner(parseInt(req.params.user_id), res);
        
        if (accountOwner !== null) {

            const account = bankAccounts.find((t) => t.id === parseInt(req.params.id));

            if (!account) {
                console.log(`Error: bank account doesn't exist.`);
                return res.status(404).send(' Bank account not found.');

            } else if (accountOwner.id !== account.owner) {
                console.log(`Bank Account does not belong to this user.`);
                // Generic error message for security purposes - only give enough info.
                return res.status(400).send('Error: something went wrong!');
        
            } else {
                // Account info passed checks

                // Now check withdrawal request is allowed as per company policy
                const currentBalance = account.balance;
                const withdrawalAmount = parseFloat(req.body.withdraw);

                // Check remaining balance is at least 100.00z
                if ( 100.00 > currentBalance - withdrawalAmount ) {
                    console.log(`Unable to process request: Remaining balance is less than 100.00z. Requested: ${withdrawalAmount} Balance: ${currentBalance}.`);
                    return res.status(400).send('Unable to process request: Minimum remaining balance of 100.00z is required after a withdrawal.');
                }

                // Check withdrawal amount is not more than 90% of their total balance in a single transaction.
                if (withdrawalAmount > (currentBalance * 0.9)) {
                    console.log(`Unable to process request: Withdrawing more than 90% of total balance. Requested: ${withdrawalAmount} Balance: ${currentBalance}.`);
                    return res.status(400).send('Unable to process request: Cannot withdraw more than 90% of total balance.');
                }

                // Passed checks, go ahead and update account
                console.log(`Passed validation and checks.`);
                account.balance -= withdrawalAmount;

                console.log(`New account details: ${account}.`);
                res.json(account);
            }
        }
    }),
];

// Delete bank account
exports.bank_accounts_remove_delete = [
    accountValidationRules,

    asyncHandler(async (req: Request, res: Response) => {

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log(`Error: invalid data sent.`);
            return res.status(400).json({ errors: errors.array() });
        }

        const accountOwner = await getAccountOwner(parseInt(req.params.user_id), res);
        
        if (accountOwner !== null) {

            const index = bankAccounts.findIndex((t) => t.id === parseInt(req.params.id));

            if (index === -1) {
                console.log('Bank account not found.');
                res.status(404).send('Bank account not found.');
            } else {
                const removedBankAccount = bankAccounts.splice(index, 1);
                console.log(`Bank account removed: ${removedBankAccount}.`);
                res.status(204).send();
            }
        }
    }),
];