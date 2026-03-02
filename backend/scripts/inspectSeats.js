import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Seat from '../models/Seat.model.js';

dotenv.config();

const inspectSeats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const seats = await Seat.find().sort({ row: 1, column: 1 }).limit(5);
        console.log('Total Seats:', await Seat.countDocuments());
        console.log('Sample Seats:', JSON.stringify(seats, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectSeats();
