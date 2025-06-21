import React from 'react';

interface SafeRenderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SafeRender: React.FC<SafeRenderProps> = ({ 
  children, 
  fallback = "Unable to display content" 
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Render error:', error);
    return <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{fallback}</div>;
  }
};

export default SafeRender; 