import React from 'react';
import { cn } from '@/lib/utils';

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'bg-white border border-slate-200 text-slate-900',
    destructive: 'bg-red-50 border border-red-200 text-red-900',
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg p-4',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-tight tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };