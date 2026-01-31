import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-plena-orange to-orange-600 text-white hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 focus:ring-plena-orange border border-transparent",
    secondary: "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 focus:ring-gray-900",
    outline: "border-2 border-plena-orange text-plena-orange hover:bg-orange-50 bg-white",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-200 hover:-translate-y-0.5 focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs uppercase tracking-wide",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};