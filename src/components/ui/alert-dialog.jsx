import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const AlertDialogContext = createContext({});

const AlertDialog = ({ children, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = ({ children, asChild, ...props }) => {
  const { setOpen } = useContext(AlertDialogContext);
  const child = asChild ? React.Children.only(children) : children;
  
  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      onClick: (e) => {
        child.props.onClick?.(e);
        setOpen(true);
      },
      ...props
    });
  }

  return (
    <button onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
};

const AlertDialogContent = ({ className, children, ...props }) => {
  const { open, setOpen } = useContext(AlertDialogContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={() => setOpen(false)}
      />
      <div className={cn(
        "fixed z-50 grid w-full max-w-lg scale-100 gap-4 border bg-white p-6 opacity-100 shadow-lg animate-in fade-in-90 zoom-in-90 sm:rounded-lg md:w-full",
        className
      )} {...props}>
        {children}
      </div>
    </div>
  );
};

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-start", className)} {...props} />
);

const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)} {...props} />
);

const AlertDialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

const AlertDialogDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-slate-500", className)} {...props} />
);

const AlertDialogAction = ({ className, onClick, ...props }) => {
   const { setOpen } = useContext(AlertDialogContext);
   return (
    <Button 
      className={className} 
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }} 
      {...props} 
    />
   );
};

const AlertDialogCancel = ({ className, onClick, ...props }) => {
  const { setOpen } = useContext(AlertDialogContext);
  return (
    <Button 
      variant="outline"
      className={cn("mt-2 sm:mt-0", className)} 
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }} 
      {...props} 
    />
   );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};