'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Server,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface SystemMetrics {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export function MonitoringDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    status: 'healthy',
    uptime: 99.9,
    responseTime: 120,
    errorRate: 0.1,
    activeUsers: 45,
    databaseConnections: 12,
    memoryUsage: 65,
    cpuUsage: 23,
  });

  const [performanceMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 1200,
    firstContentfulPaint: 800,
    largestContentfulPaint: 1500,
    cumulativeLayoutShift: 0.05,
    firstInputDelay: 50,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        responseTime: prev.responseTime + (Math.random() - 0.5) * 20,
        activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 10)),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 15)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshMetrics = async () => {
    setIsLoading(true);
    try {
      // In a real app, fetch from monitoring API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate updated metrics
      setSystemMetrics(prev => ({
        ...prev,
        responseTime: 100 + Math.random() * 50,
        errorRate: Math.random() * 0.5,
      }));
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatDuration = (ms: number) => {
    return `${ms.toFixed(0)}ms`;
  };

  const getPerformanceScore = (metric: number, thresholds: { good: number; poor: number }) => {
    if (metric <= thresholds.good) return 'good';
    if (metric <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time system health and performance metrics</p>
        </div>
        <Button onClick={refreshMetrics} disabled={isLoading}>
          {isLoading ? (
            <Activity className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Activity className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(systemMetrics.status)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemMetrics.status)}`}>
              {systemMetrics.status.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {formatUptime(systemMetrics.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(systemMetrics.responseTime)}</div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics.responseTime < 200 ? (
                <span className="flex items-center text-green-600">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  Excellent
                </span>
              ) : (
                <span className="flex items-center text-yellow-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Acceptable
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics.errorRate < 1 ? (
                <span className="text-green-600">Within limits</span>
              ) : (
                <span className="text-red-600">Above threshold</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Page Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(performanceMetrics.pageLoadTime)}
                </div>
                <Badge
                  variant="outline"
                  className={getScoreColor(
                    getPerformanceScore(performanceMetrics.pageLoadTime, { good: 1000, poor: 2500 })
                  )}
                >
                  {getPerformanceScore(performanceMetrics.pageLoadTime, { good: 1000, poor: 2500 })}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">First Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(performanceMetrics.firstContentfulPaint)}
                </div>
                <Badge
                  variant="outline"
                  className={getScoreColor(
                    getPerformanceScore(performanceMetrics.firstContentfulPaint, {
                      good: 1800,
                      poor: 3000,
                    })
                  )}
                >
                  {getPerformanceScore(performanceMetrics.firstContentfulPaint, {
                    good: 1800,
                    poor: 3000,
                  })}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Largest Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(performanceMetrics.largestContentfulPaint)}
                </div>
                <Badge
                  variant="outline"
                  className={getScoreColor(
                    getPerformanceScore(performanceMetrics.largestContentfulPaint, {
                      good: 2500,
                      poor: 4000,
                    })
                  )}
                >
                  {getPerformanceScore(performanceMetrics.largestContentfulPaint, {
                    good: 2500,
                    poor: 4000,
                  })}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">First Input Delay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(performanceMetrics.firstInputDelay)}
                </div>
                <Badge
                  variant="outline"
                  className={getScoreColor(
                    getPerformanceScore(performanceMetrics.firstInputDelay, {
                      good: 100,
                      poor: 300,
                    })
                  )}
                >
                  {getPerformanceScore(performanceMetrics.firstInputDelay, {
                    good: 100,
                    poor: 300,
                  })}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cumulative Layout Shift</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceMetrics.cumulativeLayoutShift.toFixed(3)}
                </div>
                <Badge
                  variant="outline"
                  className={getScoreColor(
                    getPerformanceScore(performanceMetrics.cumulativeLayoutShift, {
                      good: 0.1,
                      poor: 0.25,
                    })
                  )}
                >
                  {getPerformanceScore(performanceMetrics.cumulativeLayoutShift, {
                    good: 0.1,
                    poor: 0.25,
                  })}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.memoryUsage.toFixed(0)}%</div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      systemMetrics.memoryUsage > 80
                        ? 'bg-red-600'
                        : systemMetrics.memoryUsage > 60
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                    }`}
                    style={{ width: `${systemMetrics.memoryUsage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.cpuUsage.toFixed(0)}%</div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      systemMetrics.cpuUsage > 80
                        ? 'bg-red-600'
                        : systemMetrics.cpuUsage > 60
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                    }`}
                    style={{ width: `${systemMetrics.cpuUsage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DB Connections</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.databaseConnections}</div>
                <p className="text-xs text-muted-foreground">Active connections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">All regions operational</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest error reports and system issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 rounded-lg border p-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium">High response time detected</p>
                    <p className="text-sm text-muted-foreground">
                      API response time exceeded 500ms threshold - 2 minutes ago
                    </p>
                  </div>
                  <Badge variant="secondary">Warning</Badge>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border p-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">Database connection restored</p>
                    <p className="text-sm text-muted-foreground">
                      Connection pool recovered successfully - 15 minutes ago
                    </p>
                  </div>
                  <Badge variant="outline">Resolved</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
