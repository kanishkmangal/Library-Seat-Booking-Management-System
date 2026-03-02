import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      unique: true,
    },
    row: {
      type: String,
      required: [true, 'Row is required'],
    },
    column: {
      type: Number,
      required: [true, 'Column is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'locked'],
      default: 'available',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
seatSchema.index({ row: 1, column: 1 });
seatSchema.index({ section: 1 });

export default mongoose.model('Seat', seatSchema);

