import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',    // Changed from username to email
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3000/auth/register', formData)
      .then(response => {
        // Handle success response
        console.log(response.data);
        navigate('/adminlogin'); // Redirect after successful registration
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 registerpage">
      <div className="p-3 rounded w-25 border registerform">
        <h2 className="text-center">Register as Admin</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100">Register</button>
          <div className="d-flex justify-content-center mt-4">
          <button  type="button" className="btn btn-secondary w-100" onClick={() => navigate('/')}>
            Back to Main
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
