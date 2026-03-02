import { useState, useMemo } from 'react';

const normalizeStatus = (status) => {
  if (!status) return 'available';
  const s = status.toLowerCase();
  if (s === 'booked') return 'booked';
  if (s === 'locked') return 'locked';
  return 'available';
};

const SeatGrid = ({ seats = [], selectedSeats = [], onSeatSelect }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  /* =========================
     SAFE SEAT GROUPING
     ========================= */
  const rows = useMemo(() => {
    if (!Array.isArray(seats) || seats.length === 0) {
      console.log('SeatGrid: No seats array or empty array');
      return [];
    }

    console.log('SeatGrid: Processing seats', seats.length, seats);

    const grouped = {};

    seats.forEach((seat) => {
      // Handle both string and number rows (e.g., "A", "B" or 1, 2)
      const rowValue = seat.row;
      const columnValue = seat.column;

      // Skip if row or column is missing/null/undefined
      if (rowValue == null || columnValue == null) {
        console.warn('SeatGrid: Skipping seat with missing row/column', seat);
        return;
      }

      // Convert to string for grouping (handles both "A" and 1)
      const rowKey = String(rowValue);
      const column = Number(columnValue);

      // Skip if column is not a valid number
      if (isNaN(column)) {
        console.warn('SeatGrid: Skipping seat with invalid column', seat);
        return;
      }

      if (!grouped[rowKey]) grouped[rowKey] = [];
      grouped[rowKey].push({
        ...seat,
        row: rowKey, // Keep original row value (string or number)
        column,
        status: normalizeStatus(seat.status),
      });
    });

    console.log('SeatGrid: Grouped seats', grouped);

    // Sort rows - handle both numeric and alphabetic rows
    const sortedRowKeys = Object.keys(grouped).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      // If both are numbers, sort numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      // Otherwise sort alphabetically
      return a.localeCompare(b);
    });

    return sortedRowKeys.map((rowKey) => ({
      row: rowKey,
      seats: grouped[rowKey].sort((a, b) => a.column - b.column),
    }));
  }, [seats]);

  if (rows.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No seats available
      </div>
    );
  }

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') return;
    onSeatSelect(seat._id);
  };

  const getClass = (seat) => {
    const isSelected = selectedSeats.includes(seat._id);
    
    if (seat.status === 'booked')
      return 'bg-gray-500 text-white cursor-not-allowed opacity-60';
    if (seat.status === 'locked')
      return 'bg-red-400 text-white cursor-not-allowed opacity-50';
    if (isSelected)
      return 'bg-blue-500 text-white ring-2 ring-blue-300 hover:bg-blue-600 transform scale-110';
    return 'bg-green-500 text-white hover:bg-green-600 hover:scale-110 transition-all duration-200';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-col items-center space-y-2">

        {/* Screen */}
        <div className="w-full max-w-4xl mb-4 text-center">
          <div className="bg-gray-300 dark:bg-gray-700 h-8 rounded flex items-center justify-center">
            Screen / Entrance
          </div>
        </div>

        {rows.map(({ row, seats }) => (
          <div key={`row-${row}`} className="flex items-center gap-2">
            <span className="w-8 text-center font-semibold">{row}</span>

            <div className="flex gap-1">
              {seats.map((seat) => {
                const isSelected = selectedSeats.includes(seat._id);
                return (
                  <button
                    key={`seat-${seat._id}`}
                    onClick={() => handleSeatClick(seat)}
                    onMouseEnter={() => setHoveredSeat(seat._id)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    className={`w-10 h-10 rounded transition-all duration-200 ${getClass(seat)}`}
                    disabled={seat.status === 'booked' || seat.status === 'locked'}
                    aria-label={`Seat ${seat.seatNumber} - ${seat.status}`}
                  >
                    {seat.column}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;
