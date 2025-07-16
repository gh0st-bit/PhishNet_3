import AppLayout from "@/components/layout/app-layout";
import StatCard from "@/components/dashboard/stat-card";
import RecentCampaigns from "@/components/dashboard/recent-campaigns";
import PhishingMetricsChart from "@/components/dashboard/phishing-metrics-chart";
import ThreatLandscape from "@/components/dashboard/threat-landscape";
import AtRiskUsers from "@/components/dashboard/at-risk-users";
import SecurityTraining from "@/components/dashboard/security-training";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Activity, 
  ChartLine, 
  Users, 
  GraduationCap 
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: campaignsData } = useQuery({
    queryKey: ['/api/campaigns/recent'],
  });

  const { data: phishingMetrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  const { data: threatData } = useQuery({
    queryKey: ['/api/dashboard/threats'],
  });

  const { data: riskUsers } = useQuery({
    queryKey: ['/api/dashboard/risk-users'],
  });

  const { data: trainingData } = useQuery({
    queryKey: ['/api/dashboard/training'],
  });

  return (
    <AppLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Active Campaigns"
          value={dashboardStats?.activeCampaigns || 0}
          change={dashboardStats?.campaignChange || 0}
          icon={<Activity />}
          iconBgColor="bg-blue-900/30"
          iconColor="text-primary"
        />
        <StatCard 
          title="Phishing Success Rate"
          value={`${dashboardStats?.successRate || 0}%`}
          change={dashboardStats?.successRateChange || 0}
          icon={<ChartLine />}
          iconBgColor="bg-red-900/30"
          iconColor="text-destructive"
          negative
        />
        <StatCard 
          title="Total Users"
          value={dashboardStats?.totalUsers || 0}
          change={dashboardStats?.newUsers || 0}
          suffix="new this week"
          icon={<Users />}
          iconBgColor="bg-green-900/30"
          iconColor="text-success"
        />
        <StatCard 
          title="Training Completion"
          value={`${dashboardStats?.trainingCompletion || 0}%`}
          change={dashboardStats?.trainingCompletionChange || 0}
          icon={<GraduationCap />}
          iconBgColor="bg-yellow-900/30"
          iconColor="text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentCampaigns campaigns={campaignsData} />
        </div>
        <PhishingMetricsChart data={phishingMetrics} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ThreatLandscape threats={threatData} />
        <AtRiskUsers users={riskUsers} />
        <SecurityTraining trainings={trainingData} />
      </div>
    </AppLayout>
  );
}
