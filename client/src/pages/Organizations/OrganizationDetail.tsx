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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Business,
  Person,
  LocationOn,
  AttachMoney,
  Group,
} from '@mui/icons-material';
import axios from 'axios';

interface Organization {
  objid: string;
  otype: string;
  short: string;
  stext: string;
  parent_objid: string | null;
  parent_name: string | null;
  begda: string;
  endda: string;
  responsible_objid: string;
  manager_name: string;
  manager_email: string;
  costcenter: string;
  location: string;
  org_level: string;
  direct_employees: number;
  child_orgs: number;
  children: any[];
  employees: any[];
}

const OrganizationDetail: React.FC = () => {
  const { objid } = useParams<{ objid: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganization();
  }, [objid]);

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/organizations/${objid}`);
      setOrganization(response.data);
    } catch (error) {
      console.error('Error fetching organization:', error);
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

  const getOrgLevelColor = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'Hochschule': '#0070f2',
      'Fakultät': '#f0ab00',
      'Institut': '#5a9fd4',
      'Lehrstuhl': '#16a34a',
      'Abteilung': '#ea580c',
      'Team': '#64748b',
    };
    return levelMap[level] || '#64748b';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Box>
        <Typography variant="h6">Organization not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/organizations')}
            sx={{
              color: '#0070f2',
              backgroundColor: 'rgba(0, 112, 242, 0.08)',
              px: 2,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(0, 112, 242, 0.12)',
              },
            }}
          >
            Back to Organizations
          </Button>
          <Typography variant="h3" sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: '2rem'
          }}>
            Organization Details
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Edit />}
          onClick={() => navigate(`/organizations/${objid}/edit`)}
          sx={{
            backgroundColor: '#0070f2',
            px: 3,
            py: 1.5,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            '&:hover': {
              backgroundColor: '#004c9a',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-1px)',
            }
          }}
        >
          Edit Organization
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{
            p: 4,
            mb: 3,
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {organization.stext}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip
                  label={organization.org_level}
                  sx={{
                    backgroundColor: getOrgLevelColor(organization.org_level),
                    color: 'white',
                    fontWeight: 500,
                    borderRadius: '6px',
                  }}
                />
                <Chip
                  label={`ID: ${organization.objid}`}
                  variant="outlined"
                  sx={{
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    borderRadius: '6px',
                  }}
                />
                <Chip
                  label={organization.short}
                  variant="outlined"
                  sx={{
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Box>
            <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Business sx={{ color: '#6a6d70' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Parent Organization
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {organization.parent_name || 'Top Level Organization'}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Person sx={{ color: '#6a6d70' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Responsible Manager
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {organization.manager_name || 'Not Assigned'}
                    </Typography>
                    {organization.manager_email && (
                      <Typography variant="caption" color="textSecondary">
                        {organization.manager_email}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <LocationOn sx={{ color: '#6a6d70' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {organization.location}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <AttachMoney sx={{ color: '#6a6d70' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Cost Center
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {organization.costcenter}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Group sx={{ color: '#6a6d70' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Direct Employees
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {organization.direct_employees}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Business sx={{ color: '#6a6d70' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Child Organizations
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {organization.child_orgs}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={4}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Valid From
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(organization.begda)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Valid To
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(organization.endda)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Organization Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {organization.otype}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {organization.children && organization.children.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Child Organizations
                </Typography>
                <List>
                  {organization.children.map((child: any) => (
                    <ListItem
                      key={child.objid}
                      sx={{
                        px: 0,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      }}
                      onClick={() => navigate(`/organizations/${child.objid}`)}
                    >
                      <ListItemText
                        primary={child.stext}
                        secondary={`${child.short} - ${child.org_level}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {organization.employees && organization.employees.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employees ({organization.direct_employees})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>PERNR</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Job Title</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {organization.employees.map((employee: any) => (
                        <TableRow
                          key={employee.pernr}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                          }}
                          onClick={() => navigate(`/employees/${employee.pernr}`)}
                        >
                          <TableCell>{employee.pernr}</TableCell>
                          <TableCell>
                            {employee.firstname} {employee.lastname}
                          </TableCell>
                          <TableCell>{employee.job}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {organization.direct_employees > 10 && (
                  <Button
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/employees?orgeh=${organization.objid}`)}
                  >
                    View All Employees
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OrganizationDetail;