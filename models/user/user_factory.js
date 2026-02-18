const Patient = require("./patient_model");
const Hospital = require("./hospital_model");
const Doctor = require("./doctor_model");

class UserFactory {
  
  static create(userData) {
    const role = userData.role?.toLowerCase();
    
    switch (role) {
      case 'patient':
        return new Patient(userData);
      case 'hospital':
        return new Hospital(userData);
      case 'doctor':
        return new Doctor(userData);
      default:
        throw new Error(`Invalid role: ${role}. Must be 'patient', 'doctor', or 'hospital'`);
    }
  }

  static async findById(id, role = null) {
    if (role) {
      const Model = this.getModelByRole(role);
      return await Model.findById(id);
    }

    // Search across all collections
    let user = await Patient.findById(id);
    if (user) return user;

    user = await Doctor.findById(id);
    if (user) return user;

    user = await Hospital.findById(id);
    if (user) return user;

    return null;
  }

  static async findByEmail(email, role = null) {
    const normalizedEmail = email.toLowerCase();

    if (role) {
      const Model = this.getModelByRole(role);
      return await Model.findOne({ email: normalizedEmail });
    }

    // Search across all collections
    let user = await Patient.findOne({ email: normalizedEmail });
    if (user) return user;

    user = await Doctor.findOne({ email: normalizedEmail });
    if (user) return user;

    user = await Hospital.findOne({ email: normalizedEmail });
    if (user) return user;

    return null;
  }

  static async findByRole(role, filter = {}) {
    const Model = this.getModelByRole(role);
    return await Model.find(filter);
  }

  static async findAll(filter = {}) {
    const [patients, doctors, hospitals] = await Promise.all([
      Patient.find(filter),
      Doctor.find(filter),
      Hospital.find(filter),
    ]);

    return {
      patients,
      doctors,
      hospitals,
      all: [...patients, ...doctors, ...hospitals],
    };
  }

  static async findAllCombined(filter = {}) {
    const result = await this.findAll(filter);
    return result.all;
  }

  static async count(role = null) {
    if (role) {
      const Model = this.getModelByRole(role);
      return await Model.countDocuments();
    }

    const [patientCount, doctorCount, hospitalCount] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Hospital.countDocuments(),
    ]);

    return {
      patients: patientCount,
      doctors: doctorCount,
      hospitals: hospitalCount,
      total: patientCount + doctorCount + hospitalCount,
    };
  }

  static async deleteById(id, role = null) {
    if (role) {
      const Model = this.getModelByRole(role);
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    }

    // Try all collections
    let result = await Patient.findByIdAndDelete(id);
    if (result) return true;

    result = await Doctor.findByIdAndDelete(id);
    if (result) return true;

    result = await Hospital.findByIdAndDelete(id);
    if (result) return true;

    return false;
  }

  static async updateById(id, updateData, role = null) {
    if (role) {
      const Model = this.getModelByRole(role);
      return await Model.findByIdAndUpdate(id, updateData, { new: true });
    }

    // Try all collections
    let user = await Patient.findByIdAndUpdate(id, updateData, { new: true });
    if (user) return user;

    user = await Doctor.findByIdAndUpdate(id, updateData, { new: true });
    if (user) return user;

    user = await Hospital.findByIdAndUpdate(id, updateData, { new: true });
    if (user) return user;

    return null;
  }

  static getModelByRole(role) {
    switch (role?.toLowerCase()) {
      case 'patient':
        return Patient;
      case 'hospital':
        return Hospital;
      case 'doctor':
        return Doctor;
      default:
        throw new Error(`Invalid role: ${role}. Must be 'patient', 'doctor', or 'hospital'`);
    }
  }

  static isPatient(user) {
    return user?.role === 'patient' || user instanceof Patient;
  }

  static isHospital(user) {
    return user?.role === 'hospital' || user instanceof Hospital;
  }

  static isDoctor(user) {
    return user?.role === 'doctor' || user instanceof Doctor;
  }

  static getUserData(user) {
    if (!user) return null;
    return user.getRoleData ? user.getRoleData() : user.getBaseData();
  }

  static async search(searchCriteria) {
    const [patients, doctors, hospitals] = await Promise.all([
      Patient.find(searchCriteria),
      Doctor.find(searchCriteria),
      Hospital.find(searchCriteria),
    ]);

    return {
      patients,
      doctors,
      hospitals,
      all: [...patients, ...doctors, ...hospitals],
    };
  }
}

module.exports = {
  Patient,        
  Hospital,       
  Doctor,         
  UserFactory,    
};