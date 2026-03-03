import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    seats: [
      {
        seat: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Seat',
          required: true,
        },
        name: { type: String, required: true },
        fatherName: { type: String, required: true },
        contactNumber: { type: String, required: true },
        address: { type: String, required: true },
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration is required'],
      enum: [1, 2, 3], // months
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ seats: 1, startDate: 1, endDate: 1 });

// Prevent double booking validation
bookingSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('seats') || this.isModified('startDate') || this.isModified('endDate')) {
    const Booking = this.constructor;
    const overlappingBookings = await Booking.find({
      _id: { $ne: this._id },
      status: 'active',
      seats: { $in: this.seats.map(s => s.seat) },
      $or: [
        {
          startDate: { $lt: this.endDate },
          endDate: { $gt: this.startDate },
        },
      ],
    });

    if (overlappingBookings.length > 0) {
      const error = new Error('Seats are already booked for the selected dates');
      error.status = 400;
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);

