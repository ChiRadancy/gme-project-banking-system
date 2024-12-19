import { Request, Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import { User } from '../models/users';
import { populateDemoUsers } from './demo-functions/demo-users';

const asyncHandler = require("express-async-handler");
export let usersList: User[] = [];

const userValidationRules = [
    param('user_id').notEmpty().isInt({min: 0}).withMessage('Not a valid user id.'),
];

// Create a user account
exports.users_create_post = [
    userValidationRules,
    body('user_name').notEmpty().withMessage('User name is required.'),
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('family_name').notEmpty().withMessage('Family name is required.'),
    body('is_active').optional().isBoolean().withMessage('Is active must be set to True or False.'),
    
    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Create new user account.`);
        console.log(`Method: POST.`);

        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const user: User = {
            id: usersList.length + 1,
            user_name: req.body.user_name,
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            is_active: true,
        };
    
        usersList.push(user);
        console.log(`New user account created: ${user}.`);
        res.status(201).json(user);
    }),
];

// Remove existing User list and populate with demo data
exports.users_reset_post = asyncHandler(async (req: Request, res: Response) => {
    // Remove all previous user data - bank accounts will also need to be removed
    usersList.splice(0);

    // Populate with demo data
    populateDemoUsers(usersList);

    console.log('Reset user accounts.');
    // Return list of demo users
    res.json(usersList);
});


// Get all usersList - Demo use ONLY
exports.users_list_get = asyncHandler(async (req: Request, res: Response) => {
    res.json(usersList);
});

// Get a single user
exports.users_detail_get = asyncHandler(async (req: Request, res: Response) => {
    console.log(`Retrieve details for a single user account.`);
    console.log(`Method: GET.`);
    const user = usersList.find((t) => t.id === parseInt(req.params.user_id));

    if (!user) {
        console.log(`User account doesn't exist.`);
        res.status(404).send('User not found.');
    } else {
        res.json(user);
    }
});

// Update an existing user
exports.users_update_put = asyncHandler(async (req: Request, res: Response) => {
    console.log(`Make updates to an existing user account.`);
    console.log(`Method: PUT.`);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(`Error: invalid data sent.`);
        return res.status(400).json({ errors: errors.array() });
    }

    const user = usersList.find((u) => u.id === parseInt(req.params.user_id));

    if (!user) {
        console.log('User account not found.');
        res.status(404).send('user not found.');
    } else {
        const isUserActive = req.body.is_active.length !== 0 ? req.body.is_active : user.is_active;

        user.user_name = req.body.user_name || user.user_name;
        user.first_name = req.body.first_name || user.first_name;
        user.family_name = req.body.family_name || user.family_name;
        user.is_active = isUserActive;

        console.log(`New user account details: ${user}.`);
        res.json(user);
    }

});

// Delete User
exports.users_remove_delete = [
    userValidationRules,

    asyncHandler(async (req: Request, res: Response) => {
        console.log(`Delete this user account.`);
        console.log(`Method: DELETE.`);

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log(`Error: invalid data sent.`);
            return res.status(400).json({ errors: errors.array() });
        }

        const index = usersList.findIndex((u) => u.id === parseInt(req.params.user_id));

        if (index === -1) {
            console.log('User account not found.');
            res.status(404).send('User not found.');
        } else {
            const removedUser = usersList.splice(index, 1);
            console.log(`User account removed: ${removedUser}.`);
            res.status(204).send();
        }
    }),
];