import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/users';

const router = Router();
let usersList: User[] = [];

const userValidationRules = [
    body('user_name').notEmpty().withMessage('User name is required'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('family_name').notEmpty().withMessage('Family name is required'),
    body('is_active').optional().isBoolean().withMessage('Is active must be set to True or False'),
];

// Create a bank account
router.post('/', userValidationRules, (req: Request, res: Response) => {
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
});

// Get all usersList
router.get('/', (req: Request, res: Response) => {
    res.json(usersList);
});

// Get a single user
router.get('/:id', (req: Request, res: Response) => {
    const user = usersList.find((t) => t.id === parseInt(req.params.id));

    if (!user) {
        res.status(404).send('User not found');
    } else {
        res.json(user);
    }
});

// Update an existing user
router.put('/:id', userValidationRules, (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const user = usersList.find((t) => t.id === parseInt(req.params.id));

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
router.delete('/:id', (req: Request, res: Response) => {
    const index = usersList.findIndex((t) => t.id === parseInt(req.params.id));

    if (index === -1) {
        res.status(404).send('User not found');
    } else {
        usersList.splice(index, 1);
        res.status(204).send();
    }
});

export default router;