import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  suffix?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  negative?: boolean;
}

export default function StatCard({
  title,
  value,
  change = 0,
  suffix = "from last month",
  icon,
  iconBgColor,
  iconColor,
  negative = false
}: StatCardProps) {
  const isPositiveChange = change > 0;
  const changeText = isPositiveChange ? `+${change}%` : `${change}%`;
  
  // For phishing success rate, a positive change is bad
  const changeColor = negative
    ? isPositiveChange ? "text-destructive" : "text-success"
    : isPositiveChange ? "text-success" : "text-destructive";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-semibold text-foreground mt-1">{value}</h3>
          </div>
          <div className={cn("p-2 rounded-md", iconBgColor)}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
        {typeof change === 'number' && (
          <div className="mt-2">
            <span className={cn("text-xs flex items-center", changeColor)}>
              {isPositiveChange ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              {changeText} {suffix}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
