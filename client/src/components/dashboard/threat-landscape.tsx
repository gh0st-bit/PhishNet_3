import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface Threat {
  id: number;
  name: string;
  description: string;
  level: "high" | "medium" | "low";
}

interface ThreatLandscapeProps {
  threats?: Threat[];
}

export default function ThreatLandscape({ threats }: ThreatLandscapeProps) {
  const getIconColor = (level: string) => {
    switch(level) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-primary";
      default: return "text-primary";
    }
  };

  const getIconBgColor = (level: string) => {
    switch(level) {
      case "high": return "bg-red-900/30";
      case "medium": return "bg-yellow-900/30";
      case "low": return "bg-blue-900/30";
      default: return "bg-blue-900/30";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Threat Landscape</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {threats && threats.length > 0 ? (
          threats.map((threat) => (
            <div key={threat.id} className="flex items-start space-x-3">
              <div className={cn("p-1 rounded-md", getIconBgColor(threat.level))}>
                <AlertTriangle className={cn("h-4 w-4", getIconColor(threat.level))} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">{threat.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{threat.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No threat data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
