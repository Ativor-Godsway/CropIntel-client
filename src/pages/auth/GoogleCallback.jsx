import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../api/auth';
import { setAccessToken } from '../../api/axios';
import { PageSpinner } from '../../components/shared/Spinner';

const GoogleCallback = () => {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      navigate('/login?error=google_failed');
      return;
    }

    // Store token in memory (not localStorage) and fetch user profile
    setAccessToken(token);
    getMe()
      .then(({ data }) => {
        login(token, data.user);
        navigate('/dashboard');
      })
      .catch(() => {
        setAccessToken(null);
        navigate('/login?error=google_failed');
      });
  }, []);

  return <PageSpinner />;
};

export default GoogleCallback;
