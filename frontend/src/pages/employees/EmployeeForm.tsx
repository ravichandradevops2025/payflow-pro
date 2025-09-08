
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store';
import {
  createEmployee,
  updateEmployee,
  fetchEmployee,
  fetchDepartments,
  fetchDesignations,
  clearSelectedEmployee,
} from '../../store/slices/employeeSlice';
import { addNotification } from '../../store/slices/uiSlice';
import Loading from '../../components/common/Loading';

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  joining_date: string;
  department_id?: string;
  designation_id?: string;
  employment_type: string;
  pan_number?: string;
  aadhaar_number?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
}

const EmployeeForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';

  const {
    selectedEmployee,
    departments,
    designations,
    loading,
    error,
  } = useSelector((state: RootState) => state.employee);

  const [selectedDepartment, setSelectedDepartment] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EmployeeFormData>();

  const watchDepartment = watch('department_id');

  useEffect(() => {
    dispatch(fetchDepartments() as any);
    
    if (isEdit && id) {
      dispatch(fetchEmployee(id) as any);
    }

    return () => {
      dispatch(clearSelectedEmployee());
    };
  }, [dispatch, isEdit, id]);

  useEffect(() => {
    if (watchDepartment) {
      setSelectedDepartment(watchDepartment);
      dispatch(fetchDesignations(watchDepartment) as any);
    }
  }, [watchDepartment, dispatch]);

  useEffect(() => {
    if (selectedEmployee && isEdit) {
      reset({
        first_name: selectedEmployee.first_name,
        last_name: selectedEmployee.last_name,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone || '',
        date_of_birth: selectedEmployee.date_of_birth || '',
        joining_date: selectedEmployee.joining_date,
        department_id: selectedEmployee.department_id || '',
        designation_id: selectedEmployee.designation_id || '',
        employment_type: selectedEmployee.employment_type,
        pan_number: selectedEmployee.pan_number || '',
        aadhaar_number: selectedEmployee.aadhaar_number || '',
        bank_account_number: selectedEmployee.bank_account_number || '',
        bank_ifsc: selectedEmployee.bank_ifsc || '',
        bank_name: selectedEmployee.bank_name || '',
      });
      
      if (selectedEmployee.department_id) {
        setSelectedDepartment(selectedEmployee.department_id);
        dispatch(fetchDesignations(selectedEmployee.department_id) as any);
      }
    }
  }, [selectedEmployee, isEdit, reset, dispatch]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (isEdit && id) {
        await dispatch(updateEmployee({ id, data }) as any).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Employee updated successfully',
        }));
      } else {
        await dispatch(createEmployee(data) as any).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Employee created successfully',
        }));
      }
      navigate('/employees');
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'An error occurred',
      }));
    }
  };

  const handleCancel = () => {
    navigate('/employees');
  };

  if (loading && isEdit) {
    return <Loading message="Loading employee..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Employee' : 'Add New Employee'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('first_name', {
                    required: 'First name is required',
                  })}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('last_name', {
                    required: 'Last name is required',
                  })}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isEdit} // Email cannot be changed
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  {...register('phone', {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Phone must be 10 digits',
                    },
                  })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('date_of_birth')}
                  error={!!errors.date_of_birth}
                  helperText={errors.date_of_birth?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Joining Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('joining_date', {
                    required: 'Joining date is required',
                  })}
                  error={!!errors.joining_date}
                  helperText={errors.joining_date?.message}
                />
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Employment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    {...register('department_id')}
                    label="Department"
                    error={!!errors.department_id}
                  >
                    <MenuItem value="">Select Department</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Designation</InputLabel>
                  <Select
                    {...register('designation_id')}
                    label="Designation"
                    disabled={!selectedDepartment}
                    error={!!errors.designation_id}
                  >
                    <MenuItem value="">Select Designation</MenuItem>
                    {designations.map((desig) => (
                      <MenuItem key={desig.id} value={desig.id}>
                        {desig.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    {...register('employment_type', {
                      required: 'Employment type is required',
                    })}
                    label="Employment Type"
                    error={!!errors.employment_type}
                  >
                    <MenuItem value="full_time">Full Time</MenuItem>
                    <MenuItem value="part_time">Part Time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="intern">Intern</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Compliance Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Compliance Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  {...register('pan_number', {
                    pattern: {
                      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: 'Invalid PAN format (e.g., ABCDE1234F)',
                    },
                  })}
                  error={!!errors.pan_number}
                  helperText={errors.pan_number?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aadhaar Number"
                  {...register('aadhaar_number', {
                    pattern: {
                      value: /^[0-9]{12}$/,
                                           message: 'Aadhaar must be 12 digits',
                   },
                 })}
                 error={!!errors.aadhaar_number}
                 helperText={errors.aadhaar_number?.message}
               />
             </Grid>

             {/* Banking Information */}
             <Grid item xs={12}>
               <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                 Banking Information
               </Typography>
               <Divider sx={{ mb: 2 }} />
             </Grid>

             <Grid item xs={12} sm={6}>
               <TextField
                 fullWidth
                 label="Bank Account Number"
                 {...register('bank_account_number')}
                 error={!!errors.bank_account_number}
                 helperText={errors.bank_account_number?.message}
               />
             </Grid>

             <Grid item xs={12} sm={6}>
               <TextField
                 fullWidth
                 label="IFSC Code"
                 {...register('bank_ifsc', {
                   pattern: {
                     value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                     message: 'Invalid IFSC format (e.g., SBIN0001234)',
                   },
                 })}
                 error={!!errors.bank_ifsc}
                 helperText={errors.bank_ifsc?.message}
               />
             </Grid>

             <Grid item xs={12} sm={6}>
               <TextField
                 fullWidth
                 label="Bank Name"
                 {...register('bank_name')}
                 error={!!errors.bank_name}
                 helperText={errors.bank_name?.message}
               />
             </Grid>

             {/* Form Actions */}
             <Grid item xs={12}>
               <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                 <Button
                   variant="outlined"
                   onClick={handleCancel}
                   startIcon={<Cancel />}
                 >
                   Cancel
                 </Button>
                 <Button
                   type="submit"
                   variant="contained"
                   startIcon={<Save />}
                   disabled={loading}
                 >
                   {isEdit ? 'Update Employee' : 'Create Employee'}
                 </Button>
               </Box>
             </Grid>
           </Grid>
         </form>
       </CardContent>
     </Card>
   </Box>
 );
};

export default EmployeeForm;
