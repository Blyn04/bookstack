import React, { useState } from 'react';

interface LoginProps {
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username && password) {
      localStorage.setItem('user', username);
      onLoginSuccess(username);
      onClose();
    } else {
      alert('Please enter username and password.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
