import * as React from "react";

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

// Simple utility to combine class names
function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        // Base styles for all buttons
        const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";

        // Variant-specific styles
        let variantStyles = "";
        switch (variant) {
            case 'default':
                variantStyles = "bg-primary text-primary-foreground shadow-gold hover:shadow-gold/80 hover:bg-primary/90";
                break;
            case 'destructive':
                variantStyles = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
                break;
            case 'outline':
                variantStyles = "border border-border bg-transparent hover:bg-accent/20 hover:text-accent-foreground hover:shadow-gold/30";
                break;
            case 'secondary':
                variantStyles = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
                break;
            case 'ghost':
                variantStyles = "hover:bg-accent hover:text-accent-foreground";
                break;
            case 'link':
                variantStyles = "text-primary underline-offset-4 hover:underline";
                break;
        }

        // Size-specific styles
        let sizeStyles = "";
        switch (size) {
            case 'default':
                sizeStyles = "h-10 px-4 py-2";
                break;
            case 'sm':
                sizeStyles = "h-9 rounded-md px-3";
                break;
            case 'lg':
                sizeStyles = "h-11 rounded-md px-8";
                break;
            case 'icon':
                sizeStyles = "h-10 w-10";
                break;
        }

        return (
            <button
                className={cn(baseStyles, variantStyles, sizeStyles, className)}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };