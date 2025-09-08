import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import InputField from './InputField';

export default function PasswordInput({ label, id, placeholder, value, onChange, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleIcon = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-white/80 hover:text-white transition-colors"
    >
      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
    </button>
  );

  return (
    <InputField
      label={label}
      type={showPassword ? "text" : "password"}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rightIcon={toggleIcon}
      {...props}
    />
  );
}
