import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/users';

const asyncHandler = require("express-async-handler");
export let usersList: User[] = [];

const userValidationRules = [
    body('user_name').notEmpty().withMessage('User name is required'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('family_name').notEmpty().withMessage('Family name is required'),
    body('is_active').optional().isBoolean().withMessage('Is active must be set to True or False'),
];

// Create a user account
exports.users_create_post = [
    userValidationRules, 
    
    asyncHandler(async (req: Request, res: Response) => {
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
        res.status(201).json(user)
    }),
];

// Remove existing User list and populate with demo data
exports.users_reset_post = asyncHandler(async (req: Request, res: Response) => {
    // Remove all previous user data - bank accounts will also need to be removed
    usersList.splice(0);

    // Populate with demo data
    usersList.push({
        id: usersList.length + 1,
        user_name: 'first_User',
        first_name: 'Scott',
        family_name: 'Summers',
        is_active: true,
    });

    usersList.push({
        id: usersList.length + 1,
        user_name: 'second_User',
        first_name: 'Robert',
        family_name: 'Drake',
        is_active: true,
    });

    usersList.push({
        id: usersList.length + 1,
        user_name: 'third_User',
        first_name: 'Henry',
        family_name: 'McCoy',
        is_active: true,
    });

    usersList.push({
        id: usersList.length + 1,
        user_name: 'fourth_User',
        first_name: 'Warren',
        family_name: 'Worthington',
        is_active: true,
    });

    usersList.push({
        id: usersList.length + 1,
        user_name: 'fifth_User',
        first_name: 'Jean',
        family_name: 'Grey',
        is_active: true,
    });

    console.log('Reset users');
    // Return list of demo users
    res.json(usersList);
});


// Get all usersList - Demo use ONLY
exports.users_list_get = asyncHandler(async (req: Request, res: Response) => {
    res.json(usersList);
});

// Get a single user
exports.users_detail_get = asyncHandler(async (req: Request, res: Response) => {
    const user = usersList.find((t) => t.id === parseInt(req.params.user_id));

    if (!user) {
        res.status(404).send('User not found');
    } else {
        res.json(user);
    }
});

// Update an existing user
exports.users_update_put = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = usersList.find((u) => u.id === parseInt(req.params.user_id));

    if (!user) {
        res.status(404).send('user not found');
    } else {
        user.user_name = req.body.user_name || user.user_name;
        user.first_name = req.body.first_name || user.first_name;
        user.family_name = req.body.family_name || user.family_name;
        user.is_active = req.body.is_active || user.is_active

        res.json(user);
    }

});

// Delete User
exports.users_remove_delete = asyncHandler(async (req: Request, res: Response) => {
    const index = usersList.findIndex((u) => u.id === parseInt(req.params.user_id));

    if (index === -1) {
        res.status(404).send('User not found');
    } else {
        usersList.splice(index, 1);
        res.status(204).send();
    }
});