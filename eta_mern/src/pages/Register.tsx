
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the unified auth page
    navigate('/auth', { replace: true });
  }, [navigate]);

  return null;
};

export default Register;
