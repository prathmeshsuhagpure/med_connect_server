const Patient = require('../models/user/patient_model');

const getPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      bloodGroup = '',
      gender = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build query
    const query = {};

    // Search by name, phone, or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by blood group
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    // Filter by gender
    if (gender) {
      query.gender = gender;
    }

    // Filter by hospital/doctor if not admin
    if (req.user.role === 'hospital') {
      query.hospital = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.assignedDoctors = req.user.id;
    }

    // Execute query with pagination
    const patients = await Patient.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('hospital', 'displayName email')
      .populate('assignedDoctors', 'name specialization')
      .select('-__v');

    // Get total count
    const count = await Patient.countDocuments(query);

    // Calculate stats
    const stats = {
      total: await Patient.countDocuments(
        req.user.role === 'hospital' ? { hospital: req.user.id } : {}
      ),
      active: await Patient.countDocuments({
        ...(req.user.role === 'hospital' ? { hospital: req.user.id } : {}),
        status: 'active',
      }),
      inactive: await Patient.countDocuments({
        ...(req.user.role === 'hospital' ? { hospital: req.user.id } : {}),
        status: 'inactive',
      }),
      critical: await Patient.countDocuments({
        ...(req.user.role === 'hospital' ? { hospital: req.user.id } : {}),
        status: 'critical',
      }),
    };

    res.status(200).json({
      success: true,
      count: patients.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      stats,
      data: patients,
    });
  } catch (error) {
    console.error('Error in getPatients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message,
    });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('hospital', 'displayName email phone address')
      .populate('assignedDoctors', 'name specialization email phone')
      .populate({
        path: 'appointments',
        populate: {
          path: 'doctor',
          select: 'name specialization',
        },
        options: { sort: { appointmentDate: -1 }, limit: 10 },
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Check authorization
    if (
      req.user.role === 'hospital' &&
      patient.hospital.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient',
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error('Error in getPatientById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message,
    });
  }
};

module.exports = {
    getPatients, 
    getPatientById, 
};