import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface Campaign {
  id: number;
  name: string;
  status: "Active" | "Completed" | "Scheduled" | "Draft";
  openRate: number | null;
  clickRate: number | null;
  createdAt: string;
}

interface RecentCampaignsProps {
  campaigns?: Campaign[];
}

export default function RecentCampaigns({ campaigns }: RecentCampaignsProps) {
  const [, navigate] = useLocation();

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Scheduled":
        return "info";
      case "Completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-5 px-6">
        <CardTitle>Recent Campaigns</CardTitle>
        <Button 
          variant="link" 
          className="text-xs" 
          onClick={() => navigate("/campaigns")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.openRate !== null ? `${campaign.openRate}%` : "-"}</TableCell>
                    <TableCell>{campaign.clickRate !== null ? `${campaign.clickRate}%` : "-"}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No campaigns found. Create your first campaign.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
