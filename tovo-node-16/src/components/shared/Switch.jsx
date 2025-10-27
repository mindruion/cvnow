import React from 'react';

const Switch = ({ 
  checked, 
  onChange, 
  label, 
  disabled = false,
  className = '',
  id 
}) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <label className={`resume-toggle mb-0 ${className}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className="slider" />
      <span className="label-text">{label}</span>
    </label>
  );
};

export default Switch;
