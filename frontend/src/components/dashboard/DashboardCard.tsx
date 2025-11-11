import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  showPattern?: boolean;
};

const DashboardCard = ({
  title,
  description,
  icon,
  footer,
  className = "",
  onClick,
  children,
  variant = "default",
  showPattern = true,
}: DashboardCardProps) => {
  // Variant classes
  const variantClasses = {
    default: "border-border bg-card",
    primary: "border-exam-primary/20 bg-gradient-to-b from-exam-primary/5 to-exam-primary/10",
    secondary: "border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-purple-500/10",
    success: "border-green-500/20 bg-gradient-to-b from-green-500/5 to-green-500/10",
    warning: "border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-yellow-500/10",
    danger: "border-red-500/20 bg-gradient-to-b from-red-500/5 to-red-500/10"
  };
  
  // Icon color classes
  const iconColorClasses = {
    default: "text-foreground bg-background",
    primary: "text-exam-primary bg-exam-primary/10",
    secondary: "text-purple-500 bg-purple-500/10",
    success: "text-green-500 bg-green-500/10",
    warning: "text-yellow-500 bg-yellow-500/10",
    danger: "text-red-500 bg-red-500/10"
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 border-2 overflow-hidden relative h-full", 
        variantClasses[variant],
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-opacity-100' : 'hover:shadow-md', 
        className
      )}
      onClick={onClick}
    >
      {/* Subtle pattern overlay for texture */}
      {showPattern && (
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none" 
          style={{ 
            backgroundImage: variant !== 'default' 
              ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`
              : 'none',
            backgroundSize: '12px 12px'
          }}
        />
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
        <div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          {description && <CardDescription className="text-sm mt-1 opacity-90">{description}</CardDescription>}
        </div>
        {icon && (
          <div className={cn(
            `${iconColorClasses[variant]} p-3 rounded-full shadow-sm flex items-center justify-center h-11 w-11 transition-transform group-hover:scale-110`,
            variant !== 'default' && 'animate-subtle-pulse'
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-2 relative z-10">
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className="border-t pt-3 mt-2 text-sm text-muted-foreground bg-background/40">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

// Add keyframe animation to global CSS
const addStyleToDocument = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes subtle-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.03); }
        100% { transform: scale(1); }
      }
      .animate-subtle-pulse {
        animation: subtle-pulse 3s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }
};

// Call the function to add styles
addStyleToDocument();

export default DashboardCard;
