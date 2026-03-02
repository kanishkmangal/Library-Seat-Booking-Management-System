import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { checkBackendHealth } from '../../utils/healthCheck';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check backend health on component mount
    const checkHealth = async () => {
      const health = await checkBackendHealth();
      setBackendStatus(health);
      if (!health.success) {
        setError(health.message);
      }
    };
    checkHealth();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        showToast('Login successful!', 'success');
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/booking');
        }
      } else {
        const errorMsg = result.message || 'Login failed. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {backendStatus && !backendStatus.success && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded">
            <div className="font-semibold mb-1">⚠️ Backend Connection Issue</div>
            <div className="text-sm">{backendStatus.message}</div>
            <div className="text-xs mt-2">
              <p>To fix this:</p>
              <ol className="list-decimal list-inside ml-2 space-y-1">
                <li>Navigate to the <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">backend</code> folder</li>
                <li>Run <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">npm run dev</code></li>
                <li>Ensure MongoDB is running</li>
                <li>Check that the server starts on port 5000</li>
              </ol>
            </div>
          </div>
        )}

        {error && backendStatus?.success && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

