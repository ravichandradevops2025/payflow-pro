
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  People,
  Payment,
  Schedule,
  BeachAccess,
  Assessment,
  Settings,
  Business,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import { setSidebarOpen } from '../../store/slices/uiSlice';

interface SidebarProps {
  drawerWidth: number;
}

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  const handleDrawerClose = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['super_admin', 'hr_admin', 'payroll_admin', 'manager', 'employee'],
    },
    {
      text: 'Employees',
      icon: <People />,
      path: '/employees',
      roles: ['super_admin', 'hr_admin', 'manager'],
    },
    {
      text: 'Departments',
      icon: <Business />,
      path: '/departments',
      roles: ['super_admin', 'hr_admin'],
    },
    {
      text: 'Payroll',
      icon: <Payment />,
      path: '/payroll',
      roles: ['super_admin', 'hr_admin', 'payroll_admin'],
    },
    {
      text: 'Attendance',
      icon: <Schedule />,
      path: '/attendance',
      roles: ['super_admin', 'hr_admin', 'payroll_admin', 'manager', 'employee'],
    },
    {
      text: 'Leave Management',
      icon: <BeachAccess />,
      path: '/leave',
      roles: ['super_admin', 'hr_admin', 'manager', 'employee'],
    },
    {
      text: 'Reports',
      icon: <Assessment />,
      path: '/reports',
      roles: ['super_admin', 'hr_admin', 'payroll_admin', 'manager'],
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
      roles: ['super_admin', 'hr_admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" noWrap component="div">
            PayFlow Pro
          </Typography>
          <Chip 
            label="v1.0" 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
      </Toolbar>
      
      <List>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  handleDrawerClose();
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive ? theme.palette.primary.main : 'inherit',
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={sidebarOpen}
      onClose={handleDrawerClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
