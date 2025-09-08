
import React, { useEffect } from 'react';
import {
 Box,
 Card,
 CardContent,
 Typography,
 Button,
 Grid,
 Avatar,
 Chip,
 Divider,
 Table,
 TableBody,
 TableCell,
 TableContainer,
 TableHead,
 TableRow,
 Paper,
} from '@mui/material';
import { Edit, Payment, AccountBalance } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store';
import {
 fetchEmployee,
 getEmployeeSalaryStructure,
 clearSelectedEmployee,
} from '../../store/slices/employeeSlice';
import Loading from '../../components/common/Loading';

const EmployeeDetail: React.FC = () => {
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const { id } = useParams<{ id: string }>();

 const { selectedEmployee, salaryStructures, loading } = useSelector(
   (state: RootState) => state.employee
 );

 useEffect(() => {
   if (id) {
     dispatch(fetchEmployee(id) as any);
     dispatch(getEmployeeSalaryStructure(id) as any);
   }

   return () => {
     dispatch(clearSelectedEmployee());
   };
 }, [dispatch, id]);

 const handleEdit = () => {
   navigate(`/employees/${id}/edit`);
 };

 const handleManageSalary = () => {
   navigate(`/employees/${id}/salary`);
 };

 if (loading || !selectedEmployee) {
   return <Loading message="Loading employee details..." />;
 }

 const currentSalaryStructure = salaryStructures.find(ss => ss.is_active);

 return (
   <Box>
     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
       <Typography variant="h4">Employee Details</Typography>
       <Box sx={{ display: 'flex', gap: 1 }}>
         <Button
           variant="outlined"
           startIcon={<Payment />}
           onClick={handleManageSalary}
         >
           Manage Salary
         </Button>
         <Button
           variant="contained"
           startIcon={<Edit />}
           onClick={handleEdit}
         >
           Edit Employee
         </Button>
       </Box>
     </Box>

     <Grid container spacing={3}>
       {/* Basic Information */}
       <Grid item xs={12} md={4}>
         <Card>
           <CardContent sx={{ textAlign: 'center' }}>
             <Avatar
               sx={{
                 width: 100,
                 height: 100,
                 mx: 'auto',
                 mb: 2,
                 bgcolor: 'primary.main',
                 fontSize: '2rem',
               }}
             >
               {selectedEmployee.first_name.charAt(0)}
             </Avatar>
             <Typography variant="h5" gutterBottom>
               {selectedEmployee.first_name} {selectedEmployee.last_name}
             </Typography>
             <Typography variant="body1" color="text.secondary" gutterBottom>
               {selectedEmployee.designation_title || 'No designation'}
             </Typography>
             <Typography variant="body2" color="text.secondary" gutterBottom>
               {selectedEmployee.department_name || 'No department'}
             </Typography>
             <Chip
               label={selectedEmployee.is_active ? 'Active' : 'Inactive'}
               color={selectedEmployee.is_active ? 'success' : 'default'}
               sx={{ mt: 1 }}
             />
           </CardContent>
         </Card>
       </Grid>

       {/* Personal Details */}
       <Grid item xs={12} md={8}>
         <Card>
           <CardContent>
             <Typography variant="h6" gutterBottom>
               Personal Information
             </Typography>
             <Divider sx={{ mb: 2 }} />
             
             <Grid container spacing={2}>
               <Grid item xs={12} sm={6}>
                 <Typography variant="body2" color="text.secondary">
                   Employee ID
                 </Typography>
                 <Typography variant="body1" gutterBottom>
                   {selectedEmployee.employee_code}
                 </Typography>
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <Typography variant="body2" color="text.secondary">
                   Email
                 </Typography>
                 <Typography variant="body1" gutterBottom>
                   {selectedEmployee.email}
                 </Typography>
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <Typography variant="body2" color="text.secondary">
                   Phone
                 </Typography>
                 <Typography variant="body1" gutterBottom>
                   {selectedEmployee.phone || 'Not provided'}
                 </Typography>
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <Typography variant="body2" color="text.secondary">
                   Date of Birth
                 </Typography>
                 <Typography variant="body1" gutterBottom>
                   {selectedEmployee.date_of_birth 
                     ? new Date(selectedEmployee.date_of_birth).toLocaleDateString()
                     : 'Not provided'
                   }
                 </Typography>
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <Typography variant="body2" color="text.secondary">
                   Joining Date
                 </Typography>
                 <Typography variant="body1" gutterBottom>
                   {new Date(selectedEmployee.joining_date).toLocaleDateString()}
                 </Typography>
               </Grid>
               
               <Grid item xs={12} sm={6}>
                 <Typography variant="body2" color="text.secondary">
                   Employment Type
                 </Typography>
                 <Typography variant="body1" gutterBottom>
                   {selectedEmployee.employment_type.replace('_', ' ').toUpperCase()}
                 </Typography>
               </Grid>
             </Grid>
           </CardContent>
         </Card>
       </Grid>

       {/* Salary Information */}
       {currentSalaryStructure && (
         <Grid item xs={12}>
           <Card>
             <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                 <AccountBalance sx={{ mr: 1 }} />
                 <Typography variant="h6">
                   Current Salary Structure
                 </Typography>
               </Box>
               <Divider sx={{ mb: 2 }} />
               
               <TableContainer component={Paper} variant="outlined">
                 <Table>
                   <TableHead>
                     <TableRow>
                       <TableCell>Component</TableCell>
                       <TableCell align="right">Amount (₹)</TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     <TableRow>
                       <TableCell>Basic Salary</TableCell>
                       <TableCell align="right">
                         {currentSalaryStructure.basic_salary.toLocaleString()}
                       </TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell>HRA</TableCell>
                       <TableCell align="right">
                         {currentSalaryStructure.hra.toLocaleString()}
                       </TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell>Conveyance Allowance</TableCell>
                       <TableCell align="right">
                         {currentSalaryStructure.conveyance_allowance.toLocaleString()}
                       </TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell>Medical Allowance</TableCell>
                       <TableCell align="right">
                         {currentSalaryStructure.medical_allowance.toLocaleString()}
                       </TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell>Special Allowance</TableCell>
                       <TableCell align="right">
                         {currentSalaryStructure.special_allowance.toLocaleString()}
                       </TableCell>
                     </TableRow>
                     <TableRow sx={{ bgcolor: 'action.hover' }}>
                       <TableCell sx={{ fontWeight: 'bold' }}>
                         Total Monthly Salary
                       </TableCell>
                       <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                         ₹{(
                           currentSalaryStructure.basic_salary +
                           currentSalaryStructure.hra +
                           currentSalaryStructure.conveyance_allowance +
                           currentSalaryStructure.medical_allowance +
                           currentSalaryStructure.special_allowance
                         ).toLocaleString()}
                       </TableCell>
                     </TableRow>
                   </TableBody>
                 </Table>
               </TableContainer>
               
               <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                 Effective from: {new Date(currentSalaryStructure.effective_from).toLocaleDateString()}
               </Typography>
             </CardContent>
           </Card>
         </Grid>
       )}
     </Grid>
   </Box>
 );
};

export default EmployeeDetail;
