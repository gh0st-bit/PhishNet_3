import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download, FileDown, Calendar } from "lucide-react";
import { useTheme } from "next-themes";

export default function ReportsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Colors for charts
  const colors = {
    text: isDark ? "#C9D1D9" : "#24292F",
    muted: isDark ? "#8B949E" : "#6E7781",
    grid: isDark ? "#30363D" : "#EAEEF2",
    line: isDark ? "#58A6FF" : "#0969DA",
    chartColors: ["#58A6FF", "#39D353", "#F0883E", "#FF7B72", "#8B949E"]
  };

  // Fake data for demonstration
  const monthlyData = [
    { name: "Jan", sent: 420, opened: 340, clicked: 180, submitted: 65 },
    { name: "Feb", sent: 380, opened: 290, clicked: 190, submitted: 81 },
    { name: "Mar", sent: 510, opened: 370, clicked: 250, submitted: 94 },
    { name: "Apr", sent: 550, opened: 410, clicked: 280, submitted: 120 },
    { name: "May", sent: 490, opened: 350, clicked: 220, submitted: 98 },
    { name: "Jun", sent: 460, opened: 320, clicked: 190, submitted: 65 },
    { name: "Jul", sent: 510, opened: 390, clicked: 240, submitted: 87 },
  ];

  const campaignTypeData = [
    { name: "Credential Harvest", value: 35 },
    { name: "Malware", value: 25 },
    { name: "Data Entry", value: 20 },
    { name: "Awareness Training", value: 15 },
    { name: "Other", value: 5 },
  ];

  const departmentData = [
    { name: "Finance", success: 45, fail: 55 },
    { name: "IT", success: 68, fail: 32 },
    { name: "HR", success: 52, fail: 48 },
    { name: "Marketing", success: 38, fail: 62 },
    { name: "Executive", success: 60, fail: 40 },
  ];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Filter by Date
          </Button>
          <Button>
            <FileDown className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-background border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=inactive]:text-foreground">Overview</TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=inactive]:text-foreground">Campaign Reports</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=inactive]:text-foreground">User Performance</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=inactive]:text-foreground">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Monthly metrics chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Phishing Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis 
                      dataKey="name" 
                      stroke={colors.muted} 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={colors.muted} 
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: isDark ? "#161B22" : "#FFF",
                        borderColor: colors.grid,
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sent" 
                      stroke={colors.chartColors[0]} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opened" 
                      stroke={colors.chartColors[1]} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicked" 
                      stroke={colors.chartColors[2]} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="submitted" 
                      stroke={colors.chartColors[3]} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Types */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={campaignTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {campaignTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: isDark ? "#161B22" : "#FFF",
                          borderColor: colors.grid,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                      <XAxis 
                        type="number" 
                        stroke={colors.muted} 
                        fontSize={12}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={colors.muted} 
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: isDark ? "#161B22" : "#FFF",
                          borderColor: colors.grid,
                        }}
                      />
                      <Legend />
                      <Bar dataKey="success" stackId="a" fill={colors.chartColors[1]} />
                      <Bar dataKey="fail" stackId="a" fill={colors.chartColors[3]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a campaign to view detailed reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">User performance reporting will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Trend analysis will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
