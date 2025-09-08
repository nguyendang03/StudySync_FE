import React from 'react';

export default function InputField({ 
  label, 
  type = "text", 
  id, 
  placeholder, 
  value, 
  onChange, 
  rightIcon, 
  ...props 
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-white mb-3">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-5 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 backdrop-blur-sm ${
            rightIcon ? 'pr-14' : ''
          }`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
}
