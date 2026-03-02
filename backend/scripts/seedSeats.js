import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Seat from '../models/Seat.model.js';

dotenv.config();

const seedSeats = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // clear existing
        await Seat.deleteMany({});
        console.log('Cleared existing seats');

        const rows = ['A', 'B', 'C', 'D', 'E'];
        const cols = 10;
        const seats = [];

        rows.forEach((row) => {
            for (let col = 1; col <= cols; col++) {
                seats.push({
                    seatNumber: `${row}${col}`,
                    row: row,
                    column: col,
                    section: 'Main Hall',
                    status: 'available',
                    isActive: true,
                });
            }
        });

        await Seat.insertMany(seats);
        console.log(`Seeded ${seats.length} seats successfully.`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedSeats();
