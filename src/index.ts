import express, { Request, Response, NextFunction } from 'express';
import userRoutes from './routes/users';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/user', userRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Manage your accounts!');
});

// Add this error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});