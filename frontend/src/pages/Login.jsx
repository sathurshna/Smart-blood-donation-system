import { useState } from 'react';
import { loginUser } from '../services/auth.service';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();

    setError('');

    try {
      const data = await loginUser(email, password);

      console.log('Login successful:', data);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h1>Smart Blood Donation System</h1>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <button type="submit">
          Login
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;