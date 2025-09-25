import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AccountCircle,
  Logout,
  Settings,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', description: 'Overview & Analytics' },
    { text: 'Employees', icon: <PeopleIcon />, path: '/employees', description: 'Personnel Management' },
    { text: 'Organizations', icon: <BusinessIcon />, path: '/organizations', description: 'Organizational Structure' },
  ];

  const getPageTitle = () => {
    if (location.pathname.startsWith('/employees')) return 'Human Capital Management';
    if (location.pathname.startsWith('/organizations')) return 'Organizational Management';
    if (location.pathname === '/dashboard') return 'Dashboard Overview';
    return 'SAP HCM System';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0070f2' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}
        >
          SAP HANA
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            mt: 0.5
          }}
        >
          Human Capital Management
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2 }}>
        <List sx={{ padding: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={location.pathname.startsWith(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname.startsWith(item.path) ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    minWidth: '40px'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: location.pathname.startsWith(item.path) ? 600 : 500,
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'block',
            textAlign: 'center'
          }}
        >
          SAP HCM System v2.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ minHeight: '72px!important', px: 3 }}>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: 'none' },
              color: '#64748b'
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '1.5rem',
                lineHeight: 1.2
              }}
            >
              {getPageTitle()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mt: 0.5,
                fontSize: '0.875rem'
              }}
            >
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              sx={{
                color: '#64748b',
                '&:hover': { backgroundColor: '#f1f5f9' }
              }}
            >
              <Notifications />
            </IconButton>

            <IconButton
              sx={{
                color: '#64748b',
                '&:hover': { backgroundColor: '#f1f5f9' }
              }}
            >
              <Settings />
            </IconButton>

            <Box sx={{ ml: 1 }}>
              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0,
                  '&:hover': { backgroundColor: 'transparent' }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#0070f2',
                    width: 40,
                    height: 40,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0'
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled sx={{ py: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {user?.fullName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {user?.role} • {user?.username}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#dc2626' }}>
                  <Logout sx={{ mr: 2, fontSize: '1.2rem' }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#0070f2',
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ height: '72px' }} />
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;