import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { seatAPI, bookingAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SeatGrid from '../../components/booking/SeatGrid';
import BookingSummary from '../../components/booking/BookingSummary';

const SeatSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const dateParam =
    searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

  const [selectedDate, setSelectedDate] = useState(dateParam);
  const [durationMonths, setDurationMonths] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* =========================
     LOAD SEAT LAYOUT (FIXED)
     ========================= */
  const loadSeatLayout = async () => {
    try {
      setLoading(true);

      const response = await seatAPI.getLayout(selectedDate);
      const rawSeats =
        response?.data?.seatLayout ||
        response?.data?.seats ||
        [];

      // ✅ Normalize seat status defensively
      const normalizedSeats = rawSeats.map((seat) => ({
        ...seat,
        status:
          seat.status === 'booked' || seat.status === 'locked'
            ? seat.status
            : 'available',
      }));

      console.log('SeatSelection: Loaded seats', normalizedSeats.length, normalizedSeats);

      // ✅ Use normalized seats and ensure state updates
      setSeats(normalizedSeats);
      setSelectedSeats(new Set());

    } catch (err) {
      console.error('Seat layout error:', err);
      showToast('Failed to load seat layout', 'error');
      setSeats([]);
    } finally {
      // Always set loading to false, regardless of success or error
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeatLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /* =========================
     SEAT SELECTION (FIXED)
     ========================= */
  const handleSeatSelect = (seatId) => {
    const seat = seats.find((s) => s._id === seatId);

    if (!seat) {
      console.warn('Seat not found:', seatId);
      return;
    }

    if (seat.status === 'booked') {
      showToast('Seat already booked', 'error');
      return;
    }

    if (seat.status === 'locked') {
      showToast('Seat is locked for maintenance', 'warning');
      return;
    }

    // ✅ Using Set-based logic to guarantee uniqueness and toggle behavior
    // ✅ Move side effects OUT of the state updater
    const willBeSelected = !selectedSeats.has(seatId);

    setSelectedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }
      return next;
    });

    if (willBeSelected) {
      showToast(`${seat.seatNumber} selected`, 'success');
    } else {
      showToast(`${seat.seatNumber} deselected`, 'info');
    }
  };

  /* =========================
     DATE CHANGE (SAFE)
     ========================= */
  const handleDateChange = (newDate) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    showToast('Loading seats for selected date...', 'info');
  };

  /* =========================
     CONFIRM BOOKING
     ========================= */
  const handleConfirm = async () => {
    if (selectedSeats.size === 0) {
      showToast('Please select at least one seat', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const seatIdsArray = Array.from(selectedSeats);

      const lockResponse = await bookingAPI.lockSeats({
        seatIds: seatIdsArray,
        startDate: selectedDate,
        durationMonths,
      });

      if (!lockResponse?.data?.success) {
        showToast(
          lockResponse?.data?.message || 'Seats are no longer available',
          'error'
        );
        await loadSeatLayout();
        return;
      }

      const response = await bookingAPI.create({
        seatIds: seatIdsArray,
        startDate: selectedDate,
        durationMonths,
      });

      showToast('Booking confirmed!', 'success');

      setTimeout(() => {
        navigate(`/booking/confirmation/${response.data.booking.bookingId}`);
      }, 400);
    } catch (err) {
      console.error('Booking error:', err);
      showToast(
        err?.response?.data?.message || 'Failed to create booking',
        'error'
      );
      await loadSeatLayout();
    } finally {
      setSubmitting(false);
    }
  };

  // Memoize selected seat details to prevent unnecessary recalculations
  const selectedSeatDetails = useMemo(() => {
    return Array.from(selectedSeats)
      .map((id) => seats.find((s) => s._id === id))
      .filter(Boolean);
  }, [selectedSeats, seats]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-6">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/booking')}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-2 flex items-center gap-2"
          >
            ← Back to Date Selection
          </button>

          <h1 className="text-3xl font-bold">Select Your Seats</h1>

          <div className="mt-2 flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              Date:{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {format(new Date(selectedDate), 'MMMM dd, yyyy')}
              </span>
            </span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="px-3 py-1 border rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {loading && <SeatGridSkeleton />}

            {!loading && seats.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>No seats available for this date</p>
                <p className="text-sm mt-2">Debug: seats array length = {seats.length}</p>
              </div>
            )}

            {!loading && seats.length > 0 && (
              <SeatGrid
                key={`seats-${selectedDate}-${seats.length}`}
                seats={seats}
                selectedSeats={Array.from(selectedSeats)}
                onSeatSelect={handleSeatSelect}
                date={selectedDate}
              />
            )}
          </div>

          <div className="hidden lg:block lg:sticky lg:top-4">
            <BookingSummary
              selectedSeats={selectedSeatDetails}
              durationMonths={durationMonths}
              onDurationChange={setDurationMonths}
              onConfirm={handleConfirm}
              loading={submitting}
              date={selectedDate}
            />
          </div>
        </div>

        {/* MOBILE */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 z-40">
          <BookingSummary
            selectedSeats={selectedSeatDetails}
            durationMonths={durationMonths}
            onDurationChange={setDurationMonths}
            onConfirm={handleConfirm}
            loading={submitting}
            date={selectedDate}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================
   SKELETON (UNCHANGED)
   ========================= */
const SeatGridSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-2">
        {[...Array(8)].map((_, j) => (
          <div
            key={j}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          />
        ))}
      </div>
    ))}
  </div>
);

export default SeatSelection;
