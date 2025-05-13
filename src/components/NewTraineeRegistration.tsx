import React, { useState } from 'react';
import { TraineeRegistrationForm } from './TraineeRegistrationForm';
import { useNavigate } from 'react-router-dom';

export function NewTraineeRegistration() {
  const navigate = useNavigate();
  const [showRegistrationForm, setShowRegistrationForm] = useState(true);

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    // Navigate to login page after successful registration
    setTimeout(() => {
      navigate('/trainee/login');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/trainee/login');
  };

  return (
    <>
      {showRegistrationForm && (
        <TraineeRegistrationForm
          onSuccess={handleRegistrationSuccess}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}