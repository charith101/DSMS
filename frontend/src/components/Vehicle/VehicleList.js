import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  DirectionsCar,
} from '@mui/icons-material';

// Sample data - in real app, this would come from API
const sampleVehicles = [
  {
    id: 1,
    vehicleNumber: 'ABC-1234',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    transmissionType: 'Manual',
    engineCapacity: 1600,
    registrationDate: '2020-01-15',
    status: 'Available',
    photo: null,
  },
  {
    id: 2,
    vehicleNumber: 'XYZ-5678',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    transmissionType: 'Automatic',
    engineCapacity: 1500,
    registrationDate: '2021-03-20',
    status: 'In Use',
    photo: null,
  },
  {
    id: 3,
    vehicleNumber: 'DEF-9012',
    make: 'Suzuki',
    model: 'Swift',
    year: 2019,
    transmissionType: 'Manual',
    engineCapacity: 1200,
    registrationDate: '2019-11-10',
    status: 'Maintenance',
    photo: null,
  },
];

const VehicleList = () => {
  const [vehicles, setVehicles] = useState(sampleVehicles);
  const [filteredVehicles, setFilteredVehicles] = useState(sampleVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const filtered = vehicles.filter(vehicle =>
      vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const handleMenuOpen = (event, vehicle) => {
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVehicle(null);
  };

  const handleViewDetails = () => {
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    // Navigate to edit form or open edit dialog
    console.log('Edit vehicle:', selectedVehicle);
    handleMenuClose();
  };

  const handleDelete = () => {
    // Show confirmation dialog and delete
    console.log('Delete vehicle:', selectedVehicle);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'In Use':
        return 'warning';
      case 'Maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Vehicle Fleet
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage and monitor all vehicles in the driving school fleet
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<DirectionsCar />}>
          Add New Vehicle
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Vehicles
              </Typography>
              <Typography variant="h4">
                {vehicles.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Available
              </Typography>
              <Typography variant="h4" color="success.main">
                {vehicles.filter(v => v.status === 'Available').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                In Use
              </Typography>
              <Typography variant="h4" color="warning.main">
                {vehicles.filter(v => v.status === 'In Use').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Maintenance
              </Typography>
              <Typography variant="h4" color="error.main">
                {vehicles.filter(v => v.status === 'Maintenance').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search vehicles by number, make, or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Vehicle Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell>Make/Model</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Transmission</TableCell>
              <TableCell>Engine</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((vehicle) => (
              <TableRow key={vehicle.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <DirectionsCar />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {vehicle.vehicleNumber}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {vehicle.make} {vehicle.model}
                  </Typography>
                </TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.transmissionType}</TableCell>
                <TableCell>{vehicle.engineCapacity}cc</TableCell>
                <TableCell>
                  <Chip
                    label={vehicle.status}
                    color={getStatusColor(vehicle.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{vehicle.registrationDate}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, vehicle)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Vehicle Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleViewDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Vehicle Details</DialogTitle>
        <DialogContent>
          {selectedVehicle && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Vehicle Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedVehicle.vehicleNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Make & Model
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedVehicle.make} {selectedVehicle.model}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Year
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedVehicle.year}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transmission
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedVehicle.transmissionType}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Engine Capacity
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedVehicle.engineCapacity}cc
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Registration Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedVehicle.registrationDate}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedVehicle.status}
                  color={getStatusColor(selectedVehicle.status)}
                  size="small"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewDialogClose}>Close</Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Vehicle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehicleList;
