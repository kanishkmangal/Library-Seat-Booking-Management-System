import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd) => ({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  });

  const pwdRules = validatePassword(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isPasswordValid = Object.values(pwdRules).every(Boolean);

    if (!isPasswordValid) {
      const missing = [];
      if (!pwdRules.length) missing.push('8 characters');
      if (!pwdRules.uppercase) missing.push('uppercase letter');
      if (!pwdRules.lowercase) missing.push('lowercase letter');
      if (!pwdRules.number) missing.push('number');
      if (!pwdRules.special) missing.push('special character');
      
      setError(`Password missing: ${missing.join(', ')}`);
      setLoading(false);
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);

    if (result.success) {
      navigate('/booking');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Dynamic Password Validation Rules */}
            {(passwordFocused || formData.password.length > 0) && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1.5 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-300">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Password must contain:</p>
                <ul className="space-y-1.5">
                  <li className={`flex items-center gap-2 ${pwdRules.length ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span>{pwdRules.length ? '✔' : '❌'}</span> At least 8 characters
                  </li>
                  <li className={`flex items-center gap-2 ${pwdRules.uppercase ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span>{pwdRules.uppercase ? '✔' : '❌'}</span> At least 1 uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${pwdRules.lowercase ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span>{pwdRules.lowercase ? '✔' : '❌'}</span> At least 1 lowercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${pwdRules.number ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span>{pwdRules.number ? '✔' : '❌'}</span> At least 1 number
                  </li>
                  <li className={`flex items-center gap-2 ${pwdRules.special ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span>{pwdRules.special ? '✔' : '❌'}</span> At least 1 special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

