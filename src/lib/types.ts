export type Language = "FR" | "EN"

export type UserRole = "Admin" | "Doctor" | "Médecin Chef" | "Nurse" | "Reception"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  is_active: boolean
}

export interface Service {
  id: string
  name: string
}

export interface Room {
  id: string
  roomNumber: string
  serviceId: string
  serviceName: string
  beds: number
  occupiedBeds: number
}

export interface Patient {
  id: string
  name: string
  age: number
  doctorId: string
  doctorName: string
  status: "consultation" | "hospitalized"
}

export interface ConsultationHistory {
  id: string
  patientId: string
  date: string
  diagnosis: string
  medications: string
}

export interface DoctorSchedule {
  id: string
  doctorId: string
  doctorName: string
  day: string
  startTime: string
  endTime: string
}

export interface Notification {
  id: string
  patientName: string
  message: string
  type: "lab" | "radiology"
  read: boolean
}

// Reception types
export interface ReceptionPatient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  serviceId: string
  serviceName: string
  doctorId: string
  doctorName: string
  date: string
  time: string
}

export interface Hospitalisation {
  id: string
  patientId: string
  patientName: string
  serviceId: string
  serviceName: string
  roomId: string
  roomNumber: string
  bed: number
  status: "waiting" | "hospitalised"
}

export interface Bill {
  id: string
  patientId: string
  patientName: string
  amount: number
  status: "paid" | "unpaid"
}

export interface AmbulanceRequest {
  id: string
  patientId: string
  patientName: string
  status: "pending" | "completed"
}

export const adminTranslations = {
  FR: {
    // Navigation
    dashboard: "Tableau de bord",
    users: "Utilisateurs",
    services: "Services",
    rooms: "Chambres",
    logout: "Déconnexion",

    // Dashboard
    totalUsers: "Total Utilisateurs",
    totalPatients: "Total Patients",
    totalDoctors: "Total Médecins",
    totalRooms: "Total Chambres",
    totalServices: "Total Services",

    // Common
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    actions: "Actions",
    status: "Statut",
    active: "Actif",
    inactive: "Inactif",
    available: "Disponible",
    full: "Complet",

    // Users
    addUser: "Ajouter Utilisateur",
    editUser: "Modifier Utilisateur",
    deleteUser: "Supprimer Utilisateur",
    deleteUserConfirm: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    name: "Nom",
    email: "Email",
    password: "Mot de passe",
    role: "Rôle",

    // Services
    addService: "Ajouter Service",
    editService: "Modifier Service",
    deleteService: "Supprimer Service",
    deleteServiceConfirm: "Êtes-vous sûr de vouloir supprimer ce service ?",
    serviceName: "Nom du Service",

    // Rooms
    addRoom: "Ajouter Chambre",
    editRoom: "Modifier Chambre",
    deleteRoom: "Supprimer Chambre",
    deleteRoomConfirm: "Êtes-vous sûr de vouloir supprimer cette chambre ?",
    roomNumber: "Numéro de Chambre",
    service: "Service",
    numberOfBeds: "Nombre de Lits",
    occupancy: "Occupation",
  },
  EN: {
    // Navigation
    dashboard: "Dashboard",
    users: "Users",
    services: "Services",
    rooms: "Rooms",
    logout: "Logout",

    // Dashboard
    totalUsers: "Total Users",
    totalPatients: "Total Patients",
    totalDoctors: "Total Doctors",
    totalRooms: "Total Rooms",
    totalServices: "Total Services",

    // Common
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    actions: "Actions",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    available: "Available",
    full: "Full",

    // Users
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    deleteUserConfirm: "Are you sure you want to delete this user?",
    name: "Name",
    email: "Email",
    password: "Password",
    role: "Role",

    // Services
    addService: "Add Service",
    editService: "Edit Service",
    deleteService: "Delete Service",
    deleteServiceConfirm: "Are you sure you want to delete this service?",
    serviceName: "Service Name",

    // Rooms
    addRoom: "Add Room",
    editRoom: "Edit Room",
    deleteRoom: "Delete Room",
    deleteRoomConfirm: "Are you sure you want to delete this room?",
    roomNumber: "Room Number",
    service: "Service",
    numberOfBeds: "Number of Beds",
    occupancy: "Occupancy",
  },
}

export const doctorTranslations = {
  FR: {
    // Navigation
    dashboard: "Tableau de bord",
    myPatients: "Mes Patients",
    consultation: "Consultation",
    history: "Historique",
    planning: "Planning",
    logout: "Déconnexion",

    // Dashboard
    welcome: "Bienvenue",
    totalPatients: "Total Patients",
    totalMyPatients: "Total Mes Patients",
    totalDoctors: "Total Médecins",
    todayAppointments: "Rendez-vous du Jour",
    appointmentTime: "Heure",
    appointmentPatient: "Patient",
    appointmentDoctor: "Médecin",
    appointmentService: "Service",
    appointmentStatus: "Statut",
    noAppointmentsToday: "Aucun rendez-vous aujourd'hui",

    // Patients
    patientName: "Nom du Patient",
    doctor: "Médecin",
    age: "Âge",
    status: "Statut",
    actions: "Actions",
    view: "Voir",
    consult: "Consulter",
    search: "Rechercher",
    searchPatient: "Rechercher un patient...",
    consultationStatus: "Consultation",
    hospitalizedStatus: "Hospitalisé",

    // Consultation
    patientInfo: "Informations Patient",
    medicalInfo: "Informations Médicales",
    weight: "Poids (kg)",
    height: "Taille (cm)",
    bloodPressure: "Tension Artérielle",
    heartRate: "Fréquence Cardiaque",
    diagnosis: "Diagnostic",
    diagnosisPlaceholder: "Entrez le diagnostic...",
    medications: "Médicaments",
    medicationsPlaceholder: "Entrez les médicaments...",
    hospitalization: "Hospitalisation",
    hospitalizePatient: "Hospitaliser le patient",
    save: "Enregistrer",

    // History
    date: "Date",
    noHistory: "Aucun historique disponible",

    // Planning
    day: "Jour",
    time: "Heure",
    addSchedule: "Ajouter Horaire",
    editSchedule: "Modifier Horaire",
    deleteSchedule: "Supprimer Horaire",
    deleteScheduleConfirm: "Êtes-vous sûr de vouloir supprimer cet horaire ?",
    startTime: "Heure de début",
    endTime: "Heure de fin",
    selectDoctor: "Sélectionner un médecin",
    selectDay: "Sélectionner un jour",

    // Days
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",

    // Common
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    confirm: "Confirmer",

    // Notifications
    notifications: "Notifications",
    labResults: "Résultats de laboratoire prêts",
    radiologyResults: "Résultats de radiologie disponibles",
    noNotifications: "Aucune notification",
  },
  EN: {
    // Navigation
    dashboard: "Dashboard",
    myPatients: "My Patients",
    consultation: "Consultation",
    history: "History",
    planning: "Planning",
    logout: "Logout",

    // Dashboard
    welcome: "Welcome",
    totalPatients: "Total Patients",
    totalMyPatients: "Total My Patients",
    totalDoctors: "Total Doctors",
    todayAppointments: "Today's Appointments",
    appointmentTime: "Time",
    appointmentPatient: "Patient",
    appointmentDoctor: "Doctor",
    appointmentService: "Service",
    appointmentStatus: "Status",
    noAppointmentsToday: "No appointments today",

    // Patients
    patientName: "Patient Name",
    doctor: "Doctor",
    age: "Age",
    status: "Status",
    actions: "Actions",
    view: "View",
    consult: "Consult",
    search: "Search",
    searchPatient: "Search patient...",
    consultationStatus: "Consultation",
    hospitalizedStatus: "Hospitalized",

    // Consultation
    patientInfo: "Patient Information",
    medicalInfo: "Medical Information",
    weight: "Weight (kg)",
    height: "Height (cm)",
    bloodPressure: "Blood Pressure",
    heartRate: "Heart Rate",
    diagnosis: "Diagnosis",
    diagnosisPlaceholder: "Enter diagnosis...",
    medications: "Medications",
    medicationsPlaceholder: "Enter medications...",
    hospitalization: "Hospitalization",
    hospitalizePatient: "Hospitalize patient",
    save: "Save",

    // History
    date: "Date",
    noHistory: "No history available",

    // Planning
    day: "Day",
    time: "Time",
    addSchedule: "Add Schedule",
    editSchedule: "Edit Schedule",
    deleteSchedule: "Delete Schedule",
    deleteScheduleConfirm: "Are you sure you want to delete this schedule?",
    startTime: "Start Time",
    endTime: "End Time",
    selectDoctor: "Select a doctor",
    selectDay: "Select a day",

    // Days
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",

    // Common
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",

    // Notifications
    notifications: "Notifications",
    labResults: "Lab results ready",
    radiologyResults: "Radiology results available",
    noNotifications: "No notifications",
  },
}

export const nurseTranslations = {
  FR: {
    // Navigation
    dashboard: "Tableau de bord",
    patients: "Patients",
    treatment: "Traitement",
    logout: "Déconnexion",

    // Dashboard
    welcome: "Bienvenue",
    totalHospitalisedPatients: "Total Patients Hospitalisés",

    // Patients
    patientName: "Nom du Patient",
    room: "Chambre",
    bed: "Lit",
    status: "Statut",
    actions: "Actions",
    view: "Voir",
    addTreatment: "Ajouter Traitement",
    search: "Rechercher",
    searchByName: "Rechercher par nom...",
    hospitalised: "Hospitalisé",

    // Treatment
    patientInfo: "Informations Patient",
    treatmentForm: "Formulaire de Traitement",
    medications: "Médicaments",
    medicationsPlaceholder: "Entrez les médicaments...",
    notes: "Notes",
    notesPlaceholder: "Notes optionnelles...",
    saveTreatment: "Enregistrer Traitement",
    selectPatient: "Sélectionner un patient",
    treatmentSaved: "Traitement enregistré avec succès",

    // Common
    save: "Enregistrer",
    cancel: "Annuler",
  },
  EN: {
    // Navigation
    dashboard: "Dashboard",
    patients: "Patients",
    treatment: "Treatment",
    logout: "Logout",

    // Dashboard
    welcome: "Welcome",
    totalHospitalisedPatients: "Total Hospitalised Patients",

    // Patients
    patientName: "Patient Name",
    room: "Room",
    bed: "Bed",
    status: "Status",
    actions: "Actions",
    view: "View",
    addTreatment: "Add Treatment",
    search: "Search",
    searchByName: "Search by name...",
    hospitalised: "Hospitalised",

    // Treatment
    patientInfo: "Patient Information",
    treatmentForm: "Treatment Form",
    medications: "Medications",
    medicationsPlaceholder: "Enter medications...",
    notes: "Notes",
    notesPlaceholder: "Optional notes...",
    saveTreatment: "Save Treatment",
    selectPatient: "Select a patient",
    treatmentSaved: "Treatment saved successfully",

    // Common
    save: "Save",
    cancel: "Cancel",
  },
}

export const receptionTranslations = {
  FR: {
    // Navigation
    dashboard: "Tableau de bord",
    patients: "Patients",
    appointments: "Rendez-vous",
    hospitalisation: "Hospitalisation",
    billing: "Facturation",
    ambulance: "Ambulance",
    logout: "Déconnexion",

    // Dashboard
    welcome: "Bienvenue",
    totalPatients: "Total Patients",
    totalAppointments: "Total Rendez-vous",
    pendingInvoices: "Facturation en attente",

    // Common
    add: "Ajouter",
    edit: "Modifier",
    save: "Enregistrer",
    cancel: "Annuler",
    actions: "Actions",
    search: "Rechercher",
    searchByName: "Rechercher par nom...",

    // Patients
    addPatient: "Ajouter Patient",
    editPatient: "Modifier Patient",
    firstName: "Prénom",
    lastName: "Nom",
    dateOfBirth: "Date de Naissance",

    // Appointments
    addAppointment: "Ajouter Rendez-vous",
    editAppointment: "Modifier Rendez-vous",
    patient: "Patient",
    service: "Service",
    doctor: "Médecin",
    date: "Date",
    time: "Heure",
    selectPatient: "Sélectionner un patient",
    selectService: "Sélectionner un service",
    selectDoctor: "Sélectionner un médecin",

    // Hospitalisation
    admitPatient: "Admettre Patient",
    room: "Chambre",
    bed: "Lit",
    status: "Statut",
    waiting: "En Attente",
    hospitalised: "Hospitalisé",
    selectRoom: "Sélectionner une chambre",
    selectBed: "Sélectionner un lit",

    // Billing
    createBill: "Créer Facture",
    editBill: "Modifier Facture",
    amount: "Montant",
    paid: "Payé",
    unpaid: "Impayé",

    // Ambulance
    addRequest: "Ajouter Demande",
    editRequest: "Modifier Demande",
    pending: "En Attente",
    enRoute: "En Route",
    completed: "Terminé",
    priorityLabel: "Priorité",
    priorityNormal: "Normal",
    priorityUrgent: "Urgent",
    requestTime: "Heure de demande",
    notes: "Notes",
    details: "Détails de la demande",
    address: "Adresse",
    noNotes: "Aucune note",
    selectPriority: "Sélectionner la priorité",
  },
  EN: {
    // Navigation
    dashboard: "Dashboard",
    patients: "Patients",
    appointments: "Appointments",
    hospitalisation: "Hospitalisation",
    billing: "Billing",
    ambulance: "Ambulance",
    logout: "Logout",

    // Dashboard
    welcome: "Welcome",
    totalPatients: "Total Patients",
    totalAppointments: "Total Appointments",
    pendingInvoices: "Pending Invoices",

    // Common
    add: "Add",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    actions: "Actions",
    search: "Search",
    searchByName: "Search by name...",

    // Patients
    addPatient: "Add Patient",
    editPatient: "Edit Patient",
    firstName: "First Name",
    lastName: "Last Name",
    dateOfBirth: "Date of Birth",

    // Appointments
    addAppointment: "Add Appointment",
    editAppointment: "Edit Appointment",
    patient: "Patient",
    service: "Service",
    doctor: "Doctor",
    date: "Date",
    time: "Time",
    selectPatient: "Select a patient",
    selectService: "Select a service",
    selectDoctor: "Select a doctor",

    // Hospitalisation
    admitPatient: "Admit Patient",
    room: "Room",
    bed: "Bed",
    status: "Status",
    waiting: "Waiting",
    hospitalised: "Hospitalised",
    selectRoom: "Select a room",
    selectBed: "Select a bed",

    // Billing
    createBill: "Create Bill",
    editBill: "Edit Bill",
    amount: "Amount",
    paid: "Paid",
    unpaid: "Unpaid",

    // Ambulance
    addRequest: "Add Request",
    editRequest: "Edit Request",
    pending: "Pending",
    enRoute: "En Route",
    completed: "Completed",
    priorityLabel: "Priority",
    priorityNormal: "Normal",
    priorityUrgent: "Urgent",
    requestTime: "Request time",
    notes: "Notes",
    details: "Request details",
    address: "Address",
    noNotes: "No notes",
    selectPriority: "Select priority",
  },
}
