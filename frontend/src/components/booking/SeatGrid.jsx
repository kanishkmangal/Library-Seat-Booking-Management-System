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
    <div className="w-full overflow-x-auto overflow-y-hidden mt-4 mb-8 pb-4 custom-scrollbar lg:scale-105 origin-top">
      <div className="min-w-[700px] lg:min-w-0 px-2 lg:px-0 space-y-4 md:space-y-6">
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
            <div key={`row-${row}`} className="grid grid-cols-[30px_1fr] items-center gap-[10px] w-full mb-3 whitespace-nowrap">
              <span className="text-xs md:text-sm font-bold text-gray-400 text-center">{row}</span>

              <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-[8px] w-full">
                {Array.from({ length: 18 }).map((_, index) => {
                  let seat = null;

                  if (isRowA) {
                    const rowASeats = [...left, ...right].sort((a, b) => a.seatNumber - b.seatNumber);
                    seat = rowASeats[index];
                  } else {
                    if (index < 8) {
                      seat = left.find(s => s.column === index + 1);
                    } else if (index >= 10) {
                      const slotIndex = index - 10;
                      const dataColumnToFind = isRowH ? slotIndex : slotIndex + 1;
                      seat = right.find(s => s.column === dataColumnToFind);
                    }
                  }

                  if (!seat) {
                    return <div key={`empty-${row}-${index}`} className="w-full aspect-square opacity-0 pointer-events-none" aria-hidden="true" />;
                  }

                  return (
                    <button
                      key={seat._id}
                      onClick={() => handleSeatClick(seat)}
                      className={`w-full aspect-square text-[12px] font-bold rounded shadow-sm flex items-center justify-center transition-all ${getClass(seat)} leading-none p-0 overflow-hidden`}
                      disabled={seat.status === 'booked' || seat.status === 'locked'}
                      title={`Seat ${seat.seatNumber} (${seat.genderType || 'any'})`}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl min-w-[700px] lg:min-w-0">
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
