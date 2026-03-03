import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BookingDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadBooking();
    }, [id]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await bookingAPI.getById(id);
            setBooking(response.data.booking);
        } catch (err) {
            console.error('Failed to load booking:', err);
            setError(err.response?.data?.message || 'Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-900/30">
                    <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error || 'Booking not found'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';
    const location = useLocation();
    const isNewBooking = location.state?.newBooking;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {isNewBooking && (
                <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Booking Confirmed!</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Your seat reservation has been successfully processed.</p>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-blue-600 px-8 py-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Booking Details</h1>
                            <p className="opacity-90 text-sm mt-1">Confirmed Registration</p>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/30`}>
                            {booking.status}
                        </span>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Main Info Grid */}
                    <div className="grid md:grid-cols-2 gap-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Booking Info</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">ID:</span>
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{booking.bookingId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                    <span className="font-semibold">{booking.durationMonths} Month(s)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                                    <span className="font-bold text-lg text-green-600 dark:text-green-400">₹{booking.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">User Info</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                    <span className="font-semibold">{booking.user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                    <span className="font-semibold break-all">{booking.user?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Date Range:</span>
                                    <span className="font-semibold text-right">
                                        {format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seats & Passenger Details */}
                    <div className="space-y-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Seat Details</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {booking.seats.filter(item => item.seat).map((item) => (
                                <div key={item.seat._id} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg font-bold text-sm">
                                            Seat {item.seat.seatNumber} ({item.seat.genderType?.toUpperCase() || item.seat.section})
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Name</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Father's Name</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{item.fatherName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Contact</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{item.contactNumber}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Exam</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{item.examPreparingFor}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Address</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{item.address}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            onClick={() => navigate(isAdmin ? '/admin/bookings' : '/booking/history')}
                            className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                        >
                            Close Details
                        </button>
                        {!isAdmin && (
                            <Link
                                to="/booking"
                                className="flex-1 py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 text-center"
                            >
                                Book New Seat
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
