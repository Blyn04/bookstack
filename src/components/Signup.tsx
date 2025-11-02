import React, { useState } from 'react';

interface SignupProps {
  onClose: () => void;
  onSignupSuccess: (username: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onClose, onSignupSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    if (username && password) {
      localStorage.setItem('user', username);
      onSignupSuccess(username);
      onClose();
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="signup-overlay" onClick={onClose}>
      <div className="signup-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="Create Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="signup-btn" onClick={handleSignup}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Signup;
