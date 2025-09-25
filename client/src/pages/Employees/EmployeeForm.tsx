import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { ArrowBack, Save, Cancel, AutoFixHigh } from '@mui/icons-material';
import axios from 'axios';
import { generateRealisticEmployee } from '../../utils/employeeGenerator';

interface Organization {
  objid: string;
  stext: string;
  short: string;
}

interface Employee {
  pernr: string;
  firstname: string;
  lastname: string;
  title: string;
  email: string;
  phone: string;
  orgeh: string;
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
  persg: string;
  persk: string;
}

const EmployeeForm: React.FC = () => {
  const { pernr } = useParams<{ pernr: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(pernr && pernr !== 'new');
  const isInlineEdit = searchParams.get('edit') === 'true';

  const [employee, setEmployee] = useState<Partial<Employee>>({
    pernr: isEditMode ? '' : undefined,
    firstname: '',
    lastname: '',
    title: '',
    email: '',
    phone: '',
    orgeh: '',
    job: '',
    plans: '',
    location: 'Campus West',
    begda: new Date().toISOString().split('T')[0].split('-').reverse().join('.'),
    endda: '31.12.2099',
    contract_type: 'unbefristet',
    workschedule: 'Vollzeit',
    birthdate: '',
    gender: 'M',
    natio: 'DE',
    persg: 'Angestellte',
    persk: 'Vollzeit',
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOrganizations();
    if (isEditMode) {
      fetchEmployee();
    }
  }, [isEditMode, pernr]);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('/api/organizations');
      setOrganizations(response.data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/employees/${pernr}`);
      const emp = response.data;
      setEmployee({
        pernr: emp.pernr,
        firstname: emp.firstname,
        lastname: emp.lastname,
        title: emp.title || '',
        email: emp.email || '',
        phone: emp.phone || '',
        orgeh: emp.orgeh,
        job: emp.job,
        plans: emp.plans || '',
        location: emp.location || 'Campus West',
        begda: emp.begda,
        endda: emp.endda,
        contract_type: emp.contract_type || 'unbefristet',
        workschedule: emp.workschedule || 'Vollzeit',
        birthdate: emp.birthdate || '',
        gender: emp.gender || 'M',
        natio: emp.natio || 'DE',
        persg: emp.persg || 'Angestellte',
        persk: emp.persk || 'Vollzeit',
      });
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEmployee(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (isEditMode && !employee.pernr?.trim()) {
      setError('Personnel Number is required');
      return false;
    }
    if (!employee.firstname?.trim()) {
      setError('First Name is required');
      return false;
    }
    if (!employee.lastname?.trim()) {
      setError('Last Name is required');
      return false;
    }
    if (!employee.orgeh?.trim()) {
      setError('Organization Unit is required');
      return false;
    }
    if (!employee.job?.trim()) {
      setError('Job Title is required');
      return false;
    }
    if (!employee.begda?.trim()) {
      setError('Valid From date is required');
      return false;
    }
    if (!employee.endda?.trim()) {
      setError('Valid To date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditMode) {
        await axios.put(`/api/employees/${pernr}`, employee);
        setSuccess('Employee updated successfully');
        setTimeout(() => navigate(`/employees/${pernr}`), 1500);
      } else {
        // Remove pernr from payload for new employees as it will be auto-generated
        const { pernr: _, ...employeeData } = employee;
        const response = await axios.post('/api/employees', employeeData);
        setSuccess('Employee created successfully');
        setTimeout(() => navigate('/employees'), 1500);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save employee';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/employees/${pernr}`);
    } else {
      navigate('/employees');
    }
  };

  const handleGenerateRandomData = () => {
    if (isEditMode) return; // Only allow generation for new employees

    try {
      const generatedData = generateRealisticEmployee(organizations);
      setEmployee(prev => ({
        ...prev,
        ...generatedData
      }));
      setSuccess('Realistic employee data generated! You can modify any fields before saving.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error generating employee data:', error);
      setError('Failed to generate employee data');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const pageTitle = isEditMode ? 'Edit Employee' : 'Create New Employee';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleCancel}
            sx={{ color: '#0a6ed1' }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {pageTitle}
          </Typography>
        </Box>
        {!isEditMode && (
          <Button
            variant="outlined"
            startIcon={<AutoFixHigh />}
            onClick={handleGenerateRandomData}
            sx={{
              color: '#0a6ed1',
              borderColor: '#0a6ed1',
              '&:hover': {
                borderColor: '#0854a0',
                backgroundColor: 'rgba(10, 110, 209, 0.04)'
              }
            }}
          >
            Generate Random Data
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {isEditMode && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Personnel Number (PERNR)"
                  value={employee.pernr || ''}
                  onChange={(e) => handleInputChange('pernr', e.target.value)}
                  required
                  disabled={isEditMode}
                  placeholder="e.g., 10016"
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Title</InputLabel>
                <Select
                  value={employee.title || ''}
                  label="Title"
                  onChange={(e) => handleInputChange('title', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Dr.">Dr.</MenuItem>
                  <MenuItem value="Prof. Dr.">Prof. Dr.</MenuItem>
                  <MenuItem value="PD Dr.">PD Dr.</MenuItem>
                  <MenuItem value="Dipl.-Ing.">Dipl.-Ing.</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={employee.firstname || ''}
                onChange={(e) => handleInputChange('firstname', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={employee.lastname || ''}
                onChange={(e) => handleInputChange('lastname', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                value={employee.birthdate || ''}
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                placeholder="dd.mm.yyyy"
                helperText="Format: dd.mm.yyyy"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={employee.gender || 'M'}
                  label="Gender"
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="D">Diverse</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationality"
                value={employee.natio || ''}
                onChange={(e) => handleInputChange('natio', e.target.value)}
                placeholder="DE"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Contact Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={employee.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="name@hochschule.de"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={employee.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+49 30 12345678"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={employee.location || 'Campus West'}
                  label="Location"
                  onChange={(e) => handleInputChange('location', e.target.value)}
                >
                  <MenuItem value="Campus West">Campus West</MenuItem>
                  <MenuItem value="Campus Ost">Campus Ost</MenuItem>
                  <MenuItem value="Campus Nord">Campus Nord</MenuItem>
                  <MenuItem value="Campus Süd">Campus Süd</MenuItem>
                  <MenuItem value="Campus Mitte">Campus Mitte</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Employment Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Organization Unit</InputLabel>
                <Select
                  value={employee.orgeh || ''}
                  label="Organization Unit"
                  onChange={(e) => handleInputChange('orgeh', e.target.value)}
                >
                  {organizations.map((org) => (
                    <MenuItem key={org.objid} value={org.objid}>
                      {org.stext} ({org.short})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={employee.job || ''}
                onChange={(e) => handleInputChange('job', e.target.value)}
                required
                placeholder="e.g., Software Engineer"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position ID (Plans)"
                value={employee.plans || ''}
                onChange={(e) => handleInputChange('plans', e.target.value)}
                placeholder="e.g., PL1001"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Employee Group</InputLabel>
                <Select
                  value={employee.persg || 'Angestellte'}
                  label="Employee Group"
                  onChange={(e) => handleInputChange('persg', e.target.value)}
                >
                  <MenuItem value="Angestellte">Angestellte</MenuItem>
                  <MenuItem value="Führungskräfte">Führungskräfte</MenuItem>
                  <MenuItem value="Professoren">Professoren</MenuItem>
                  <MenuItem value="Hilfskräfte">Hilfskräfte</MenuItem>
                  <MenuItem value="Beamte">Beamte</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Work Schedule</InputLabel>
                <Select
                  value={employee.workschedule || 'Vollzeit'}
                  label="Work Schedule"
                  onChange={(e) => handleInputChange('workschedule', e.target.value)}
                >
                  <MenuItem value="Vollzeit">Vollzeit</MenuItem>
                  <MenuItem value="Teilzeit">Teilzeit</MenuItem>
                  <MenuItem value="Wissenschaftlich">Wissenschaftlich</MenuItem>
                  <MenuItem value="Nicht-Wissenschaftlich">Nicht-Wissenschaftlich</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Contract Type</InputLabel>
                <Select
                  value={employee.contract_type || 'unbefristet'}
                  label="Contract Type"
                  onChange={(e) => handleInputChange('contract_type', e.target.value)}
                >
                  <MenuItem value="unbefristet">Unbefristet</MenuItem>
                  <MenuItem value="befristet">Befristet</MenuItem>
                  <MenuItem value="Werkstudent">Werkstudent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valid From"
                value={employee.begda || ''}
                onChange={(e) => handleInputChange('begda', e.target.value)}
                required
                placeholder="dd.mm.yyyy"
                helperText="Format: dd.mm.yyyy"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valid To"
                value={employee.endda || ''}
                onChange={(e) => handleInputChange('endda', e.target.value)}
                required
                placeholder="dd.mm.yyyy"
                helperText="Format: dd.mm.yyyy"
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={4} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<Cancel />}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              startIcon={<Save />}
              disabled={saving}
              sx={{ backgroundColor: '#0a6ed1' }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? 'Update' : 'Create')} Employee
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EmployeeForm;