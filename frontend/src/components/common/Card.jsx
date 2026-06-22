import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
  padding = true
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl transition-all duration-200
        ${padding ? 'p-6' : ''}
        ${hoverable ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : ''}
        ${onClick && !hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;