import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Trash2, Plus, Car, Edit, FileText, Settings, Zap } from 'lucide-react';
import AdminNav from './AdminNav';
import ErrorHandle from "../errorHandle";

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: '',
    model: '',
    licensePlate: '',
    capacity: '',
    purchaseDate: '',
    licenseExpiry: '',
    availabilityStatus: 'Available',
    maintenanceHistory: [],
    fuelLogs: [],
    insurance: {
      provider: '',
      policyNumber: '',
      expiryDate: '',
    },
  });
  const [editMode, setEditMode] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  const [editVehicle, setEditVehicle] = useState({
    type: '',
    model: '',
    licensePlate: '',
    capacity: '',
    purchaseDate: '',
    licenseExpiry: '',
    availabilityStatus: 'Available',
    maintenanceHistory: [],
    fuelLogs: [],
    insurance: {
      provider: '',
      policyNumber: '',
      expiryDate: '',
    },
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState(null);
  const [currentUser, setCurrentUser] = useState({ role: 'admin' });
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [allFuelLogs, setAllFuelLogs] = useState([]);
  const [allMaintenances, setAllMaintenances] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [viewedFuelLogs, setViewedFuelLogs] = useState([]);
  const [viewedMaintenances, setViewedMaintenances] = useState([]);
  const [viewedDocuments, setViewedDocuments] = useState([]);

  // Sub-modals for adding related items
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [newFuelLog, setNewFuelLog] = useState({
    date: '',
    liters: '',
    cost: '',
  });
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    serviceDate: '',
    description: '',
    nextServiceDue: '',
  });
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    documentType: '',
    documentName: '',
    filePath: '',
    expiryDate: '',
  });

  useEffect(() => {
    setCurrentUser({ role: 'admin' });
    fetchVehicles();
    fetchAllRelated();
  }, []);

  const fetchVehicles = () => {
    axios
      .get('http://localhost:3001/vehicle/getVehicles')
      .then((result) => {
        // console.log('Fetched vehicles:', result.data);
        if (Array.isArray(result.data)) {
          setVehicles(result.data);
        } else {
          setErrorMsg('Invalid vehicle data format from server.');
        }
      })
      .catch((err) => {
        console.error('Fetch vehicles error:', err);
        setErrorMsg('Failed to fetch vehicles. Please check the server.');
      });
  };

  const fetchAllRelated = () => {
    axios
      .get('http://localhost:3001/vehicle/getFuelLogs')
      .then((result) => setAllFuelLogs(result.data || []))
      .catch(console.error);
    axios
      .get('http://localhost:3001/vehicle/getMaintenances')
      .then((result) => setAllMaintenances(result.data || []))
      .catch(console.error);
    axios
      .get('http://localhost:3001/vehicle/getDocuments')
      .then((result) => setAllDocuments(result.data || []))
      .catch(console.error);
  };

  const handleAddVehicle = () => {
    const cleanedVehicle = { ...newVehicle };
    axios
      .post('http://localhost:3001/vehicle/createVehicle', cleanedVehicle)
      .then((result) => {
        setVehicles([...vehicles, result.data]);
        resetNewVehicle();
        setShowModal(false);
        setErrorMsg("");
      })
      .catch((err) => {
        console.error('Add vehicle error:', err.response);
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error || 'Validation error occurred');
        } else if (err.response && err.response.status === 500) {
          setErrorMsg('Server error - please try again');
        } else {
          setErrorMsg("Something went wrong - check console for details");
        }
      });
  };

  const handleEditVehicle = (id) => {
    if (currentUser.role !== 'admin') {
      setErrorMsg("Only admins can edit vehicle records.");
      return;
    }
    const vehicle = vehicles.find((v) => v._id === id);
    if (!vehicle) {
      setErrorMsg("Vehicle not found.");
      return;
    }
    setEditVehicle({
      type: vehicle.type || '',
      model: vehicle.model || '',
      licensePlate: vehicle.licensePlate || '',
      capacity: vehicle.capacity || '',
      purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : '',
      licenseExpiry: vehicle.licenseExpiry ? new Date(vehicle.licenseExpiry).toISOString().split('T')[0] : '',
      availabilityStatus: vehicle.availabilityStatus || 'Available',
      maintenanceHistory: vehicle.maintenanceHistory || [],
      fuelLogs: vehicle.fuelLogs || [],
      insurance: vehicle.insurance || { provider: '', policyNumber: '', expiryDate: '' },
    });
    setEditVehicleId(id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSaveEdit = () => {
    if (currentUser.role !== 'admin') {
      setErrorMsg("Only admins can edit vehicle records.");
      return;
    }
    const cleanedVehicle = { ...editVehicle };
    axios
      .put(`http://localhost:3001/vehicle/updateVehicle/${editVehicleId}`, cleanedVehicle)
      .then((result) => {
        setVehicles(vehicles.map((v) => (v._id === editVehicleId ? result.data : v)));
        setEditMode(false);
        setEditVehicleId(null);
        resetEditVehicle();
        setShowModal(false);
        setErrorMsg("");
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          setErrorMsg(err.response.data.error || 'Validation error occurred');
        } else {
          console.error(err);
          setErrorMsg("Something went wrong");
        }
      });
  };

  const handleDeleteVehicle = (id) => {
    setDeleteVehicleId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    axios
      .delete(`http://localhost:3001/vehicle/deleteVehicle/${deleteVehicleId}`)
      .then(() => {
        setVehicles(vehicles.filter((v) => v._id !== deleteVehicleId));
        // Also remove related items
        setAllFuelLogs(allFuelLogs.filter(f => f.vehicleId !== deleteVehicleId));
        setAllMaintenances(allMaintenances.filter(m => m.vehicleId !== deleteVehicleId));
        setAllDocuments(allDocuments.filter(d => d.vehicle && d.vehicle._id !== deleteVehicleId));
      })
      .catch((err) => {
        console.error('Delete vehicle error:', err);
        setErrorMsg('Failed to delete vehicle. Please try again.');
      });
    setShowConfirmDelete(false);
    setDeleteVehicleId(null);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setDeleteVehicleId(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetNewVehicle();
    setEditMode(false);
    setEditVehicleId(null);
    resetEditVehicle();
    setErrorMsg("");
  };

  const resetNewVehicle = () => {
    setNewVehicle({
      type: '',
      model: '',
      licensePlate: '',
      capacity: '',
      purchaseDate: '',
      licenseExpiry: '',
      availabilityStatus: 'Available',
      maintenanceHistory: [],
      fuelLogs: [],
      insurance: {
        provider: '',
        policyNumber: '',
        expiryDate: '',
      },
    });
  };

  const resetEditVehicle = () => {
    setEditVehicle({
      type: '',
      model: '',
      licensePlate: '',
      capacity: '',
      purchaseDate: '',
      licenseExpiry: '',
      availabilityStatus: 'Available',
      maintenanceHistory: [],
      fuelLogs: [],
      insurance: {
        provider: '',
        policyNumber: '',
        expiryDate: '',
      },
    });
  };

  const handleViewVehicle = (id) => {
    const vehicle = vehicles.find((v) => v._id === id);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setSelectedVehicleId(id);
      // Filter related from global states
      setViewedFuelLogs(allFuelLogs.filter(f => f.vehicleId === id));
      setViewedMaintenances(allMaintenances.filter(m => m.vehicleId === id));
      setViewedDocuments(allDocuments.filter(d => d.vehicle && d.vehicle._id === id));
      setShowVehicleModal(true);
    }
  };

  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setSelectedVehicleId(null);
    setSelectedVehicle(null);
    setViewedFuelLogs([]);
    setViewedMaintenances([]);
    setViewedDocuments([]);
    // Reset sub forms
    resetNewFuelLog();
    resetNewMaintenance();
    resetNewDocument();
  };

  const resetNewFuelLog = () => {
    setNewFuelLog({
      date: '',
      liters: '',
      cost: '',
    });
  };

  const resetNewMaintenance = () => {
    setNewMaintenance({
      serviceDate: '',
      description: '',
      nextServiceDue: '',
    });
  };

  const resetNewDocument = () => {
    setNewDocument({
      documentType: '',
      documentName: '',
      filePath: '',
      expiryDate: '',
    });
  };

  const handleAddFuelLog = () => {
    const cleanedFuelLog = {
      vehicleId: selectedVehicleId,
      date: newFuelLog.date,
      liters: parseFloat(newFuelLog.liters) || 0,
      cost: parseFloat(newFuelLog.cost) || 0,
    };
    axios
      .post('http://localhost:3001/vehicle/createFuelLog', cleanedFuelLog)
      .then((result) => {
        // result is the updated vehicle; extract new fuelLogs
        const updatedFuelLogs = result.data.fuelLogs || [];
        const updatedWithId = updatedFuelLogs.map(log => ({ ...log, vehicleId: selectedVehicleId }));
        setViewedFuelLogs(updatedWithId);
        setAllFuelLogs(prev => [...prev.filter(f => f.vehicleId !== selectedVehicleId), ...updatedWithId]);
        resetNewFuelLog();
        setShowFuelModal(false);
      })
      .catch((err) => {
        console.error('Add fuel log error:', err);
        setErrorMsg('Failed to add fuel log.');
      });
  };

  const handleAddMaintenance = () => {
    const cleanedMaintenance = {
      vehicleId: selectedVehicleId,
      serviceDate: newMaintenance.serviceDate,
      description: newMaintenance.description,
      nextServiceDue: newMaintenance.nextServiceDue,
    };
    axios
      .post('http://localhost:3001/vehicle/createMaintenance', cleanedMaintenance)
      .then((result) => {
        // result is the updated vehicle; extract new maintenanceHistory
        const updatedMaintenances = result.data.maintenanceHistory || [];
        const updatedWithId = updatedMaintenances.map(m => ({ ...m, vehicleId: selectedVehicleId }));
        setViewedMaintenances(updatedWithId);
        setAllMaintenances(prev => [...prev.filter(m => m.vehicleId !== selectedVehicleId), ...updatedWithId]);
        resetNewMaintenance();
        setShowMaintenanceModal(false);
      })
      .catch((err) => {
        console.error('Add maintenance error:', err);
        setErrorMsg('Failed to add maintenance.');
      });
  };

  const handleAddDocument = () => {
    const cleanedDocument = {
      ...newDocument,
      vehicle: selectedVehicleId,
    };
    axios
      .post('http://localhost:3001/vehicle/createDocument', cleanedDocument)
      .then((result) => {
        setViewedDocuments([...viewedDocuments, result.data]);
        setAllDocuments([...allDocuments, result.data]);
        resetNewDocument();
        setShowDocumentModal(false);
      })
      .catch((err) => {
        console.error('Add document error:', err);
        setErrorMsg('Failed to add document.');
      });
  };

  const handleGenerateAllVehiclesReport = () => {
    try {
      console.log('Generating PDF with vehicles:', vehicles);
      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        setErrorMsg('No vehicle data available to generate the report.');
        alert('No vehicle data available to generate the report.');
        return;
      }

      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.text('Vehicle List', 20, yPos);
      yPos += 15;

      // Column Headers
      doc.setFontSize(12);
      doc.text('License Plate', 20, yPos);
      doc.text('Type', 50, yPos);
      doc.text('Model', 80, yPos);
      doc.text('Capacity', 110, yPos);
      doc.text('Availability', 130, yPos);
      doc.text('Purchase Date', 160, yPos);
      yPos += 10;
      doc.line(20, yPos, 190, yPos); // Horizontal line under headers
      yPos += 5;

      // Vehicle Data
      doc.setFontSize(10);
      vehicles.forEach((vehicle, index) => {
        console.log(`Processing vehicle ${index + 1}:`, vehicle);
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        // Convert all fields to strings and handle undefined/null
        const licensePlate = String(vehicle.licensePlate || 'N/A').substring(0, 15);
        const type = String(vehicle.type || 'N/A').substring(0, 15);
        const model = String(vehicle.model || 'N/A').substring(0, 15);
        const capacity = String(vehicle.capacity || 'N/A').substring(0, 10);
        const availabilityStatus = String(vehicle.availabilityStatus || 'N/A').substring(0, 15);
        const purchaseDate = String(vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString() : 'N/A').substring(0, 15);

        doc.text(licensePlate, 20, yPos);
        doc.text(type, 50, yPos);
        doc.text(model, 80, yPos);
        doc.text(capacity, 110, yPos);
        doc.text(availabilityStatus, 130, yPos);
        doc.text(purchaseDate, 160, yPos);
        yPos += 7;
      });

      // Save PDF
      doc.save('vehicle-list.pdf');
    } catch (err) {
      console.error('Error generating report:', err);
      setErrorMsg('Failed to generate report. Please check the console for details.');
      alert('Failed to generate report. Please check the console for details.');
    }
  };

  return (
    <div>
      <AdminNav page="vehicles" />
      <section
        className="text-white pb-5"
        style={{
          background: `linear-gradient(90deg, rgba(13,81,253,1) 20%, rgba(10,132,202,0.3) 100%), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat`,
          marginTop: "76px",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container py-5 mt-5">
          <h1 className="fw-bold display-5 mb-3 mx-1">Vehicle Management</h1>
          <h6 className="fs-6 lead opacity-90">
            Manage vehicles, fuel logs, maintenance, and documents for the driving school.
          </h6>
        </div>
      </section>
      <div className="ms-auto" style={{ marginLeft: '250px', paddingTop: '40px' }}>
        <div className="py-5 bg-light">
          <div className="container">
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <Plus size={64} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Add New Vehicle</h3>
                        <small className="text-muted">Click below to register a new vehicle</small>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '16px', maxWidth: '200px' }}
                      onClick={() => setShowModal(true)}
                    >
                      <Plus className="me-2" size={20} /> Add Vehicle
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card border-2 shadow-sm p-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                        <Car size={64} className="text-info" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Vehicle List</h3>
                        <small className="text-muted">View and manage all vehicles</small>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary mb-3"
                      style={{ padding: '6px 12px', fontSize: '16px', maxWidth: '200px' }}
                      onClick={handleGenerateAllVehiclesReport}
                    >
                      <FileText className="me-2" size={20} /> Generate PDF
                    </button>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th scope="col">License Plate</th>
                            <th scope="col">Type</th>
                            <th scope="col">Model</th>
                            <th scope="col">Capacity</th>
                            <th scope="col">Availability Status</th>
                            <th scope="col">Purchase Date</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicles.map((vehicle) => (
                            <tr key={vehicle._id}>
                              <td>{vehicle.licensePlate}</td>
                              <td>{vehicle.type}</td>
                              <td>{vehicle.model}</td>
                              <td>{vehicle.capacity}</td>
                              <td>{vehicle.availabilityStatus}</td>
                              <td>{vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString() : 'N/A'}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-warning me-2"
                                  onClick={() => handleEditVehicle(vehicle._id)}
                                  disabled={currentUser.role !== 'admin'}
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="btn btn-sm btn-danger me-2"
                                  onClick={() => handleDeleteVehicle(vehicle._id)}
                                >
                                  <Trash2 size={18} />
                                </button>
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleViewVehicle(vehicle._id)}
                                >
                                  <Settings size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Add/Edit Modal */}
        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="type">Type</label>
                    <select
                      id="type"
                      className="form-control mb-2"
                      value={editMode ? editVehicle.type : newVehicle.type}
                      onChange={(e) => editMode ? setEditVehicle({ ...editVehicle, type: e.target.value }) : setNewVehicle({ ...newVehicle, type: e.target.value })}
                    >
                      <option value="">Select Type</option>
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="Van">Van</option>
                      <option value="Other">Other</option>
                    </select>
                    <ErrorHandle for="type" error={errorMsg}/>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="model">Model</label>
                    <input
                      id="model"
                      type="text"
                      required
                      className="form-control mb-2"
                      placeholder="Model"
                      value={editMode ? editVehicle.model : newVehicle.model}
                      onChange={(e) => editMode ? setEditVehicle({ ...editVehicle, model: e.target.value }) : setNewVehicle({ ...newVehicle, model: e.target.value })}
                    />
                    <ErrorHandle for="model" error={errorMsg}/>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="licensePlate">License Plate</label>
                    <input
                      id="licensePlate"
                      type="text"
                      required
                      className="form-control mb-2"
                      placeholder="License Plate"
                      value={editMode ? editVehicle.licensePlate : newVehicle.licensePlate}
                      onChange={(e) => editMode ? setEditVehicle({ ...editVehicle, licensePlate: e.target.value }) : setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                    />
                    <ErrorHandle for="licensePlate" error={errorMsg}/>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="capacity">Capacity</label>
                    <input
                      id="capacity"
                      type="number"
                      required
                      className="form-control mb-2"
                      placeholder="Capacity"
                      value={editMode ? editVehicle.capacity : newVehicle.capacity}
                      onChange={(e) => editMode ? setEditVehicle({ ...editVehicle, capacity: e.target.value }) : setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                    />
                    <ErrorHandle for="capacity" error={errorMsg}/>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="purchaseDate">Purchase Date</label>
                    <input
                      id="purchaseDate"
                      type="date"
                      required
                      className="form-control mb-2"
                      value={editMode ? editVehicle.purchaseDate : newVehicle.purchaseDate}
                      onChange={(e) => editMode ? setEditVehicle({ ...editVehicle, purchaseDate: e.target.value }) : setNewVehicle({ ...newVehicle, purchaseDate: e.target.value })}
                    />
                    <ErrorHandle for="purchaseDate" error={errorMsg}/>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="licenseExpiry">License Expiry</label>
                    <input
                      id="licenseExpiry"
                      type="date"
                      required
                      className="form-control mb-2"
                      value={editMode ? editVehicle.licenseExpiry : newVehicle.licenseExpiry}
                      onChange={(e) => editMode ? setEditVehicle({ ...editVehicle, licenseExpiry: e.target.value }) : setNewVehicle({ ...newVehicle, licenseExpiry: e.target.value })}
                    />
                    <ErrorHandle for="licenseExpiry" error={errorMsg}/>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="availabilityStatus">Availability Status</label>
                    <select
                      id="availabilityStatus"
                      className="form-control mb-2"
                      value={editMode ? editVehicle.availabilityStatus : newVehicle.availabilityStatus}
                      onChange={(e) => editMode ? setEditVehicle({ ...editVehicle, availabilityStatus: e.target.value }) : setNewVehicle({ ...newVehicle, availabilityStatus: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="In Use">In Use</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                    <ErrorHandle for="availabilityStatus" error={errorMsg}/>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="insuranceProvider">Insurance Provider</label>
                    <input
                      id="insuranceProvider"
                      type="text"
                      required
                      className="form-control mb-2"
                      placeholder="Insurance Provider"
                      value={editMode ? editVehicle.insurance.provider : newVehicle.insurance.provider}
                      onChange={(e) => {
                        const updatedInsurance = editMode 
                          ? { ...editVehicle.insurance, provider: e.target.value } 
                          : { ...newVehicle.insurance, provider: e.target.value };
                        editMode ? setEditVehicle({ ...editVehicle, insurance: updatedInsurance }) : setNewVehicle({ ...newVehicle, insurance: updatedInsurance });
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="insurancePolicyNumber">Insurance Policy Number</label>
                    <input
                      id="insurancePolicyNumber"
                      type="text"
                      required
                      className="form-control mb-2"
                      placeholder="Insurance Policy Number"
                      value={editMode ? editVehicle.insurance.policyNumber : newVehicle.insurance.policyNumber}
                      onChange={(e) => {
                        const updatedInsurance = editMode 
                          ? { ...editVehicle.insurance, policyNumber: e.target.value } 
                          : { ...newVehicle.insurance, policyNumber: e.target.value };
                        editMode ? setEditVehicle({ ...editVehicle, insurance: updatedInsurance }) : setNewVehicle({ ...newVehicle, insurance: updatedInsurance });
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="insuranceExpiryDate">Insurance Expiry Date</label>
                    <input
                      id="insuranceExpiryDate"
                      type="date"
                      required
                      className="form-control mb-2"
                      value={editMode ? editVehicle.insurance.expiryDate : newVehicle.insurance.expiryDate}
                      onChange={(e) => {
                        const updatedInsurance = editMode 
                          ? { ...editVehicle.insurance, expiryDate: e.target.value } 
                          : { ...newVehicle.insurance, expiryDate: e.target.value };
                        editMode ? setEditVehicle({ ...editVehicle, insurance: updatedInsurance }) : setNewVehicle({ ...newVehicle, insurance: updatedInsurance });
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                {editMode ? (
                  <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={handleAddVehicle}>Add Vehicle</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Delete Modal */}
        <div className={`modal fade ${showConfirmDelete ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showConfirmDelete ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={cancelDelete}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this vehicle record? This action cannot be undone and will also remove related logs and documents.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle View Modal */}
        <div className={`modal fade ${showVehicleModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showVehicleModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Vehicle Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseVehicleModal}></button>
              </div>
              <div className="modal-body">
                {selectedVehicle && (
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">🚗 Vehicle Info</h6>
                    <div className="row row-cols-1 row-cols-md-2 g-3">
                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">License Plate</h6>
                            <p className="mb-0 text-dark">{selectedVehicle.licensePlate}</p>
                        </div>
                        </div>

                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">Type / Model</h6>
                            <p className="mb-0 text-dark">
                            {selectedVehicle.type} {selectedVehicle.model}
                            </p>
                        </div>
                        </div>

                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">Capacity</h6>
                            <p className="mb-0 text-dark">{selectedVehicle.capacity}</p>
                        </div>
                        </div>

                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">Availability Status</h6>
                            <p className="mb-0 text-dark">{selectedVehicle.availabilityStatus}</p>
                        </div>
                        </div>

                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">Purchase Date</h6>
                            <p className="mb-0 text-dark">
                            {selectedVehicle.purchaseDate
                                ? new Date(selectedVehicle.purchaseDate).toLocaleDateString()
                                : 'N/A'}
                            </p>
                        </div>
                        </div>

                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">License Expiry</h6>
                            <p className="mb-0 text-dark">
                            {selectedVehicle.licenseExpiry
                                ? new Date(selectedVehicle.licenseExpiry).toLocaleDateString()
                                : 'N/A'}
                            </p>
                        </div>
                        </div>

                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">Insurance Provider</h6>
                            <p className="mb-0 text-dark">
                            {selectedVehicle.insurance?.provider || 'N/A'}
                            </p>
                        </div>
                        </div>

                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">Insurance Policy</h6>
                            <p className="mb-0 text-dark">
                            {selectedVehicle.insurance?.policyNumber || 'N/A'}
                            </p>
                        </div>
                        </div>

                        <div className="col">
                        <div className="p-3 bg-light rounded-3">
                            <h6 className="fw-bold text-muted mb-1">Insurance Expiry</h6>
                            <p className="mb-0 text-dark">
                            {selectedVehicle.insurance?.expiryDate
                                ? new Date(selectedVehicle.insurance.expiryDate).toLocaleDateString()
                                : 'N/A'}
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                )}
                <div className="row mt-4">
                  <div className="col-md-4">
                    <h6>Fuel Logs ({viewedFuelLogs.length})</h6>
                    <button className="btn btn-sm btn-success mb-2" onClick={() => setShowFuelModal(true)}>
                      <Plus size={12} className="me-1" /> Add Fuel Log
                    </button>
                    <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table className="table table-sm">
                        <thead>
                          <tr><th>Date</th><th>Liters</th><th>Cost</th></tr>
                        </thead>
                        <tbody>
                          {viewedFuelLogs.map((log, idx) => (
                            <tr key={idx}>
                              <td>{new Date(log.date).toLocaleDateString()}</td>
                              <td>{log.liters}</td>
                              <td>{log.cost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <h6>Maintenance History ({viewedMaintenances.length})</h6>
                    <button className="btn btn-sm btn-success mb-2" onClick={() => setShowMaintenanceModal(true)}>
                      <Plus size={12} className="me-1" /> Add Maintenance
                    </button>
                    <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table className="table table-sm">
                        <thead>
                          <tr><th>Description</th><th>Service Date</th><th>Next Due</th></tr>
                        </thead>
                        <tbody>
                          {viewedMaintenances.map((m, idx) => (
                            <tr key={idx}>
                              <td>{m.description}</td>
                              <td>{new Date(m.serviceDate).toLocaleDateString()}</td>
                              <td>{new Date(m.nextServiceDue).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <h6>Documents ({viewedDocuments.length})</h6>
                    <button className="btn btn-sm btn-success mb-2" onClick={() => setShowDocumentModal(true)}>
                      <Plus size={12} className="me-1" /> Add Document
                    </button>
                    <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table className="table table-sm">
                        <thead>
                          <tr><th>Type</th><th>Name</th><th>Path</th><th>Expiry</th></tr>
                        </thead>
                        <tbody>
                          {viewedDocuments.map((d, idx) => (
                            <tr key={idx}>
                              <td>{d.documentType}</td>
                              <td>{d.documentName}</td>
                              <td>{d.filePath}</td>
                              <td>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseVehicleModal}>Close</button>
              </div>
            </div>
          </div>
        </div>

        {/* Fuel Log Add Modal */}
        <div className={`modal fade ${showFuelModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showFuelModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Fuel Log</h5>
                <button type="button" className="btn-close" onClick={() => setShowFuelModal(false)}></button>
              </div>
              <div className="modal-body">
                <label htmlFor="fuelDate">Date</label>
                <input
                  id="fuelDate"
                  type="date"
                  required
                  className="form-control mb-2"
                  value={newFuelLog.date}
                  onChange={(e) => setNewFuelLog({ ...newFuelLog, date: e.target.value })}
                />
                <label htmlFor="fuelLiters">Liters</label>
                <input
                  id="fuelLiters"
                  type="number"
                  required
                  className="form-control mb-2"
                  placeholder="Liters"
                  value={newFuelLog.liters}
                  onChange={(e) => setNewFuelLog({ ...newFuelLog, liters: e.target.value })}
                />
                <label htmlFor="fuelCost">Cost</label>
                <input
                  id="fuelCost"
                  type="number"
                  required
                  className="form-control mb-2"
                  placeholder="Cost"
                  value={newFuelLog.cost}
                  onChange={(e) => setNewFuelLog({ ...newFuelLog, cost: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFuelModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleAddFuelLog}>Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Add Modal */}
        <div className={`modal fade ${showMaintenanceModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showMaintenanceModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Maintenance</h5>
                <button type="button" className="btn-close" onClick={() => setShowMaintenanceModal(false)}></button>
              </div>
              <div className="modal-body">
                <label htmlFor="maintenanceDescription">Description</label>
                <input
                  id="maintenanceDescription"
                  type="text"
                  required
                  className="form-control mb-2"
                  placeholder="Description"
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                />
                <label htmlFor="maintenanceServiceDate">Service Date</label>
                <input
                  id="maintenanceServiceDate"
                  type="date"
                  required
                  className="form-control mb-2"
                  placeholder="Service Date"
                  value={newMaintenance.serviceDate}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, serviceDate: e.target.value })}
                />
                <label htmlFor="maintenanceNextServiceDue">Next Service Due</label>
                <input
                  id="maintenanceNextServiceDue"
                  type="date"
                  required
                  className="form-control mb-2"
                  placeholder="Next Service Due"
                  value={newMaintenance.nextServiceDue}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, nextServiceDue: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMaintenanceModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleAddMaintenance}>Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* Document Add Modal */}
        <div className={`modal fade ${showDocumentModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDocumentModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Document</h5>
                <button type="button" className="btn-close" onClick={() => setShowDocumentModal(false)}></button>
              </div>
              <div className="modal-body">
                <label htmlFor="documentType">Document Type</label>
                <input
                  id="documentType"
                  type="text"
                  required
                  className="form-control mb-2"
                  placeholder="Document Type (e.g., Registration)"
                  value={newDocument.documentType}
                  onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value })}
                />
                <label htmlFor="documentName">Document Name</label>
                <input
                  id="documentName"
                  type="text"
                  required
                  className="form-control mb-2"
                  placeholder="Document Name"
                  value={newDocument.documentName}
                  onChange={(e) => setNewDocument({ ...newDocument, documentName: e.target.value })}
                />
                <label htmlFor="documentFilePath">File Path</label>
                <input
                  id="documentFilePath"
                  type="text"
                  required
                  className="form-control mb-2"
                  placeholder="File Path (e.g., /uploads/doc.pdf)"
                  value={newDocument.filePath}
                  onChange={(e) => setNewDocument({ ...newDocument, filePath: e.target.value })}
                />
                <label htmlFor="documentExpiryDate">Expiry Date</label>
                <input
                  id="documentExpiryDate"
                  type="date"
                  required
                  className="form-control mb-2"
                  placeholder="Expiry Date"
                  value={newDocument.expiryDate}
                  onChange={(e) => setNewDocument({ ...newDocument, expiryDate: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocumentModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleAddDocument}>Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;