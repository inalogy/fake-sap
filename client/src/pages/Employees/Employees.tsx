import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  Button,
} from '@mui/material';
import { Search, Visibility, Edit, Add } from '@mui/icons-material';
import axios from 'axios';

interface Employee {
  pernr: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  orgeh: string;
  org_name: string;
  job: string;
  location: string;
  begda: string;
  endda: string;
  contract_type: string;
}

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage, search]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/employees', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
        },
      });
      setEmployees(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
              Employee Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontSize: '1rem'
              }}
            >
              Manage and track all personnel information across your organization
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/employees/new')}
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
            Add New Employee
          </Button>
        </Box>

        {/* Search and Stats Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            p: 3,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}
        >
          <TextField
            placeholder="Search employees by name, ID, or email..."
            variant="outlined"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e as any)}
            sx={{
              minWidth: '400px',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                {total?.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                Total Employees
              </Typography>
            </Box>
            <Box sx={{ height: 40, width: 1, backgroundColor: '#e2e8f0' }} />
            <Button
              variant="outlined"
              onClick={handleSearch}
              sx={{
                borderColor: '#e2e8f0',
                color: '#0070f2',
                px: 3,
                py: 1,
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#0070f2',
                  backgroundColor: 'rgba(0, 112, 242, 0.04)',
                }
              }}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Box>


      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                PERNR
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Name
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Email
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Organization
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Job Title
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Location
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Contract Type
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Valid From
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Valid To
              </TableCell>
              <TableCell sx={{
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #e2e8f0',
                py: 2
              }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow
                key={employee.pernr}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                  },
                  '&:not(:last-child)': {
                    borderBottom: '1px solid #f1f5f9',
                  },
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {employee.pernr}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {employee.firstname} {employee.lastname}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {employee.email}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                    {employee.org_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {employee.orgeh}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {employee.job}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {employee.location}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={employee.contract_type || '-'}
                    size="small"
                    color={getContractTypeColor(employee.contract_type) as any}
                    sx={{
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {formatDate(employee.begda)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {formatDate(employee.endda)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/employees/${employee.pernr}`)}
                      title="View Details"
                      sx={{
                        color: '#0070f2',
                        backgroundColor: 'rgba(0, 112, 242, 0.08)',
                        borderRadius: '6px',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 112, 242, 0.12)',
                        },
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/employees/${employee.pernr}/edit`)}
                      title="Edit"
                      sx={{
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        '&:hover': {
                          backgroundColor: '#e2e8f0',
                          color: '#0070f2',
                        },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#fafbfc',
            '& .MuiTablePagination-toolbar': {
              px: 3,
              py: 2,
            },
            '& .MuiTablePagination-selectLabel': {
              color: '#64748b',
              fontWeight: 500,
            },
            '& .MuiTablePagination-displayedRows': {
              color: '#64748b',
              fontWeight: 500,
            },
            '& .MuiIconButton-root': {
              borderRadius: '6px',
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#e2e8f0',
              },
              '&.Mui-disabled': {
                color: '#cbd5e1',
              },
            },
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default Employees;