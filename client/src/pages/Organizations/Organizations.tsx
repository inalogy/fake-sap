import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Search,
  Business,
  Person,
  LocationOn,
  Visibility,
  Add,
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
  costcenter: string;
  location: string;
  org_level: string;
  employee_count: number;
  children?: Organization[];
}

const OrganizationsSimple: React.FC = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const [listRes] = await Promise.all([
        axios.get('/api/organizations'),
      ]);
      setOrganizations(listRes.data);
      if (listRes.data.length > 0 && !selectedOrg) {
        setSelectedOrg(listRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleToggle = (objid: string) => {
    setExpanded(prev => ({ ...prev, [objid]: !prev[objid] }));
  };

  const handleSelect = (org: Organization) => {
    setSelectedOrg(org);
  };

  const getOrgLevelColor = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'Hochschule': '#0a6ed1',
      'Fakultät': '#f0ab00',
      'Institut': '#5a9fd4',
      'Lehrstuhl': '#00a58a',
      'Abteilung': '#ff6900',
      'Team': '#8b8b8b',
    };
    return levelMap[level] || '#6a6d70';
  };

  const filteredOrgs = organizations.filter(org =>
    !search ||
    org.stext.toLowerCase().includes(search.toLowerCase()) ||
    org.short.toLowerCase().includes(search.toLowerCase()) ||
    org.objid.toLowerCase().includes(search.toLowerCase())
  );

  const renderOrgList = (orgs: Organization[], parentId: string | null = null, level: number = 0) => {
    // When searching, show all matching orgs at root level
    const orgsToShow = search ?
      orgs.filter(org =>
        org.stext.toLowerCase().includes(search.toLowerCase()) ||
        org.short.toLowerCase().includes(search.toLowerCase()) ||
        org.objid.toLowerCase().includes(search.toLowerCase())
      ) :
      orgs.filter(org => org.parent_objid === parentId);

    return orgsToShow.map((org) => (
        <div key={org.objid}>
          <ListItem disablePadding sx={{ pl: level * 2 }}>
            <ListItemButton
              selected={selectedOrg?.objid === org.objid}
              onClick={() => handleSelect(org)}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 112, 242, 0.08)',
                  borderLeft: '3px solid #0070f2',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 112, 242, 0.12)',
                  },
                },
                '&:hover': {
                  backgroundColor: '#f8fafc',
                },
              }}
            >
              {!search && orgs.some(child => child.parent_objid === org.objid) && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(org.objid);
                  }}
                  sx={{
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    },
                  }}
                >
                  {expanded[org.objid] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              )}
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1, color: '#1e293b' }}>
                      {org.stext}
                    </Typography>
                    <Chip
                      label={org.employee_count || 0}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        backgroundColor: '#0070f2',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                }
                secondary={`${org.short} - ${org.org_level}`}
                secondaryTypographyProps={{
                  sx: { color: '#94a3b8', fontSize: '0.75rem' }
                }}
              />
            </ListItemButton>
          </ListItem>
          {!search && (
            <Collapse in={expanded[org.objid]} timeout="auto" unmountOnExit>
              {renderOrgList(orgs, org.objid, level + 1)}
            </Collapse>
          )}
        </div>
      ));
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                mb: 1,
                fontSize: '2rem'
              }}
            >
              Organization Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontSize: '1rem'
              }}
            >
              Navigate through your organizational structure and manage hierarchy
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/organizations/new')}
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
            Create New Organization
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{
            p: 3,
            height: 'calc(100vh - 240px)',
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#1e293b',
                mb: 3
              }}
            >
              Organization Tree
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  '& fieldset': {
                    border: '1px solid #e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0070f2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0070f2',
                    borderWidth: '2px',
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
              <List sx={{ py: 0 }}>
                {renderOrgList(organizations)}
              </List>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          {selectedOrg && (
            <Card sx={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {selectedOrg.stext}
                  </Typography>
                  <IconButton
                    onClick={() => navigate(`/organizations/${selectedOrg.objid}`)}
                    sx={{
                      color: '#0070f2',
                      backgroundColor: 'rgba(0, 112, 242, 0.08)',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 112, 242, 0.12)',
                      },
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Box>

                <Box display="flex" gap={1} mb={4}>
                  <Chip
                    label={selectedOrg.org_level}
                    sx={{
                      backgroundColor: getOrgLevelColor(selectedOrg.org_level),
                      color: 'white',
                      fontWeight: 500,
                      borderRadius: '6px',
                    }}
                  />
                  <Chip
                    label={`ID: ${selectedOrg.objid}`}
                    variant="outlined"
                    sx={{
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      borderRadius: '6px',
                    }}
                  />
                  <Chip
                    label={selectedOrg.short}
                    variant="outlined"
                    sx={{
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      borderRadius: '6px',
                    }}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 112, 242, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Business sx={{ color: '#0070f2', fontSize: '1.2rem' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                          Parent Organization
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                          {selectedOrg.parent_name || 'Top Level'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(22, 163, 74, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Person sx={{ color: '#16a34a', fontSize: '1.2rem' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                          Responsible Manager
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                          {selectedOrg.responsible_objid || 'Not assigned'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(14, 165, 233, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <LocationOn sx={{ color: '#0ea5e9', fontSize: '1.2rem' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                          Location
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                          {selectedOrg.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(234, 88, 12, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Business sx={{ color: '#ea580c', fontSize: '1.2rem' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                          Cost Center
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                          {selectedOrg.costcenter}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      p: 3,
                      mt: 2
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                        Organization Details
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                            Valid From
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                            {new Date(selectedOrg.begda).toLocaleDateString('de-DE')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                            Valid To
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                            {new Date(selectedOrg.endda).toLocaleDateString('de-DE')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                            Employee Count
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                            {selectedOrg.employee_count || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                            Organization Type
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                            {selectedOrg.otype}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrganizationsSimple;