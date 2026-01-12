import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Database, FileText, Users, TrendingUp, AlertCircle, LayoutDashboard } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pb-4">
        <div>
          <div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl shadow-primary/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">Overview of your metadata management system</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-8 px-4">
        <div className="stack-lg">

          {/* Key Metrics */}
          <div className="grid-auto-fill gap-lg">
            <Card>
              <CardHeader className="flex-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
                <Database className="icon-sm icon-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-heading-md">1,247</div>
                <p className="text-muted">
                  <span className="text-success">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                <BarChart3 className="icon-sm icon-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-heading-md">23</div>
                <p className="text-muted">
                  <span className="text-success">+2</span> new this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="icon-sm icon-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-heading-md">142</div>
                <p className="text-muted">
                  <span className="text-success">+7%</span> this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentation</CardTitle>
                <FileText className="icon-sm icon-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-heading-md">89%</div>
                <p className="text-muted">
                  Coverage complete
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Progress */}
          <div className="grid-half gap-lg">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Score</CardTitle>
                <CardDescription>Overall data quality across all sources</CardDescription>
              </CardHeader>
              <CardContent className="stack-md">
                <div className="stack-sm">
                  <div className="flex-between text-sm">
                    <span>Completeness</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="stack-sm">
                  <div className="flex-between text-sm">
                    <span>Accuracy</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="stack-sm">
                  <div className="flex-between text-sm">
                    <span>Consistency</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="stack-sm">
                  <div className="flex-between text-sm">
                    <span>Timeliness</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates and changes</CardDescription>
              </CardHeader>
              <CardContent className="stack-md">
                <div className="flex-start gap-3">
                  <div className="status-dot-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New entity created in Customer namespace</p>
                    <p className="text-muted">2 hours ago</p>
                  </div>
                </div>
                <div className="flex-start gap-3">
                  <div className="status-dot-success mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data quality check completed</p>
                    <p className="text-muted">4 hours ago</p>
                  </div>
                </div>
                <div className="flex-start gap-3">
                  <div className="status-dot-warning mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Schema validation warning in Product table</p>
                    <p className="text-muted">1 day ago</p>
                  </div>
                </div>
                <div className="flex-start gap-3">
                  <div className="status-dot-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">User access granted for Sales team</p>
                    <p className="text-muted">2 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts and Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex-start gap-sm">
                <AlertCircle className="icon-md text-warning" />
                System Alerts
              </CardTitle>
              <CardDescription>Important notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent className="stack-md">
              <div className="flex-between bordered-container bg-warning/5 border-warning/20">
                <div className="flex-start gap-3">
                  <AlertCircle className="icon-md text-warning" />
                  <div>
                    <p className="font-medium">Schema Drift Detected</p>
                    <p className="text-muted">Order table structure has changed unexpectedly</p>
                  </div>
                </div>
                <Badge variant="secondary">High</Badge>
              </div>
              <div className="flex-between bordered-container">
                <div className="flex-start gap-3">
                  <TrendingUp className="icon-md icon-primary" />
                  <div>
                    <p className="font-medium">Data Volume Increase</p>
                    <p className="text-muted">Customer data has grown by 25% this week</p>
                  </div>
                </div>
                <Badge variant="outline">Info</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}