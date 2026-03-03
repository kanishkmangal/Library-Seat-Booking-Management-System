import { useState, useMemo } from 'react';

const normalizeStatus = (status) => {
  if (!status) return 'available';
  const s = status.toLowerCase();
  if (s === 'booked') return 'booked';
  if (s === 'locked') return 'locked';
  return 'available';
};

const SeatGrid = ({ seats = [], selectedSeats = [], onSeatSelect, userGender }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const rows = useMemo(() => {
    if (!Array.isArray(seats) || seats.length === 0) return [];

    const grouped = {};
    seats.forEach((seat) => {
      const rowKey = String(seat.row);
      if (!grouped[rowKey]) grouped[rowKey] = { LEFT: [], RIGHT: [] };

      const section = seat.section || 'LEFT';
      grouped[rowKey][section].push({
        ...seat,
        status: normalizeStatus(seat.status),
      });
    });

    const sortedRowKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    return sortedRowKeys.map((rowKey) => ({
      row: rowKey,
      left: grouped[rowKey].LEFT.sort((a, b) => a.column - b.column),
      right: grouped[rowKey].RIGHT.sort((a, b) => a.column - b.column),
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

    if (seat.status === 'booked') return 'bg-gray-500 text-white cursor-not-allowed opacity-60';
    if (seat.status === 'locked') return 'bg-red-400 text-white cursor-not-allowed opacity-50';
    if (isSelected) return 'bg-blue-600 text-white ring-2 ring-blue-300 transform scale-105';

    // Available state with gender coloring
    if (seat.genderType === 'female') {
      return 'bg-pink-500 text-white hover:bg-pink-600 transition-all duration-200';
    }
    return 'bg-green-500 text-white hover:bg-green-600 transition-all duration-200';
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      <div className="flex flex-col space-y-4">
        {/* Screen */}
        <div className="w-full text-center mb-8">
          <div className="bg-gray-200 dark:bg-gray-800 h-10 rounded-lg flex items-center justify-center text-sm font-medium text-gray-500 tracking-widest uppercase">
            Screen / Entrance
          </div>
        </div>

        {rows.map(({ row, left, right }) => {
          const isRowA = row === 'A';
          const isRowH = row === 'H';

          return (
            <div key={`row-${row}`} className="grid grid-cols-[30px_1fr] items-center gap-4">
              <span className="text-sm font-bold text-gray-400">{row}</span>

              <div
                className="grid gap-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: isRowA
                    ? 'repeat(18, 1fr)'
                    : 'repeat(8, 1fr) 60px repeat(8, 1fr)'
                }}
              >
                {/* Row A: Continuous Block */}
                {isRowA ? (
                  <>
                    {[...left, ...right]
                      .sort((a, b) => a.seatNumber - b.seatNumber)
                      .map((seat) => (
                        <button
                          key={seat._id}
                          onClick={() => handleSeatClick(seat)}
                          className={`relative aspect-square rounded-md text-[10px] md:text-xs font-bold shadow-sm flex items-center justify-center ${getClass(seat)}`}
                          disabled={seat.status === 'booked' || seat.status === 'locked'}
                          title={`Seat ${seat.seatNumber} (${seat.genderType})`}
                        >
                          {seat.seatNumber}
                        </button>
                      ))}
                  </>
                ) : (
                  <>
                    {/* Left Block */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const seat = left.find(s => s.column === i + 1);
                      return seat ? (
                        <button
                          key={seat._id}
                          onClick={() => handleSeatClick(seat)}
                          className={`relative aspect-square rounded-md text-[10px] md:text-xs font-bold shadow-sm flex items-center justify-center ${getClass(seat)}`}
                          disabled={seat.status === 'booked' || seat.status === 'locked'}
                          title={`Seat ${seat.seatNumber} (${seat.genderType})`}
                        >
                          {seat.seatNumber}
                        </button>
                      ) : <div key={`empty-left-${i}`} className="aspect-square" />;
                    })}

                    {/* Aisle - Spacing Only */}
                    <div />

                    {/* Right Block */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      // Row H offset: Empty column at the start of Right block
                      const dataColumnToFind = isRowH ? i : i + 1;
                      const seat = right.find(s => s.column === dataColumnToFind);
                      return seat ? (
                        <button
                          key={seat._id}
                          onClick={() => handleSeatClick(seat)}
                          className={`relative aspect-square rounded-md text-[10px] md:text-xs font-bold shadow-sm flex items-center justify-center ${getClass(seat)}`}
                          disabled={seat.status === 'booked' || seat.status === 'locked'}
                          title={`Seat ${seat.seatNumber} (${seat.genderType})`}
                        >
                          {seat.seatNumber}
                        </button>
                      ) : <div key={`empty-right-${i}`} className="aspect-square" />;
                    })}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-xs font-medium">Male Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-pink-500"></div>
          <span className="text-xs font-medium">Female Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600"></div>
          <span className="text-xs font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500 opacity-60"></div>
          <span className="text-xs font-medium">Occupied</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
