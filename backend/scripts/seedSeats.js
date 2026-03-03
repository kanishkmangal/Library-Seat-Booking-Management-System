import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Seat from '../models/Seat.model.js';

dotenv.config();

const seedSeats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing seats
        await Seat.deleteMany({});
        console.log('Cleared existing seats');

        const rows = [
            { label: 'A', dir: 'forward', start: 1, end: 18, leftCount: 8 },
            { label: 'B', dir: 'reverse', start: 19, end: 34, leftCount: 8 },
            { label: 'C', dir: 'forward', start: 35, end: 50, leftCount: 8 },
            { label: 'D', dir: 'reverse', start: 51, end: 66, leftCount: 8 },
            { label: 'E', dir: 'forward', start: 67, end: 82, leftCount: 8 },
            { label: 'F', dir: 'reverse', start: 83, end: 98, leftCount: 8 },
            { label: 'G', dir: 'forward', start: 99, end: 114, leftCount: 8 },
            { label: 'H', dir: 'reverse', start: 115, end: 128, leftCount: 7 }
        ];

        const seatDocs = [];

        for (const row of rows) {
            const rowNumbers = Array.from({ length: row.end - row.start + 1 }, (_, i) => row.start + i);

            let leftSeats, rightSeats;
            if (row.dir === 'forward') {
                leftSeats = rowNumbers.slice(0, row.leftCount);
                rightSeats = rowNumbers.slice(row.leftCount);
            } else {
                const reversed = [...rowNumbers].reverse();
                leftSeats = reversed.slice(0, row.leftCount);
                rightSeats = reversed.slice(row.leftCount);
            }

            const isFemale = (n) => {
                const femaleRanges = [[1, 8], [27, 34], [122, 128]];
                return femaleRanges.some(([start, end]) => n >= start && n <= end);
            };

            // Add Left Block
            leftSeats.forEach((num, index) => {
                seatDocs.push({
                    seatNumber: num,
                    row: row.label,
                    column: index + 1,
                    section: 'LEFT',
                    genderType: isFemale(num) ? 'female' : 'male',
                    status: 'available'
                });
            });

            // Add Right Block
            rightSeats.forEach((num, index) => {
                seatDocs.push({
                    seatNumber: num,
                    row: row.label,
                    column: index + 1,
                    section: 'RIGHT',
                    genderType: isFemale(num) ? 'female' : 'male',
                    status: 'available'
                });
            });
        }

        await Seat.insertMany(seatDocs);
        console.log(`Successfully seeded ${seatDocs.length} seats`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding seats:', error);
        process.exit(1);
    }
};

seedSeats();
