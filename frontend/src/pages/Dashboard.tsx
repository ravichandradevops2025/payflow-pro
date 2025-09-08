
import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Payment,
  TrendingUp,
  Schedule,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchEmployees } from '../store/slices/employeeSlice';
import { fetchPayrollRuns } from '../store/slices/payrollSlice';
import Loading from '../components/common/Loading';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user, employee } = useSelector((state: RootState) => state.auth);
  const { employees, loading: employeeLoading } = useSelector((state: RootState) => state.employee);
  const { payrollRuns, loading: payrollLoading } = useSelector((state: RootState) => state.payroll);

  useEffect(() => {
    if (user && ['super_admin', 'hr_admin', 'payroll_admin'].includes(user.role)) {
      dispatch(fetchEmployees({ limit: 5 }) as any);
      dispatch(fetchPayrollRuns({ limit: 5 }) as any);
    }
  }, [dispatch, user]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (employeeLoading || payrollLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  // Admin/HR Dashboard
  if (user && ['super_admin', 'hr_admin', 'payroll_admin'].includes(user.role)) {
    const activeEmployees = employees.filter(emp => emp.is_active).length;
    const totalEmployees = employees.length;
    const currentMonthPayroll = payrollRuns.find(run => 
      new Date(run.payroll_period_start).getMonth() === new Date().getMonth()
    );

    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome back, {user.email}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Employees"
              value={totalEmployees}
              icon={<People />}
              color="primary.main"
              subtitle={`${activeEmployees} active`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="This Month Payroll"
              value={currentMonthPayroll ? `₹${currentMonthPayroll.total_net_salary?.toLocaleString()}` : 'Not Processed'}
              icon={<Payment />}
              color="success.main"
              subtitle={currentMonthPayroll ? `${currentMonthPayroll.total_employees} employees` : 'Pending processing'}
           />
         </Grid>

         <Grid item xs={12} sm={6} md={3}>
           <StatCard
             title="Attendance Rate"
             value="94.5%"
             icon={<Schedule />}
             color="info.main"
             subtitle="This month"
           />
         </Grid>

         <Grid item xs={12} sm={6} md={3}>
           <StatCard
             title="Pending Approvals"
             value="12"
             icon={<Warning />}
             color="warning.main"
             subtitle="Leave requests"
           />
         </Grid>

         {/* Recent Activities */}
         <Grid item xs={12} md={6}>
           <Card>
             <CardContent>
               <Typography variant="h6" gutterBottom>
                 Recent Employees
               </Typography>
               {employees.slice(0, 5).map((emp) => (
                 <Box
                   key={emp.id}
                   sx={{
                     display: 'flex',
                     alignItems: 'center',
                     py: 1,
                     borderBottom: '1px solid',
                     borderColor: 'divider',
                     '&:last-child': { borderBottom: 'none' },
                   }}
                 >
                   <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                     {emp.first_name.charAt(0)}
                   </Avatar>
                   <Box sx={{ flexGrow: 1 }}>
                     <Typography variant="body2">
                       {emp.first_name} {emp.last_name}
                     </Typography>
                     <Typography variant="caption" color="text.secondary">
                       {emp.designation_title} • {emp.department_name}
                     </Typography>
                   </Box>
                   <Chip
                     label={emp.is_active ? 'Active' : 'Inactive'}
                     color={emp.is_active ? 'success' : 'default'}
                     size="small"
                   />
                 </Box>
               ))}
             </CardContent>
           </Card>
         </Grid>

         {/* Payroll Status */}
         <Grid item xs={12} md={6}>
           <Card>
             <CardContent>
               <Typography variant="h6" gutterBottom>
                 Recent Payroll Runs
               </Typography>
               {payrollRuns.slice(0, 5).map((run) => (
                 <Box
                   key={run.id}
                   sx={{
                     display: 'flex',
                     alignItems: 'center',
                     py: 1,
                     borderBottom: '1px solid',
                     borderColor: 'divider',
                     '&:last-child': { borderBottom: 'none' },
                   }}
                 >
                   <Box sx={{ flexGrow: 1 }}>
                     <Typography variant="body2">
                       {new Date(run.payroll_period_start).toLocaleDateString()} - {new Date(run.payroll_period_end).toLocaleDateString()}
                     </Typography>
                     <Typography variant="caption" color="text.secondary">
                       {run.total_employees} employees • ₹{run.total_net_salary?.toLocaleString()}
                     </Typography>
                   </Box>
                   <Chip
                     label={run.status}
                     color={
                       run.status === 'approved' ? 'success' :
                       run.status === 'completed' ? 'info' :
                       run.status === 'processing' ? 'warning' : 'default'
                     }
                     size="small"
                   />
                 </Box>
               ))}
             </CardContent>
           </Card>
         </Grid>

         {/* Quick Actions */}
         <Grid item xs={12}>
           <Card>
             <CardContent>
               <Typography variant="h6" gutterBottom>
                 Quick Actions
               </Typography>
               <Grid container spacing={2}>
                 <Grid item xs={12} sm={6} md={3}>
                   <Paper
                     sx={{
                       p: 2,
                       textAlign: 'center',
                       cursor: 'pointer',
                       '&:hover': { bgcolor: 'action.hover' },
                     }}
                   >
                     <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                     <Typography variant="body2">Add Employee</Typography>
                   </Paper>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Paper
                     sx={{
                       p: 2,
                       textAlign: 'center',
                       cursor: 'pointer',
                       '&:hover': { bgcolor: 'action.hover' },
                     }}
                   >
                     <Payment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                     <Typography variant="body2">Process Payroll</Typography>
                   </Paper>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Paper
                     sx={{
                       p: 2,
                       textAlign: 'center',
                       cursor: 'pointer',
                       '&:hover': { bgcolor: 'action.hover' },
                     }}
                   >
                     <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                     <Typography variant="body2">View Attendance</Typography>
                   </Paper>
                 </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                   <Paper
                     sx={{
                       p: 2,
                       textAlign: 'center',
                       cursor: 'pointer',
                       '&:hover': { bgcolor: 'action.hover' },
                     }}
                   >
                     <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                     <Typography variant="body2">Generate Reports</Typography>
                   </Paper>
                 </Grid>
               </Grid>
             </CardContent>
           </Card>
         </Grid>
       </Grid>
     </Box>
   );
 }

 // Employee Dashboard
 return (
   <Box>
     <Typography variant="h4" gutterBottom>
       Welcome, {employee?.first_name}!
     </Typography>
     <Typography variant="body1" color="text.secondary" gutterBottom>
       Employee Dashboard
     </Typography>

     <Grid container spacing={3} sx={{ mt: 2 }}>
       {/* Employee Info Card */}
       <Grid item xs={12} md={6}>
         <Card>
           <CardContent>
             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
               <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                 {employee?.first_name.charAt(0)}
               </Avatar>
               <Box>
                 <Typography variant="h6">
                   {employee?.first_name} {employee?.last_name}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   {employee?.designation_title}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   {employee?.department_name}
                 </Typography>
               </Box>
             </Box>
             <Chip
               label={`ID: ${employee?.employee_code}`}
               variant="outlined"
               size="small"
             />
           </CardContent>
         </Card>
       </Grid>

       {/* Quick Stats */}
       <Grid item xs={12} md={6}>
         <Card>
           <CardContent>
             <Typography variant="h6" gutterBottom>
               This Month
             </Typography>
             <Box sx={{ mb: 2 }}>
               <Typography variant="body2" color="text.secondary">
                 Attendance
               </Typography>
               <Typography variant="h6">22/23 days</Typography>
               <LinearProgress
                 variant="determinate"
                 value={(22/23) * 100}
                 sx={{ mt: 1 }}
               />
             </Box>
             <Box>
               <Typography variant="body2" color="text.secondary">
                 Leave Balance
               </Typography>
               <Typography variant="body2">
                 Annual: 12 days • Sick: 8 days • Casual: 5 days
               </Typography>
             </Box>
           </CardContent>
         </Card>
       </Grid>

       {/* Quick Actions for Employee */}
       <Grid item xs={12}>
         <Card>
           <CardContent>
             <Typography variant="h6" gutterBottom>
               Quick Actions
             </Typography>
             <Grid container spacing={2}>
               <Grid item xs={12} sm={6} md={3}>
                 <Paper
                   sx={{
                     p: 2,
                     textAlign: 'center',
                     cursor: 'pointer',
                     '&:hover': { bgcolor: 'action.hover' },
                   }}
                 >
                   <Payment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                   <Typography variant="body2">View Payslips</Typography>
                 </Paper>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Paper
                   sx={{
                     p: 2,
                     textAlign: 'center',
                     cursor: 'pointer',
                     '&:hover': { bgcolor: 'action.hover' },
                   }}
                 >
                   <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                   <Typography variant="body2">Apply Leave</Typography>
                 </Paper>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Paper
                   sx={{
                     p: 2,
                     textAlign: 'center',
                     cursor: 'pointer',
                     '&:hover': { bgcolor: 'action.hover' },
                   }}
                 >
                   <CheckCircle sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                   <Typography variant="body2">View Attendance</Typography>
                 </Paper>
               </Grid>
               <Grid item xs={12} sm={6} md={3}>
                 <Paper
                   sx={{
                     p: 2,
                     textAlign: 'center',
                     cursor: 'pointer',
                     '&:hover': { bgcolor: 'action.hover' },
                   }}
                 >
                   <People sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                   <Typography variant="body2">Update Profile</Typography>
                 </Paper>
               </Grid>
             </Grid>
           </CardContent>
         </Card>
       </Grid>
     </Grid>
   </Box>
 );
};

export default Dashboard;
