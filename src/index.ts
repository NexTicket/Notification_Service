import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req , res)=> {
    res.send('Notification Service Running');
});

app.listen(PORT, () => {
    console.log(`Notification Service running on PORT ${PORT}`);
});