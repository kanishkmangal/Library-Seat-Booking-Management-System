import { useState, useEffect } from 'react';
import { adminAPI, seatAPI } from '../../services/api';

const AdminSeats = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [formData, setFormData] = useState({
    seatNumber: '',
    row: '',
    column: '',
    section: '',
    status: 'available',
  });
  const [bulkData, setBulkData] = useState('');

  useEffect(() => {
    loadSeats();
  }, []);

  const loadSeats = async () => {
    try {
      const response = await seatAPI.getAll();
      setSeats(response.data.seats);
    } catch (error) {
      console.error('Failed to load seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createSeat(formData);
      setShowCreateForm(false);
      setFormData({
        seatNumber: '',
        row: '',
        column: '',
        section: '',
        status: 'available',
      });
      loadSeats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create seat');
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    try {
      const lines = bulkData.trim().split('\n');
      const seatsData = lines
        .map((line) => {
          const [seatNumber, row, column, section, status] = line.split(',');
          if (!seatNumber || !row || !column || !section) return null;
          return {
            seatNumber: seatNumber.trim(),
            row: row.trim(),
            column: parseInt(column.trim()),
            section: section.trim(),
            status: (status?.trim() || 'available'),
          };
        })
        .filter(Boolean);

      if (seatsData.length === 0) {
        alert('Invalid format. Expected: seatNumber,row,column,section,status');
        return;
      }

      await adminAPI.createMultipleSeats(seatsData);
      setShowBulkForm(false);
      setBulkData('');
      loadSeats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create seats');
    }
  };

  const handleUpdate = async (seatId, updates) => {
    try {
      await adminAPI.updateSeat(seatId, updates);
      loadSeats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update seat');
    }
  };

  const handleDelete = async (seatId) => {
    if (!window.confirm('Are you sure you want to delete this seat?')) {
      return;
    }

    try {
      await adminAPI.deleteSeat(seatId);
      loadSeats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete seat');
    }
  };

  const handleForceRelease = async (seatId) => {
    if (!window.confirm('This will cancel all active bookings for this seat. Continue?')) {
      return;
    }

    try {
      const response = await adminAPI.forceReleaseSeat(seatId);
      alert(`Seat force-released. ${response.data.cancelledBookings} booking(s) cancelled.`);
      loadSeats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to force-release seat');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'booked':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      case 'locked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading seats...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Seats</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Seat
          </button>
          <button
            onClick={() => setShowBulkForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Bulk Add
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Seat</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Seat Number (e.g., A1)"
                  value={formData.seatNumber}
                  onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Row (e.g., A)"
                  value={formData.row}
                  onChange={(e) => setFormData({ ...formData, row: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Column (e.g., 1)"
                  value={formData.column}
                  onChange={(e) => setFormData({ ...formData, column: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Section (e.g., Ground Floor)"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Bulk Create Seats</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Format: seatNumber,row,column,section,status (one per line)
            </p>
            <form onSubmit={handleBulkCreate}>
              <textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                placeholder="A1,A,1,Ground Floor,available&#10;A2,A,2,Ground Floor,available"
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create All
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkForm(false)}
                  className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Seat Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Row / Column
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {seats.map((seat) => (
                <tr key={seat._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{seat.seatNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {seat.row} - {seat.column}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{seat.section}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={seat.status}
                      onChange={(e) => handleUpdate(seat._id, { status: e.target.value })}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        seat.status
                      )} border-0`}
                    >
                      <option value="available">Available</option>
                      <option value="locked">Locked</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleForceRelease(seat._id)}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-sm"
                        title="Force release seat (cancels all bookings)"
                      >
                        Force Release
                      </button>
                      <button
                        onClick={() => handleDelete(seat._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSeats;

