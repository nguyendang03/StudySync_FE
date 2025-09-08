import React from 'react';

export default function FormContainer({ children }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
      {children}
    </div>
  );
}
