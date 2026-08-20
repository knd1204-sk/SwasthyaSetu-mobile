# SwasthyaSetu Backend API Documentation

Welcome to the official API documentation for the **SwasthyaSetu** backend service.

---

## Table of Contents

- [Overview](#overview)
- [Response Formats](#response-formats)
  - [Success Response Shape](#success-response-shape)
  - [Error Response Shape](#error-response-shape)
- [Authentication Endpoints](#authentication-endpoints)
  - [1. Register Doctor](#1-register-doctor)
  - [2. Register Laboratory](#2-register-laboratory)
  - [3. User Login](#3-user-login)
  - [4. Get Current User Profile](#4-get-current-user-profile)
- [Patient Endpoints](#patient-endpoints)
  - [1. Search Patient by Health ID](#1-search-patient-by-health-id)
- [Consultation Endpoints](#consultation-endpoints)
  - [1. Create Consultation](#1-create-consultation)
  - [2. Get Consultations for Patient](#2-get-consultations-for-patient)
  - [3. Update Consultation Status & Notes](#3-update-consultation-status--notes)
- [Prescription Endpoints](#prescription-endpoints)
  - [1. Create Prescription](#1-create-prescription)
  - [2. Get Prescriptions for Consultation](#2-get-prescriptions-for-consultation)
- [Lab Order Endpoints](#lab-order-endpoints)
  - [1. Create Lab Order](#1-create-lab-order)
  - [2. Get Pending Unassigned Lab Orders](#2-get-pending-unassigned-lab-orders)
  - [3. Accept Lab Order](#3-accept-lab-order)
  - [4. Get Laboratory Assigned Orders Queue](#4-get-laboratory-assigned-orders-queue)
  - [5. Get Lab Orders for Patient](#5-get-lab-orders-for-patient)
- [Lab Report Endpoints](#lab-report-endpoints)
  - [1. Upload Lab Report](#1-upload-lab-report)
  - [2. Get Lab Report by Order ID](#2-get-lab-report-by-order-id)
- [Notification Endpoints](#notification-endpoints)
  - [1. Get User Notifications](#1-get-user-notifications)
  - [2. Mark Notification as Read](#2-mark-notification-as-read)
- [Patient Self-Service Endpoints](#patient-self-service-endpoints)
  - [1. Get My Profile](#1-get-my-profile)
  - [2. Get My Consultations](#2-get-my-consultations)
  - [3. Get My Prescriptions](#3-get-my-prescriptions)
  - [4. Get My Lab Orders](#4-get-my-lab-orders)
  - [5. Get My Lab Reports](#5-get-my-lab-reports)
  - [6. Get My Chronic Conditions](#6-get-my-chronic-conditions)
- [AI Endpoints](#ai-endpoints)
  - [1. Scan Prescription](#1-scan-prescription)
  - [2. Check Drug Interaction](#2-check-drug-interaction)
  - [3. Acknowledge Drug Interaction Flag](#3-acknowledge-drug-interaction-flag)

---

## Overview

The SwasthyaSetu unified API serves three distinct clients:
1. **React Web App** — Doctor Dashboard
2. **React Web App** — Laboratory Dashboard
3. **React Native Mobile App** — Patient Mobile App

- **Base URL**: `http://localhost:5000/api`
- **Content Type**: `application/json` (except file uploads which use `multipart/form-data`)
- **Authentication Strategy**: JSON Web Token (JWT) sent in HTTP `Authorization` header as `Bearer <token>`.

> [!NOTE]
> Patient accounts are currently created manually in the database. There is no self-registration or signup endpoint for patients. Patients simply log in using their registered email or phone and password through the standard `/api/auth/login` endpoint.

---

## Response Formats

### Success Response Shape
```json
{
  "success": true,
  "message": "Human readable success message",
  "data": { ... }
}
```

### Error Response Shape
```json
{
  "success": false,
  "message": "Human readable error description",
  "errors": [ ... ]
}
```

---

## Authentication Endpoints

### 1. Register Doctor

Registers a new user account with the `doctor` role and creates an associated record in the `doctors` table.

- **URL**: `/api/auth/register/doctor`
- **Method**: `POST`
- **Auth Required**: `No`

#### Request Body Example
```json
{
  "email": "dr.neha.kapoor@swasthyasetu.org",
  "phone": "+919876543210",
  "password": "DoctorPass#2026",
  "full_name": "Dr. Neha Kapoor",
  "specialization": "Cardiology",
  "registration_number": "MCI-2026-98745",
  "clinic_hospital_name": "Apollo Heart Institute",
  "years_of_experience": 12
}
```

#### Success Response Example (`201 Created`)
```json
{
  "success": true,
  "message": "Doctor registered successfully",
  "data": {
    "user": {
      "id": "43e01b2d-bafc-4139-9f3f-a1b1ac06d58e",
      "email": "dr.neha.kapoor@swasthyasetu.org",
      "phone": "+919876543210",
      "role": "doctor",
      "created_at": "2026-08-17T07:28:14.283Z"
    },
    "profile": {
      "id": "3ab123c2-f666-4416-adb0-c9da6e4c43ad",
      "user_id": "43e01b2d-bafc-4139-9f3f-a1b1ac06d58e",
      "full_name": "Dr. Neha Kapoor",
      "specialization": "Cardiology",
      "registration_number": "MCI-2026-98745",
      "clinic_hospital_name": "Apollo Heart Institute",
      "years_of_experience": 12,
      "created_at": "2026-08-17T07:28:14.283Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Response Examples

##### Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Medical registration number is required",
      "path": "registration_number",
      "location": "body"
    }
  ]
}
```

##### Duplicate User (`409 Conflict`)
```json
{
  "success": false,
  "message": "User with this email or phone already exists"
}
```

---

### 2. Register Laboratory

Registers a new user account with the `laboratory` role and creates an associated record in the `laboratories` table.

- **URL**: `/api/auth/register/laboratory`
- **Method**: `POST`
- **Auth Required**: `No`

#### Request Body Example
```json
{
  "email": "metro.labs@swasthyasetu.org",
  "phone": "+919811223344",
  "password": "LabPass#2026",
  "lab_name": "Metro Pathology & Diagnostic Center",
  "registration_number": "LAB-REG-554433",
  "address": "45 Healthcare Blvd, Sector 62, Noida",
  "services_offered": [
    "Complete Blood Count",
    "Lipid Profile",
    "Thyroid Profile"
  ]
}
```

#### Success Response Example (`201 Created`)
```json
{
  "success": true,
  "message": "Laboratory registered successfully",
  "data": {
    "user": {
      "id": "5713496d-1eea-4284-9233-24c5935f89e1",
      "email": "metro.labs@swasthyasetu.org",
      "phone": "+919811223344",
      "role": "laboratory",
      "created_at": "2026-08-17T07:29:33.431Z"
    },
    "profile": {
      "id": "7dd4bc62-2583-4451-8cad-bda80e50551d",
      "user_id": "5713496d-1eea-4284-9233-24c5935f89e1",
      "lab_name": "Metro Pathology & Diagnostic Center",
      "registration_number": "LAB-REG-554433",
      "address": "45 Healthcare Blvd, Sector 62, Noida",
      "services_offered": [
        "Complete Blood Count",
        "Lipid Profile",
        "Thyroid Profile"
      ],
      "created_at": "2026-08-17T07:29:33.431Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Response Examples

##### Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Laboratory name is required",
      "path": "lab_name",
      "location": "body"
    }
  ]
}
```

---

### 3. User Login

Authenticates a user (doctor, laboratory, or patient) using email or phone and password, returning a JWT token and user profile.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: `No`

#### Request Body Example
```json
{
  "identifier": "dr.neha.kapoor@swasthyasetu.org",
  "password": "DoctorPass#2026"
}
```

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "43e01b2d-bafc-4139-9f3f-a1b1ac06d58e",
      "email": "dr.neha.kapoor@swasthyasetu.org",
      "phone": "+919876543210",
      "role": "doctor",
      "created_at": "2026-08-17T07:28:14.283Z"
    },
    "role": "doctor",
    "profile": {
      "id": "3ab123c2-f666-4416-adb0-c9da6e4c43ad",
      "user_id": "43e01b2d-bafc-4139-9f3f-a1b1ac06d58e",
      "full_name": "Dr. Neha Kapoor",
      "specialization": "Cardiology",
      "registration_number": "MCI-2026-98745",
      "clinic_hospital_name": "Apollo Heart Institute",
      "years_of_experience": 12,
      "created_at": "2026-08-17T07:28:14.283Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Response Examples

##### Invalid Credentials (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Invalid email/phone or password"
}
```

---

### 4. Get Current User Profile

Fetches profile details of the currently authenticated user based on the JWT token provided in the Authorization header.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: `Yes` (Bearer JWT token)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "43e01b2d-bafc-4139-9f3f-a1b1ac06d58e",
      "email": "dr.neha.kapoor@swasthyasetu.org",
      "phone": "+919876543210",
      "role": "doctor",
      "created_at": "2026-08-17T07:28:14.283Z"
    },
    "profile": {
      "id": "3ab123c2-f666-4416-adb0-c9da6e4c43ad",
      "user_id": "43e01b2d-bafc-4139-9f3f-a1b1ac06d58e",
      "full_name": "Dr. Neha Kapoor",
      "specialization": "Cardiology",
      "registration_number": "MCI-2026-98745",
      "clinic_hospital_name": "Apollo Heart Institute",
      "years_of_experience": 12,
      "created_at": "2026-08-17T07:28:14.283Z"
    }
  }
}
```

#### Error Response Examples

##### Missing Authorization Header (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Access denied. Authorization header with Bearer token is required."
}
```

##### Expired or Invalid Token (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## Patient Endpoints

### 1. Search Patient by Health ID

Finds a patient by their unique `health_id` and returns their full profile along with their recorded chronic conditions.

- **URL**: `/api/patients/search?health_id=<value>`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `doctor` or `laboratory` only)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient profile retrieved successfully",
  "data": {
    "id": "d4a75194-a558-4bf9-b7ca-3c2beaaa5f98",
    "user_id": "552a8c3d-813d-4ad7-800d-3806a49f1dff",
    "health_id": "ABDM-1786952428247",
    "full_name": "Rajesh V. Kumar",
    "date_of_birth": "1982-05-14",
    "gender": "Male",
    "blood_group": "B+",
    "address": "Flat 402, Green Acres, Mumbai",
    "emergency_contact": "+919820011223",
    "created_at": "2026-08-17T07:40:28.417Z",
    "chronic_conditions": [
      {
        "id": "5dddb4d7-1e39-4634-b41c-624b977624cb",
        "patient_id": "d4a75194-a558-4bf9-b7ca-3c2beaaa5f98",
        "condition_name": "Type 2 Diabetes Mellitus",
        "diagnosed_date": "2020-03-15",
        "status": "Active",
        "notes": "Managed with Metformin 500mg"
      },
      {
        "id": "20001fc4-b079-41e2-aaf1-c1dbc96d51bd",
        "patient_id": "d4a75194-a558-4bf9-b7ca-3c2beaaa5f98",
        "condition_name": "Essential Hypertension",
        "diagnosed_date": "2021-08-10",
        "status": "Active",
        "notes": "Blood pressure controlled"
      }
    ]
  }
}
```

#### Error Response Examples

##### Patient Not Found (`404 Not Found`)
```json
{
  "success": false,
  "message": "Patient with health_id 'NON_EXISTENT_999' not found"
}
```

##### Role Forbidden (`403 Forbidden`)
```json
{
  "success": false,
  "message": "Access denied. Role 'patient' is not authorized to access this resource."
}
```

---

## Consultation Endpoints

### 1. Create Consultation

Creates a new medical consultation record for a patient. Status defaults to `ongoing`.

- **URL**: `/api/consultations`
- **Method**: `POST`
- **Auth Required**: `Yes` (Role: `doctor` only)
- **Headers**:
  ```http
  Authorization: Bearer <doctor_jwt_token>
  ```

#### Request Body Example
```json
{
  "patient_id": "d4a75194-a558-4bf9-b7ca-3c2beaaa5f98",
  "symptoms": "Persistent fever, cough, and mild shortness of breath for 3 days",
  "doctor_notes": "Initial clinical assessment shows elevated temperature (101F). Chest clear.",
  "probable_diagnosis": "Viral Upper Respiratory Tract Infection"
}
```

#### Success Response Example (`201 Created`)
```json
{
  "success": true,
  "message": "Consultation created successfully",
  "data": {
    "id": "cf493787-6ec0-46b3-a536-eb7139b76e31",
    "patient_id": "d4a75194-a558-4bf9-b7ca-3c2beaaa5f98",
    "doctor_id": "213c3724-1e9f-4c9c-a563-bd1d49932c15",
    "consultation_date": "2026-08-17T07:40:28.655Z",
    "symptoms": "Persistent fever, cough, and mild shortness of breath for 3 days",
    "doctor_notes": "Initial clinical assessment shows elevated temperature (101F). Chest clear.",
    "probable_diagnosis": "Viral Upper Respiratory Tract Infection",
    "confirmed_diagnosis": null,
    "status": "ongoing",
    "created_at": "2026-08-17T07:40:28.655Z"
  }
}
```

#### Error Response Examples

##### Missing Patient ID (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "patient_id is required",
      "path": "patient_id",
      "location": "body"
    }
  ]
}
```

---

### 2. Get Consultations for Patient

Fetches all consultations for a specified patient, ordered by consultation date descending.

- **URL**: `/api/consultations/patient/:patientId`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `doctor`, `laboratory`, or `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient consultations retrieved successfully",
  "data": [
    {
      "id": "cf493787-6ec0-46b3-a536-eb7139b76e31",
      "patient_id": "d4a75194-a558-4bf9-b7ca-3c2beaaa5f98",
      "doctor_id": "213c3724-1e9f-4c9c-a563-bd1d49932c15",
      "consultation_date": "2026-08-17T07:40:28.655Z",
      "symptoms": "Persistent fever, cough, and mild shortness of breath for 3 days",
      "doctor_notes": "Updated notes: Patient reports fever subsided after paracetamol. Advised CBC test.",
      "probable_diagnosis": "Acute Bronchitis",
      "confirmed_diagnosis": null,
      "status": "awaiting_report",
      "created_at": "2026-08-17T07:40:28.655Z"
    }
  ]
}
```

---

### 3. Update Consultation Status & Notes

Updates notes, diagnoses, and/or status of an existing consultation. Enforces valid status transitions (`ongoing` -> `awaiting_report` -> `completed`).

- **URL**: `/api/consultations/:id`
- **Method**: `PATCH`
- **Auth Required**: `Yes` (Role: `doctor` who owns the consultation)
- **Headers**:
  ```http
  Authorization: Bearer <doctor_jwt_token>
  ```

#### Request Body Example
```json
{
  "doctor_notes": "Updated notes: Patient reports fever subsided after paracetamol. Advised CBC test.",
  "probable_diagnosis": "Acute Bronchitis",
  "status": "awaiting_report"
}
```

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Consultation updated successfully",
  "data": {
    "id": "cf493787-6ec0-46b3-a536-eb7139b76e31",
    "patient_id": "d4a75194-a558-4bf9-b7ca-3c2beaaa5f98",
    "doctor_id": "213c3724-1e9f-4c9c-a563-bd1d49932c15",
    "consultation_date": "2026-08-17T07:40:28.655Z",
    "symptoms": "Persistent fever, cough, and mild shortness of breath for 3 days",
    "doctor_notes": "Updated notes: Patient reports fever subsided after paracetamol. Advised CBC test.",
    "probable_diagnosis": "Acute Bronchitis",
    "confirmed_diagnosis": null,
    "status": "awaiting_report",
    "created_at": "2026-08-17T07:40:28.655Z"
  }
}
```

#### Error Response Examples

##### Illogical Status Transition (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Illogical status transition: Completed consultations cannot be reverted to ongoing status."
}
```

##### Unauthorized Doctor (`403 Forbidden`)
```json
{
  "success": false,
  "message": "Forbidden. You are not authorized to update this consultation."
}
```

---

## Prescription Endpoints

### 1. Create Prescription

Creates a new prescription record linked to a specific consultation. Enforces that the consultation belongs to the requesting doctor.

- **URL**: `/api/prescriptions`
- **Method**: `POST`
- **Auth Required**: `Yes` (Role: `doctor` who owns the consultation)
- **Headers**:
  ```http
  Authorization: Bearer <doctor_jwt_token>
  ```

#### Request Body Example
```json
{
  "consultation_id": "cf493787-6ec0-46b3-a536-eb7139b76e31",
  "medicine_name": "Azithromycin 500mg",
  "dosage": "1 Tablet Daily",
  "frequency": "Once a day after food",
  "duration": "5 days",
  "instructions": "Take with full glass of water. Do not skip doses."
}
```

#### Success Response Example (`201 Created`)
```json
{
  "success": true,
  "message": "Prescription created successfully",
  "data": {
    "id": "992e17d4-4b5d-4104-80f0-ac9b7dcc56ed",
    "consultation_id": "cf493787-6ec0-46b3-a536-eb7139b76e31",
    "medicine_name": "Azithromycin 500mg",
    "dosage": "1 Tablet Daily",
    "frequency": "Once a day after food",
    "duration": "5 days",
    "instructions": "Take with full glass of water. Do not skip doses.",
    "created_at": "2026-08-17T07:40:28.727Z"
  }
}
```

#### Error Response Examples

##### Doctor Authorization Violation (`403 Forbidden`)
```json
{
  "success": false,
  "message": "Forbidden. You are not authorized to create prescriptions for this consultation."
}
```

##### Missing Required Fields (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "medicine_name is required",
      "path": "medicine_name",
      "location": "body"
    }
  ]
}
```

---

### 2. Get Prescriptions for Consultation

Fetches all prescriptions associated with a specific consultation.

- **URL**: `/api/prescriptions/consultation/:consultationId`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `doctor` or `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Prescriptions retrieved successfully",
  "data": [
    {
      "id": "992e17d4-4b5d-4104-80f0-ac9b7dcc56ed",
      "consultation_id": "cf493787-6ec0-46b3-a536-eb7139b76e31",
      "medicine_name": "Azithromycin 500mg",
      "dosage": "1 Tablet Daily",
      "frequency": "Once a day after food",
      "duration": "5 days",
      "instructions": "Take with full glass of water. Do not skip doses.",
      "created_at": "2026-08-17T07:40:28.727Z"
    }
  ]
}
```

---

## Lab Order Endpoints

### 1. Create Lab Order

Creates a new lab order linked to an existing consultation, setting status to `pending` and unassigned (`laboratory_id = null`), while automatically updating the linked consultation's status to `awaiting_report`.

- **URL**: `/api/lab-orders`
- **Method**: `POST`
- **Auth Required**: `Yes` (Role: `doctor` who owns the consultation)
- **Headers**:
  ```http
  Authorization: Bearer <doctor_jwt_token>
  ```

#### Request Body Example
```json
{
  "consultation_id": "e005aa00-a3fc-4010-916a-e1b1b5db6067",
  "patient_id": "7d22dcaa-005b-438b-b644-517cc6129f85",
  "test_name": "Complete Blood Count (CBC) & Serum Electrolytes"
}
```

#### Success Response Example (`201 Created`)
```json
{
  "success": true,
  "message": "Lab order created successfully",
  "data": {
    "id": "73e75ce0-a2cd-4d3c-946d-96dfa6fe9b17",
    "consultation_id": "e005aa00-a3fc-4010-916a-e1b1b5db6067",
    "patient_id": "7d22dcaa-005b-438b-b644-517cc6129f85",
    "doctor_id": "c8ae826b-e626-4755-83c8-6a63ebd7f7a2",
    "laboratory_id": null,
    "test_name": "Complete Blood Count (CBC) & Serum Electrolytes",
    "status": "pending",
    "ordered_at": "2026-08-17T08:00:53.423Z",
    "updated_at": "2026-08-17T08:00:53.423Z"
  }
}
```

#### Error Response Examples

##### Doctor Authorization Error (`403 Forbidden`)
```json
{
  "success": false,
  "message": "Forbidden. You are not authorized to create lab orders for this consultation."
}
```

---

### 2. Get Pending Unassigned Lab Orders

Retrieves all lab orders across the system where `status = 'pending'` and `laboratory_id IS NULL`.

- **URL**: `/api/lab-orders/pending`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `laboratory` only)
- **Headers**:
  ```http
  Authorization: Bearer <laboratory_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Pending lab orders retrieved successfully",
  "data": [
    {
      "id": "73e75ce0-a2cd-4d3c-946d-96dfa6fe9b17",
      "consultation_id": "e005aa00-a3fc-4010-916a-e1b1b5db6067",
      "patient_id": "7d22dcaa-005b-438b-b644-517cc6129f85",
      "doctor_id": "c8ae826b-e626-4755-83c8-6a63ebd7f7a2",
      "laboratory_id": null,
      "test_name": "Complete Blood Count (CBC) & Serum Electrolytes",
      "status": "pending",
      "ordered_at": "2026-08-17T08:00:53.423Z",
      "updated_at": "2026-08-17T08:00:53.423Z"
    }
  ]
}
```

---

### 3. Accept Lab Order

Assigns a pending unassigned lab order to the requesting laboratory and updates its status to `in_progress`.

- **URL**: `/api/lab-orders/:id/accept`
- **Method**: `PATCH`
- **Auth Required**: `Yes` (Role: `laboratory` only)
- **Headers**:
  ```http
  Authorization: Bearer <laboratory_jwt_token>
  ```

#### Request Body Example
*(None - URL parameter target)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Lab order accepted successfully",
  "data": {
    "id": "73e75ce0-a2cd-4d3c-946d-96dfa6fe9b17",
    "consultation_id": "e005aa00-a3fc-4010-916a-e1b1b5db6067",
    "patient_id": "7d22dcaa-005b-438b-b644-517cc6129f85",
    "doctor_id": "c8ae826b-e626-4755-83c8-6a63ebd7f7a2",
    "laboratory_id": "6db1adf9-01e4-4bc6-a037-04c5aefc9139",
    "test_name": "Complete Blood Count (CBC) & Serum Electrolytes",
    "status": "in_progress",
    "ordered_at": "2026-08-17T08:00:53.423Z",
    "updated_at": "2026-08-17T08:01:01.213Z"
  }
}
```

#### Error Response Examples

##### Already Accepted or Assigned (`409 Conflict`)
```json
{
  "success": false,
  "message": "Conflict. This lab order has already been assigned to a laboratory or is no longer pending."
}
```

---

### 4. Get Laboratory Assigned Orders Queue

Retrieves all lab orders assigned to the requesting laboratory, ordered by `ordered_at` descending.

- **URL**: `/api/lab-orders/laboratory`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `laboratory` only)
- **Headers**:
  ```http
  Authorization: Bearer <laboratory_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Laboratory assigned orders retrieved successfully",
  "data": [
    {
      "id": "73e75ce0-a2cd-4d3c-946d-96dfa6fe9b17",
      "consultation_id": "e005aa00-a3fc-4010-916a-e1b1b5db6067",
      "patient_id": "7d22dcaa-005b-438b-b644-517cc6129f85",
      "doctor_id": "c8ae826b-e626-4755-83c8-6a63ebd7f7a2",
      "laboratory_id": "6db1adf9-01e4-4bc6-a037-04c5aefc9139",
      "test_name": "Complete Blood Count (CBC) & Serum Electrolytes",
      "status": "in_progress",
      "ordered_at": "2026-08-17T08:00:53.423Z",
      "updated_at": "2026-08-17T08:01:01.213Z"
    }
  ]
}
```

---

### 5. Get Lab Orders for Patient

Retrieves all lab orders associated with a specified patient ID.

- **URL**: `/api/lab-orders/patient/:patientId`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `doctor`, `laboratory`, or `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient lab orders retrieved successfully",
  "data": [
    {
      "id": "73e75ce0-a2cd-4d3c-946d-96dfa6fe9b17",
      "consultation_id": "e005aa00-a3fc-4010-916a-e1b1b5db6067",
      "patient_id": "7d22dcaa-005b-438b-b644-517cc6129f85",
      "doctor_id": "c8ae826b-e626-4755-83c8-6a63ebd7f7a2",
      "laboratory_id": "6db1adf9-01e4-4bc6-a037-04c5aefc9139",
      "test_name": "Complete Blood Count (CBC) & Serum Electrolytes",
      "status": "completed",
      "ordered_at": "2026-08-17T08:00:53.423Z",
      "updated_at": "2026-08-17T08:01:08.884Z"
    }
  ]
}
```

---

## Lab Report Endpoints

### 1. Upload Lab Report

Uploads a lab report file (PDF or image) to Supabase Storage via `multipart/form-data`, inserts a record in `lab_reports`, and updates the linked `lab_orders` status to `completed`.

- **URL**: `/api/lab-reports`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Auth Required**: `Yes` (Role: `laboratory` assigned to the order)
- **Headers**:
  ```http
  Authorization: Bearer <laboratory_jwt_token>
  Content-Type: multipart/form-data
  ```

#### Form Data Fields Example
- `lab_order_id`: `73e75ce0-a2cd-4d3c-946d-96dfa6fe9b17`
- `report_summary`: `Blood count within normal range. Hemoglobin 14.5 g/dL. No electrolyte abnormality detected.`
- `file`: `[File Attachment - PDF / JPEG / PNG]`

#### Success Response Example (`201 Created`)
```json
{
  "success": true,
  "message": "Lab report uploaded successfully",
  "data": {
    "id": "2a4bd62c-3b7c-4819-98d0-bd65d124a668",
    "lab_order_id": "73e75ce0-a2cd-4d3c-946d-96dfa6fe9b17",
    "report_file_url": "https://ghzojbnpdhbaxxjikscw.supabase.co/storage/v1/object/public/lab-reports/reports/1786953668438_CBC_Report_Suresh.pdf",
    "report_summary": "Blood count within normal range. Hemoglobin 14.5 g/dL. No electrolyte abnormality detected.",
    "uploaded_at": "2026-08-17T08:01:08.884Z"
  }
}
```

#### Error Response Examples

##### Duplicate Report Upload (`409 Conflict`)
```json
{
  "success": false,
  "message": "Conflict. A lab report has already been uploaded for this lab order."
}
```

##### Unauthorized Laboratory (`403 Forbidden`)
```json
{
  "success": false,
  "message": "Forbidden. You are not authorized to upload reports for this lab order."
}
```

---

### 2. Get Lab Report by Order ID

Retrieves the uploaded lab report associated with a specific lab order ID.

- **URL**: `/api/lab-reports/order/:labOrderId`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `doctor` who ordered it, `laboratory` who uploaded it, or `patient` it belongs to)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Lab report retrieved successfully",
  "data": {
    "id": "2a4bd62c-3b7c-4819-98d0-bd65d124a668",
    "lab_order_id": "73e75ce0-a2cd-4d3c-946d-96dfa6fe9b17",
    "report_file_url": "https://ghzojbnpdhbaxxjikscw.supabase.co/storage/v1/object/public/lab-reports/reports/1786953668438_CBC_Report_Suresh.pdf",
    "report_summary": "Blood count within normal range. Hemoglobin 14.5 g/dL. No electrolyte abnormality detected.",
    "uploaded_at": "2026-08-17T08:01:08.884Z"
  }
}
```

#### Error Response Examples

##### Unrelated User Access (`403 Forbidden`)
```json
{
  "success": false,
  "message": "Forbidden. You are not authorized to view this lab report."
}
```

---

## Notification Endpoints

### 1. Get User Notifications

Retrieves all notifications for the currently logged-in user, ordered by `created_at` descending.

- **URL**: `/api/notifications`
- **Method**: `GET`
- **Auth Required**: `Yes` (Any authenticated user)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "User notifications retrieved successfully",
  "data": [
    {
      "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01",
      "user_id": "11111111-1111-1111-1111-111111111102",
      "title": "Lab Report Ready",
      "message": "ECG report for Sunita Devi is now available.",
      "type": "report_ready",
      "is_read": false,
      "created_at": "2026-08-16T14:31:09.423918"
    },
    {
      "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02",
      "user_id": "11111111-1111-1111-1111-111111111102",
      "title": "Drug Interaction Alert",
      "message": "Potential interaction flagged for Sunita Devi's prescription.",
      "type": "drug_alert",
      "is_read": false,
      "created_at": "2026-08-16T14:31:09.423918"
    }
  ]
}
```

---

### 2. Mark Notification as Read

Marks a specific notification as read. Enforces that the notification belongs to the authenticated user.

- **URL**: `/api/notifications/:id/read`
- **Method**: `PATCH`
- **Auth Required**: `Yes` (Owner of the notification only)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01",
    "user_id": "11111111-1111-1111-1111-111111111102",
    "title": "Lab Report Ready",
    "message": "ECG report for Sunita Devi is now available.",
    "type": "report_ready",
    "is_read": true,
    "created_at": "2026-08-16T14:31:09.423918"
  }
}
```

#### Error Response Examples

##### Accessing Someone Else's Notification (`403 Forbidden`)
```json
{
  "success": false,
  "message": "Forbidden. You are not authorized to access this notification."
}
```

---

## Patient Self-Service Endpoints

### 1. Get My Profile

Retrieves the logged-in patient's own full profile.

- **URL**: `/api/patients/me`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient profile retrieved successfully",
  "data": {
    "id": "44444444-4444-4444-4444-444444444401",
    "user_id": "11111111-1111-1111-1111-111111111105",
    "health_id": "12345678901234",
    "full_name": "Ramesh Kumar",
    "date_of_birth": "1985-04-12",
    "gender": "male",
    "blood_group": "B+",
    "address": "Sector 5, Godhra, Gujarat",
    "emergency_contact": "9111111111",
    "created_at": "2026-08-16T14:31:09.423918"
  }
}
```

#### Error Response Examples

##### Unauthorized Access (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Access denied. Authorization header with Bearer token is required."
}
```

##### Role Restriction (`403 Forbidden`)
```json
{
  "success": false,
  "message": "Access denied. Role 'doctor' is not authorized to access this resource."
}
```

---

### 2. Get My Consultations

Retrieves all consultations for the logged-in patient, ordered by consultation date descending.

- **URL**: `/api/patients/me/consultations`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient consultations retrieved successfully",
  "data": [
    {
      "id": "55555555-5555-5555-5555-555555555501",
      "patient_id": "44444444-4444-4444-4444-444444444401",
      "doctor_id": "22222222-2222-2222-2222-222222222201",
      "consultation_date": "2026-08-13T14:31:09.423918",
      "symptoms": "Fever, body ache, fatigue",
      "doctor_notes": "Patient reports fever since 2 days, no other major symptoms.",
      "probable_diagnosis": "Viral Fever",
      "confirmed_diagnosis": "Viral Fever",
      "status": "completed",
      "created_at": "2026-08-16T14:31:09.423918"
    }
  ]
}
```

---

### 3. Get My Prescriptions

Retrieves all prescriptions associated with the logged-in patient's consultations.

- **URL**: `/api/patients/me/prescriptions`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient prescriptions retrieved successfully",
  "data": [
    {
      "id": "66666666-6666-6666-6666-666666666601",
      "consultation_id": "55555555-5555-5555-5555-555555555501",
      "medicine_name": "Paracetamol",
      "dosage": "650mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instructions": "Take after food",
      "created_at": "2026-08-16T14:31:09.423918"
    },
    {
      "id": "66666666-6666-6666-6666-666666666602",
      "consultation_id": "55555555-5555-5555-5555-555555555501",
      "medicine_name": "Cetirizine",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "3 days",
      "instructions": "Take at night",
      "created_at": "2026-08-16T14:31:09.423918"
    }
  ]
}
```

---

### 4. Get My Lab Orders

Retrieves all lab orders created for the logged-in patient.

- **URL**: `/api/patients/me/lab-orders`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient lab orders retrieved successfully",
  "data": []
}
```

---

### 5. Get My Lab Reports

Retrieves all lab reports associated with the logged-in patient's lab orders.

- **URL**: `/api/patients/me/lab-reports`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient lab reports retrieved successfully",
  "data": []
}
```

---

### 6. Get My Chronic Conditions

Retrieves all chronic conditions recorded for the logged-in patient.

- **URL**: `/api/patients/me/chronic-conditions`
- **Method**: `GET`
- **Auth Required**: `Yes` (Role: `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

#### Request Body Example
*(None - GET request)*

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Patient chronic conditions retrieved successfully",
  "data": [
    {
      "id": "99999999-9999-9999-9999-999999999902",
      "patient_id": "44444444-4444-4444-4444-444444444401",
      "condition_name": "Type 2 Diabetes",
      "diagnosed_date": "2020-03-10",
      "status": "managed",
      "notes": "Well controlled with diet and Metformin"
    }
  ]
}
```

---

## AI Endpoints

### 1. Scan Prescription

Parses and explains a prescription image upload using Gemini AI.

- **URL**: `/api/ai/scan-prescription`
- **Method**: `POST`
- **Auth Required**: `Yes` (Role: `patient`)
- **Headers**:
  ```http
  Authorization: Bearer <your_jwt_token>
  Content-Type: multipart/form-data
  ```

#### Request Body (Multipart Form-Data)

- `file`: The prescription image file (JPEG, PNG, JPG, or WEBP).

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Prescription scanned and parsed successfully",
  "data": {
    "medicines": [
      {
        "name": "Augmentin",
        "dosage": "625mg",
        "frequency": "1-0-1",
        "instructions": "Take one tablet in the morning and one in the evening after meals for 5 days."
      },
      {
        "name": "Enzoflam",
        "dosage": "unclear",
        "frequency": "1-0-1",
        "instructions": "Take one tablet in the morning and one in the evening after meals for 5 days."
      },
      {
        "name": "Pan D",
        "dosage": "40mg",
        "frequency": "1-0-0",
        "instructions": "Take one tablet in the morning before meals for 5 days."
      },
      {
        "name": "Hexigel gum paint",
        "dosage": "unclear",
        "frequency": "1-0-1",
        "instructions": "Apply and massage twice daily (morning and evening) for 1 week."
      }
    ],
    "explanation": "This prescription is for Mr. Sachin Sansare, 28 years old, dated 12/10/22. It includes Augmentin 625mg to be taken twice daily after meals for 5 days. Enzoflam, with an unclear dosage, is also to be taken twice daily after meals for 5 days. Pan D 40mg should be taken once daily in the morning before meals for 5 days. Additionally, Hexigel gum paint is prescribed for topical application with massage twice daily for 1 week.",
    "disclaimer": "This is AI-assisted reading and not a medical confirmation. Please verify with your doctor or pharmacist."
  }
}
```

#### Error Response Examples

##### Invalid File Type (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF and image files (JPEG, PNG, WEBP) are allowed."
}
```

##### Missing File (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Please upload a prescription image file."
}
```

---

### 2. Check Drug Interaction

Analyzes potential clinical conflicts between a new prescription, the patient's existing chronic conditions, and other active prescriptions. If a clinically significant interaction is found, it automatically creates a drug interaction flag in the database, generates a high-priority notification alert for the doctor, and records an audit log entry.

- **URL**: `/api/ai/check-interaction`
- **Method**: `POST`
- **Auth Required**: `Yes` (Role: `doctor` only)
- **Headers**:
  ```http
  Authorization: Bearer <doctor_jwt_token>
  ```

#### Request Body
```json
{
  "prescription_id": "66666666-6666-6666-6666-666666666601"
}
```

#### Success Response Example - No Interaction (`200 OK`)
```json
{
  "success": true,
  "message": "No drug interaction found",
  "data": {
    "interaction": {
      "hasInteraction": false,
      "conflictingWith": "",
      "severity": "low",
      "explanation": "No clinically significant interactions were found between Paracetamol 650mg and the patient's Type 2 Diabetes or Cetirizine 10mg."
    },
    "flag": null
  }
}
```

#### Success Response Example - Interaction Detected (`200 OK`)
```json
{
  "success": true,
  "message": "Potential drug interaction detected!",
  "data": {
    "interaction": {
      "hasInteraction": true,
      "conflictingWith": "Existing Diabetes medication (Metformin)",
      "severity": "moderate",
      "explanation": "Amlodipine combined with Metformin may cause mild blood sugar fluctuations. Monitor glucose levels closely during the first week of co-administration."
    },
    "flag": {
      "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01",
      "prescription_id": "66666666-6666-6666-6666-666666666603",
      "conflicting_with": "Existing Diabetes medication (Metformin)",
      "severity": "moderate",
      "ai_explanation": "Amlodipine combined with Metformin may cause mild blood sugar fluctuations. Monitor glucose levels closely during the first week of co-administration.",
      "acknowledged_by_doctor": false,
      "created_at": "2026-08-16T14:31:09.423918"
    }
  }
}
```

#### Error Response Examples

##### Prescription Not Found (`404 Not Found`)
```json
{
  "success": false,
  "message": "Prescription not found"
}
```

---

### 3. Acknowledge Drug Interaction Flag

Allows a doctor to acknowledge a previously generated drug interaction flag.

- **URL**: `/api/drug-interaction-flags/:id/acknowledge`
- **Method**: `PATCH`
- **Auth Required**: `Yes` (Role: `doctor` only)
- **Headers**:
  ```http
  Authorization: Bearer <doctor_jwt_token>
  ```

#### Success Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Drug interaction flag acknowledged by doctor",
  "data": {
    "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01",
    "prescription_id": "66666666-6666-6666-6666-666666666603",
    "conflicting_with": "Existing Diabetes medication (Metformin)",
    "severity": "moderate",
    "ai_explanation": "Amlodipine combined with Metformin may cause mild blood sugar fluctuations. Monitor glucose levels closely during the first week of co-administration.",
    "acknowledged_by_doctor": true,
    "created_at": "2026-08-16T14:31:09.423918"
  }
}
```

#### Error Response Examples

##### Flag Not Found (`404 Not Found`)
```json
{
  "success": false,
  "message": "Drug interaction flag not found"
}
```

