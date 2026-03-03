import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import BookingSummary from '../../components/booking/BookingSummary';

const SeatDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { selectedSeats, startDate, durationMonths } = location.state || {};

    const [details, setDetails] = useState(
        selectedSeats?.map((seat) => ({
            seatId: seat._id,
            seatNumber: seat.seatNumber,
            genderType: seat.genderType,
            name: '',
            fatherName: '',
            contactNumber: '',
            examPreparingFor: '',
            address: '',
        })) || []
    );

    const [submitting, setSubmitting] = useState(false);

    if (!selectedSeats || selectedSeats.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No seats selected</p>
                <button
                    onClick={() => navigate('/booking/seats')}
                    className="text-blue-600 hover:underline"
                >
                    Back to Seat Selection
                </button>
            </div>
        );
    }

    const handleInputChange = (index, field, value) => {
        const newDetails = [...details];
        newDetails[index][field] = value;
        setDetails(newDetails);
    };

    const validate = () => {
        for (const detail of details) {
            if (!detail.name.trim() || !detail.fatherName.trim() || !detail.contactNumber.trim() || !detail.examPreparingFor.trim() || !detail.address.trim()) {
                showToast('Please fill all fields for all seats', 'error');
                return false;
            }
            if (!/^\d{10}$/.test(detail.contactNumber.trim())) {
                showToast(`Invalid contact number for Seat ${detail.seatNumber}. Must be 10 digits.`, 'error');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setSubmitting(true);
            const response = await bookingAPI.create({
                seatDetails: details.map(d => ({
                    seatId: d.seatId,
                    name: d.name.trim(),
                    fatherName: d.fatherName.trim(),
                    contactNumber: d.contactNumber.trim(),
                    examPreparingFor: d.examPreparingFor.trim(),
                    address: d.address.trim(),
                })),
                startDate,
                durationMonths,
            });

            showToast('Booking confirmed successfully!', 'success');
            navigate(`/booking/${response.data.booking._id}`, { state: { newBooking: true } });
        } catch (err) {
            console.error('Booking error:', err);
            showToast(err?.response?.data?.message || 'Failed to create booking', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Passenger Details</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {details.map((seat, index) => (
                        <div key={seat.seatId} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                            <div className="bg-blue-600 px-6 py-3">
                                <h2 className="text-white font-semibold">
                                    Enter details for {seat.genderType?.charAt(0).toUpperCase() + seat.genderType?.slice(1)} Seat No: {seat.seatNumber}
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                                        <input
                                            type="text"
                                            value={seat.name}
                                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                            placeholder="Full Name"
                                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Father's Name</label>
                                        <input
                                            type="text"
                                            value={seat.fatherName}
                                            onChange={(e) => handleInputChange(index, 'fatherName', e.target.value)}
                                            placeholder="Father's Name"
                                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        value={seat.contactNumber}
                                        onChange={(e) => handleInputChange(index, 'contactNumber', e.target.value)}
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam You Are Preparing For</label>
                                    <input
                                        type="text"
                                        value={seat.examPreparingFor}
                                        onChange={(e) => handleInputChange(index, 'examPreparingFor', e.target.value)}
                                        placeholder="e.g., UPSC, SSC, JEE, NEET, Banking, etc."
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                    <textarea
                                        value={seat.address}
                                        onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                                        placeholder="Complete Address"
                                        rows="3"
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <BookingSummary
                            selectedSeats={selectedSeats}
                            durationMonths={durationMonths}
                            onDurationChange={() => { }} // Duration is fixed at this step
                            onConfirm={handleSubmit}
                            loading={submitting}
                            date={startDate}
                            confirmButtonText="Confirm Booking"
                        />
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full mt-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            ← Back to Seat Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatDetails;
