import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  People,
  Business,
  TrendingUp,
  Assignment,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface DashboardStats {
  totalEmployees: number;
  totalOrganizations: number;
  activeContracts: number;
  departments: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalOrganizations: 0,
    activeContracts: 0,
    departments: 0,
  });

  const [orgData, setOrgData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, orgsRes] = await Promise.all([
        axios.get('/api/employees?limit=1000'),
        axios.get('/api/organizations'),
      ]);

      const employees = employeesRes.data.data;
      const organizations = orgsRes.data;

      const locationCounts: { [key: string]: number } = {};
      employees.forEach((emp: any) => {
        if (emp.location) {
          locationCounts[emp.location] = (locationCounts[emp.location] || 0) + 1;
        }
      });

      const locationChartData = Object.entries(locationCounts).map(([name, value]) => ({
        name,
        value,
      }));

      const orgTypeCounts: { [key: string]: number } = {};
      organizations.forEach((org: any) => {
        const type = org.org_level || 'Other';
        orgTypeCounts[type] = (orgTypeCounts[type] || 0) + 1;
      });

      const orgChartData = Object.entries(orgTypeCounts).map(([name, count]) => ({
        name,
        count,
      }));

      setStats({
        totalEmployees: employeesRes.data.pagination.total,
        totalOrganizations: organizations.length,
        activeContracts: employees.filter((e: any) => {
          const endDate = new Date(e.endda);
          return endDate > new Date();
        }).length,
        departments: organizations.filter((o: any) => o.org_level === 'Abteilung').length,
      });

      setLocationData(locationChartData);
      setOrgData(orgChartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const COLORS = ['#0070f2', '#e26e00', '#16a34a', '#dc2626', '#0ea5e9'];

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: <People />,
      color: '#0070f2',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Organizations',
      value: stats.totalOrganizations,
      icon: <Business />,
      color: '#16a34a',
      trend: '+3%',
      trendUp: true,
    },
    {
      title: 'Active Contracts',
      value: stats.activeContracts,
      icon: <Assignment />,
      color: '#e26e00',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Departments',
      value: stats.departments,
      icon: <TrendingUp />,
      color: '#0ea5e9',
      trend: '0%',
      trendUp: false,
    },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            mb: 1
          }}
        >
          Welcome back!
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#64748b',
            fontWeight: 400
          }}
        >
          Here's what's happening with your human capital today.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'visible',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        fontWeight: 500,
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.75rem'
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        fontSize: '2rem',
                        lineHeight: 1,
                        mb: 1
                      }}
                    >
                      {card.value?.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {card.trendUp ? (
                        <ArrowUpward sx={{ fontSize: '1rem', color: '#16a34a' }} />
                      ) : (
                        <ArrowDownward sx={{ fontSize: '1rem', color: '#dc2626' }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: card.trendUp ? '#16a34a' : '#dc2626',
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        {card.trend}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#94a3b8',
                          ml: 0.5
                        }}
                      >
                        vs last month
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      backgroundColor: card.color + '10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 2
                    }}
                  >
                    {React.cloneElement(card.icon, {
                      sx: {
                        fontSize: 28,
                        color: card.color
                      }
                    })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Charts Section */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 4,
              height: 450,
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 0.5
                }}
              >
                Employee Distribution
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b'
                }}
              >
                Breakdown by campus location
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={0}
                >
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 4,
              height: 450,
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 0.5
                }}
              >
                Organization Types
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b'
                }}
              >
                Hierarchical structure overview
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={orgData} layout="horizontal" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#0070f2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;