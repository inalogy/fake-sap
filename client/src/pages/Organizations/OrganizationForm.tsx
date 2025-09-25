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
  IconButton,
} from '@mui/material';
import { ArrowBack, Save, Cancel, Add, Delete } from '@mui/icons-material';
import axios from 'axios';

interface Organization {
  objid: string;
  stext: string;
  short: string;
  otype: string;
  parent_objid?: string;
  begda: string;
  endda: string;
  responsible_objid?: string;
  costcenter?: string;
  location?: string;
  org_level: string;
}

interface ParentOrganization {
  objid: string;
  stext: string;
  short: string;
}

const OrganizationForm: React.FC = () => {
  const { objid } = useParams<{ objid: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(objid && objid !== 'new');
  const isInlineEdit = searchParams.get('edit') === 'true';

  const [organization, setOrganization] = useState<Partial<Organization>>({
    objid: isEditMode ? '' : undefined,
    stext: '',
    short: '',
    otype: 'O',
    parent_objid: '',
    begda: new Date().toISOString().split('T')[0].split('-').reverse().join('.'),
    endda: '31.12.2099',
    responsible_objid: '',
    costcenter: '',
    location: 'Campus West',
    org_level: 'Abteilung',
  });

  const [parentOrganizations, setParentOrganizations] = useState<ParentOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchParentOrganizations();
    if (isEditMode) {
      fetchOrganization();
    }
  }, [isEditMode, objid]);

  const fetchParentOrganizations = async () => {
    try {
      const response = await axios.get('/api/organizations');
      setParentOrganizations(response.data);
    } catch (err) {
      console.error('Error fetching parent organizations:', err);
    }
  };

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/organizations/${objid}`);
      const org = response.data;
      setOrganization({
        objid: org.objid,
        stext: org.stext,
        short: org.short,
        otype: org.otype,
        parent_objid: org.parent_objid || '',
        begda: org.begda,
        endda: org.endda,
        responsible_objid: org.responsible_objid || '',
        costcenter: org.costcenter || '',
        location: org.location || 'Campus West',
        org_level: org.org_level,
      });
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setOrganization(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!organization.objid?.trim()) {
      setError('Object ID is required');
      return false;
    }
    if (!organization.stext?.trim()) {
      setError('Organization Name is required');
      return false;
    }
    if (!organization.short?.trim()) {
      setError('Short Name is required');
      return false;
    }
    if (!organization.org_level?.trim()) {
      setError('Organization Level is required');
      return false;
    }
    if (!organization.begda?.trim()) {
      setError('Valid From date is required');
      return false;
    }
    if (!organization.endda?.trim()) {
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
        await axios.put(`/api/organizations/${objid}`, organization);
        setSuccess('Organization updated successfully');
        setTimeout(() => navigate(`/organizations/${objid}`), 1500);
      } else {
        const response = await axios.post('/api/organizations', organization);
        setSuccess('Organization created successfully');
        setTimeout(() => navigate('/organizations'), 1500);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save organization';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the organization "${organization.stext}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      await axios.delete(`/api/organizations/${objid}`);
      setSuccess('Organization deleted successfully');
      setTimeout(() => navigate('/organizations'), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete organization';
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/organizations/${objid}`);
    } else {
      navigate('/organizations');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const pageTitle = isEditMode ? 'Edit Organization' : 'Create New Organization';

  // Filter out current organization from parent options to prevent self-reference
  const availableParents = parentOrganizations.filter(org => org.objid !== objid);

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
        {isEditMode && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={saving || deleting}
            sx={{
              borderColor: '#d32f2f',
              color: '#d32f2f',
              '&:hover': {
                borderColor: '#b71c1c',
                backgroundColor: 'rgba(211, 47, 47, 0.04)'
              }
            }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Organization'}
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
            Basic Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Object ID (OBJID)"
                value={organization.objid || ''}
                onChange={(e) => handleInputChange('objid', e.target.value)}
                required
                disabled={isEditMode}
                placeholder="e.g., 1002"
                helperText={isEditMode ? 'Object ID cannot be changed' : 'Unique identifier for the organization'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Organization Type</InputLabel>
                <Select
                  value={organization.otype || 'O'}
                  label="Organization Type"
                  onChange={(e) => handleInputChange('otype', e.target.value)}
                >
                  <MenuItem value="O">Organization (O)</MenuItem>
                  <MenuItem value="S">Position (S)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization Name"
                value={organization.stext || ''}
                onChange={(e) => handleInputChange('stext', e.target.value)}
                required
                placeholder="e.g., Computer Science Department"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Short Name"
                value={organization.short || ''}
                onChange={(e) => handleInputChange('short', e.target.value)}
                required
                placeholder="e.g., CS-DEPT"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Parent Organization</InputLabel>
                <Select
                  value={organization.parent_objid || ''}
                  label="Parent Organization"
                  onChange={(e) => handleInputChange('parent_objid', e.target.value)}
                >
                  <MenuItem value="">None (Top Level)</MenuItem>
                  {availableParents.map((parent) => (
                    <MenuItem key={parent.objid} value={parent.objid}>
                      {parent.stext} ({parent.short})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Organization Level</InputLabel>
                <Select
                  value={organization.org_level || 'Abteilung'}
                  label="Organization Level"
                  onChange={(e) => handleInputChange('org_level', e.target.value)}
                >
                  <MenuItem value="Hochschule">Hochschule</MenuItem>
                  <MenuItem value="Fakultät">Fakultät</MenuItem>
                  <MenuItem value="Institut">Institut</MenuItem>
                  <MenuItem value="Lehrstuhl">Lehrstuhl</MenuItem>
                  <MenuItem value="Abteilung">Abteilung</MenuItem>
                  <MenuItem value="Team">Team</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Additional Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Responsible Manager (PERNR)"
                value={organization.responsible_objid || ''}
                onChange={(e) => handleInputChange('responsible_objid', e.target.value)}
                placeholder="e.g., 10001"
                helperText="Personnel number of the responsible manager"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Center"
                value={organization.costcenter || ''}
                onChange={(e) => handleInputChange('costcenter', e.target.value)}
                placeholder="e.g., CC1001"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={organization.location || 'Campus West'}
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

            <Grid item xs={12} sm={6} /> {/* Empty grid for spacing */}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valid From"
                value={organization.begda || ''}
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
                value={organization.endda || ''}
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
              disabled={saving || deleting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              startIcon={<Save />}
              disabled={saving || deleting}
              sx={{ backgroundColor: '#0a6ed1' }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? 'Update' : 'Create')} Organization
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default OrganizationForm;