import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Seat from '../models/Seat.model.js';

dotenv.config();

const migrateSeatNumbers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const seats = await Seat.find({});
        console.log(`Found ${seats.length} seats to migrate`);

        let count = 0;
        for (const seat of seats) {
            const numericValue = parseInt(seat.seatNumber);
            if (!isNaN(numericValue)) {
                await Seat.updateOne({ _id: seat._id }, { $set: { seatNumber: numericValue } });
                count++;
            } else {
                console.warn(`Could not convert seatNumber "${seat.seatNumber}" for seat id ${seat._id}`);
            }
        }

        console.log(`Successfully migrated ${count} seats`);
        await mongoose.connection.close();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateSeatNumbers();
