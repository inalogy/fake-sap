import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Edit, Person, Business, Phone, Email, LocationOn } from '@mui/icons-material';
import axios from 'axios';

interface Employee {
  pernr: string;
  firstname: string;
  lastname: string;
  title: string;
  email: string;
  phone: string;
  orgeh: string;
  org_name: string;
  org_short: string;
  job: string;
  plans: string;
  location: string;
  begda: string;
  endda: string;
  contract_type: string;
  workschedule: string;
  birthdate: string;
  gender: string;
  natio: string;
  parent_pernr: string;
  costcenter: string;
  org_level: string;
  contracts?: any[];
}

const EmployeeDetail: React.FC = () => {
  const { pernr } = useParams<{ pernr: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [pernr]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/employees/${pernr}`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getContractTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'befristet':
        return 'warning';
      case 'unbefristet':
        return 'success';
      case 'werkstudent':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box>
        <Typography variant="h6">Employee not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/employees')}
            sx={{ color: '#0a6ed1' }}
          >
            Back to Employees
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Employee Details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/employees/${pernr}/edit`)}
          sx={{ backgroundColor: '#0a6ed1' }}
        >
          Edit Employee
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Personnel Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.pernr}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.title} {employee.firstname} {employee.lastname}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(employee.birthdate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Gender
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.gender === 'M' ? 'Male' : employee.gender === 'F' ? 'Female' : employee.gender === 'D' ? 'Diverse' : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Nationality
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.natio || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business /> Employment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Organization Unit
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.org_name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {employee.orgeh}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Job Title
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.job}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Position ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.plans || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Cost Center
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.costcenter || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Contract Type
                </Typography>
                <Chip
                  label={employee.contract_type || '-'}
                  color={getContractTypeColor(employee.contract_type) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Work Schedule
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {employee.workschedule || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Valid From
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(employee.begda)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Valid To
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(employee.endda)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {employee.contracts && employee.contracts.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contract History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {employee.contracts.map((contract, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`Contract ${contract.pernr}`}
                      secondary={`${formatDate(contract.begda)} - ${formatDate(contract.endda)} | ${contract.contract_type} | ${contract.workschedule}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <Email sx={{ mr: 2, color: '#6a6d70' }} />
                  <ListItemText
                    primary="Email"
                    secondary={employee.email || '-'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <Phone sx={{ mr: 2, color: '#6a6d70' }} />
                  <ListItemText
                    primary="Phone"
                    secondary={employee.phone || '-'}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <LocationOn sx={{ mr: 2, color: '#6a6d70' }} />
                  <ListItemText
                    primary="Location"
                    secondary={employee.location || '-'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetail;