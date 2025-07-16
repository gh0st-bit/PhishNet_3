import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RiskUser {
  id: number;
  name: string;
  department: string;
  riskLevel: "High Risk" | "Medium Risk" | "Low Risk";
  avatar?: string;
}

interface AtRiskUsersProps {
  users?: RiskUser[];
}

export default function AtRiskUsers({ users }: AtRiskUsersProps) {
  const getRiskLevelColor = (level: string) => {
    switch(level) {
      case "High Risk": return "text-destructive";
      case "Medium Risk": return "text-warning";
      case "Low Risk": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>At-Risk Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-secondary text-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{user.name}</h4>
                  <p className="text-xs text-muted-foreground">{user.department}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-xs font-medium ${getRiskLevelColor(user.riskLevel)}`}>
                  {user.riskLevel}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No at-risk users found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
