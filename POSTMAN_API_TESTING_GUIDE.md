# EDRMS Backend v1 — Postman API Testing Guide

This document contains a complete list of all API endpoints in the EDRMS (Emergency Disaster Response Management System) backend. Every endpoint includes its full URL (`http://localhost:3000/...`), HTTP method, required authorization headers, request payloads (JSON body or Multipart form-data), query parameters, and example response envelopes for Postman testing.

---

##  Base Server Configuration
- **Base URL:** `http://localhost:3000`
- **Swagger Documentation URL:** `http://localhost:3000/api/docs`

### Standard Response Envelope Format
All endpoints wrap successful responses using the unified `ResponseEnvelope` interceptor structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

## Table of Contents
1. [Authentication & Auth Tokens (`/auth`)](#1-authentication--auth-tokens-auth)
2. [User Profile & Safety (`/users`)](#2-user-profile--safety-users)
3. [Relief Organizations (`/relief-org`)](#3-relief-organizations-relief-org)
4. [Disaster Alerts (`/disaster`)](#4-disaster-alerts-disaster)
5. [Shelters (`/shelter`)](#5-shelters-shelter)
6. [Rescue Requests (`/rescue-requests`)](#6-rescue-requests-rescue-requests)
7. [Volunteer Management & Tasks (`/volunteers`)](#7-volunteer-management--tasks-volunteers)
8. [Missing Persons (`/missing-persons`)](#8-missing-persons-missing-persons)
9. [Donations & Financial Aid (`/donations`)](#9-donations--financial-aid-donations)
10. [Community Posts & Interaction (`/community-posts`)](#10-community-posts--interaction-community-posts)
11. [Admin Management & Database (`/admin`)](#11-admin-management--database-admin)
12. [App Health Check (`/`)](#12-app-health-check-)

---

## 1. Authentication & Auth Tokens (`/auth`)

### 1.1 Register User
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/auth/register-user`
- **Headers:** `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "name": "Ahmad Zubayer",
  "email": "ahmadzubayer@example.com",
  "phoneNumber": "+8801712345678",
  "password": "Password@123",
  "address": {
    "house": "House 12, Road 4",
    "city": "Dhaka",
    "district": "Dhaka",
    "country": "Bangladesh"
  }
}
```
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "id": "e4b5a260-1234-4567-89ab-cdef01234567",
    "email": "ahmadzubayer@example.com",
    "role": "user"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 1.2 Verify Email
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/auth/verify-email?token=YOUR_VERIFICATION_TOKEN_HERE`
- **Query Params:** `token=YOUR_VERIFICATION_TOKEN_HERE`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": {
    "verified": true
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 1.3 Sign In (Login)
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/auth/sign-in`
- **Headers:** `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "email": "ahmadzubayer@example.com",
  "password": "Password@123"
}
```
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User signed in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e4b5a260-1234-4567-89ab-cdef01234567",
      "email": "ahmadzubayer@example.com",
      "role": "user"
    }
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 1.4 Refresh Token
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/auth/refresh-token`
- **Headers:** 
  - `Authorization: Bearer <YOUR_REFRESH_TOKEN>`
- **Request Body:** None
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

## 2. User Profile & Safety (`/users`)

### 2.1 Update User Profile
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/users/update-profile`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data` (or `application/json` if no file)
- **Body (form-data or JSON):**
  - `name`: "Ahmad Zubayer"
  - `phone`: "+8801712345679"
  - `emergency_message`: "Safe at Dhaka camp."
  - `medical_information`: "Blood Group O+"
  - `file`: *(Optional upload file/avatar)*
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile updated successfully",
  "data": {
    "id": "e4b5a260-1234-4567-89ab-cdef01234567",
    "name": "Ahmad Zubayer",
    "phone": "+8801712345679",
    "emergency_message": "Safe at Dhaka camp."
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 2.2 Complete Profile
- **Method:** `PUT`
- **Full URL:** `http://localhost:3000/users/complete-profile`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data` (or `application/json`)
- **Body (form-data or JSON):**
  - `gps_lat`: `23.8103`
  - `gps_lng`: `90.4125`
  - `emergency_message`: "Require shelter near Mirpur."
  - `medical_information`: "Asthma patient"
  - `file`: *(Optional profile picture file)*
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile completed successfully",
  "data": {
    "id": "e4b5a260-1234-4567-89ab-cdef01234567",
    "gps_lat": 23.8103,
    "gps_lng": 90.4125,
    "medical_information": "Asthma patient"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 2.3 Toggle Safety Status (`is_safe`)
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/users/is-safe`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Request Body:** None
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Safety status updated successfully",
  "data": {
    "is_safe": true
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

## 3. Relief Organizations (`/relief-org`)

### 3.1 Sign Up / Apply as Relief Organization
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/relief-org/sign-up-as-relief-org`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Body (form-data):**
  - `organization_name`: "Red Cross Bangladesh"
  - `registration_number`: "REG-NGO-2026-101"
  - `address`: "House 12, Road 5, Dhanmondi, Dhaka"
  - `website`: "https://redcross.org.bd"
  - `description`: "Providing emergency relief and shelter services."
  - `organization_type`: "NGO"
  - `verification_doc`: *(PDF document file required)*
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Relief organization sign up request submitted successfully",
  "data": {
    "id": "a9876543-e21b-12d3-a456-426614174000",
    "organization_name": "Red Cross Bangladesh",
    "admin_verified": false
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 3.2 Verify Relief Organization *(Admin Only)*
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/relief-org/:id/verify`
- **Headers:**
  - `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Path Params:** `id`: Organization UUID
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Relief organization verified successfully and account role updated",
  "data": {
    "id": "a9876543-e21b-12d3-a456-426614174000",
    "admin_verified": true
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 3.3 Get My Relief Organization Profile
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/relief-org/profile/me`
- **Headers:**
  - `Authorization: Bearer <RELIEF_ORG_ACCESS_TOKEN>`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Relief organization profile retrieved successfully",
  "data": {
    "id": "a9876543-e21b-12d3-a456-426614174000",
    "organization_name": "Red Cross Bangladesh",
    "admin_verified": true
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 3.4 Get All Relief Organizations
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/relief-org`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Relief organizations retrieved successfully",
  "data": [
    {
      "id": "a9876543-e21b-12d3-a456-426614174000",
      "organization_name": "Red Cross Bangladesh",
      "admin_verified": true
    }
  ],
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 3.5 Get Relief Organization by ID
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/relief-org/:id`
- **Path Params:** `id`: Organization UUID
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Relief organization details retrieved successfully",
  "data": {
    "id": "a9876543-e21b-12d3-a456-426614174000",
    "organization_name": "Red Cross Bangladesh",
    "registration_number": "REG-NGO-2026-101",
    "admin_verified": true
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

## 4. Disaster Alerts (`/disaster`)

### 4.1 Create Disaster Alert *(Relief Org Only)*
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/disaster`
- **Headers:**
  - `Authorization: Bearer <RELIEF_ORG_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "disasterName": "Sylhet Flash Flood 2026",
  "impactedLocation": "Sylhet Sadar, Sunamganj",
  "impactTime": "2026-07-28T06:00:00.000Z",
  "type": "flood"
}
```
*Allowed `type` values:* `cyclone`, `flood`, `tsunami`, `heatwave`, `wildfire`

- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Disaster alert created successfully",
  "data": {
    "id": "b1112223-3344-5566-7788-99aabbccdd00",
    "disaster_name": "Sylhet Flash Flood 2026",
    "impacted_location": "Sylhet Sadar, Sunamganj",
    "type": "flood"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

## 5. Shelters (`/shelter`)

### 5.1 Create Shelter *(Relief Org / Admin Only)*
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/shelter`
- **Headers:**
  - `Authorization: Bearer <RELIEF_ORG_OR_ADMIN_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "shelter_name": "Mirpur Central Relief Camp",
  "shelter_location": "Mirpur Stadium, Section 10, Dhaka",
  "shelter_capacity": 500,
  "current_people_count": 45,
  "disaster_id": "b1112223-3344-5566-7788-99aabbccdd00"
}
```
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Shelter created successfully",
  "data": {
    "id": "c1234567-89ab-cdef-0123-456789abcdef",
    "shelter_name": "Mirpur Central Relief Camp",
    "shelter_capacity": 500,
    "current_people_count": 45
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 5.2 Get All Shelters
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/shelter`
- **Query Params (Optional):** `disasterId=b1112223-3344-5566-7788-99aabbccdd00`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Shelters retrieved successfully",
  "data": [
    {
      "id": "c1234567-89ab-cdef-0123-456789abcdef",
      "shelter_name": "Mirpur Central Relief Camp",
      "shelter_location": "Mirpur Stadium, Section 10, Dhaka",
      "shelter_capacity": 500,
      "current_people_count": 45
    }
  ],
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 5.3 Get Shelter by ID
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/shelter/:id`
- **Path Params:** `id`: Shelter UUID
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Shelter details retrieved successfully",
  "data": {
    "id": "c1234567-89ab-cdef-0123-456789abcdef",
    "shelter_name": "Mirpur Central Relief Camp",
    "shelter_capacity": 500,
    "current_people_count": 45
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 5.4 Update Shelter *(Relief Org / Admin Only)*
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/shelter/:id`
- **Headers:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "shelter_capacity": 600,
  "current_people_count": 120
}
```
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Shelter updated successfully",
  "data": {
    "id": "c1234567-89ab-cdef-0123-456789abcdef",
    "shelter_capacity": 600,
    "current_people_count": 120
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 5.5 Delete Shelter *(Relief Org / Admin Only)*
- **Method:** `DELETE`
- **Full URL:** `http://localhost:3000/shelter/:id`
- **Headers:**
  - `Authorization: Bearer <ACCESS_TOKEN>`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Shelter deleted successfully",
  "data": null,
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

## 6. Rescue Requests (`/rescue-requests`)

### 6.1 Create Rescue Request
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/rescue-requests`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data` (or `application/json`)
- **Body (form-data or JSON):**
  - `latitude`: `24.8949`
  - `longitude`: `91.8687`
  - `description`: "Water level rising rapidly, 5 people stuck on rooftop."
  - `contact_phone`: "+8801812345678"
  - `address`: "Kazir Bazar, Sylhet"
  - `people_count`: `5`
  - `urgency_level`: "CRITICAL" *(Allowed: LOW, MEDIUM, HIGH, CRITICAL)*
  - `medical_notes`: "One elderly person needs insulin."
  - `file`: *(Optional image file)*
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Rescue request created successfully",
  "data": {
    "id": "d9876543-210a-4b98-8765-43210fedcba9",
    "latitude": 24.8949,
    "longitude": 91.8687,
    "people_count": 5,
    "urgency_level": "CRITICAL",
    "status": "PENDING"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 6.2 Get My Rescue Requests
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/rescue-requests/my`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User rescue requests retrieved successfully",
  "data": [
    {
      "id": "d9876543-210a-4b98-8765-43210fedcba9",
      "description": "Water level rising rapidly...",
      "status": "PENDING"
    }
  ],
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 6.3 Get All Rescue Requests
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/rescue-requests`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rescue requests retrieved successfully",
  "data": [ ... ],
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 6.4 Get Rescue Request Details
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/rescue-requests/:id`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Path Params:** `id`: Rescue Request UUID
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rescue request details retrieved successfully",
  "data": {
    "id": "d9876543-210a-4b98-8765-43210fedcba9",
    "latitude": 24.8949,
    "longitude": 91.8687,
    "status": "PENDING"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 6.5 Update Rescue Request Status
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/rescue-requests/:id/status`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "status": "IN_PROGRESS",
  "assigned_rescuer_id": "vol-1234-uuid"
}
```
*Allowed `status` values:* `PENDING`, `ACKNOWLEDGED`, `DISPATCHED`, `IN_PROGRESS`, `RESCUED`, `CANCELLED`

- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rescue request status updated successfully",
  "data": {
    "id": "d9876543-210a-4b98-8765-43210fedcba9",
    "status": "IN_PROGRESS"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 6.6 Cancel My Rescue Request
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/rescue-requests/:id/cancel`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rescue request cancelled successfully",
  "data": {
    "id": "d9876543-210a-4b98-8765-43210fedcba9",
    "status": "CANCELLED"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

## 7. Volunteer Management & Tasks (`/volunteers`)

### 7.1 Register as Volunteer
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/register`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data` (or `application/json`)
- **Body (form-data or JSON):**
  - `skills`: `["first_aid", "flood_rescue"]`
  - `why_join`: "Want to support disaster victims with emergency first aid."
  - `available`: `true`
  - `file`: *(Optional verification document/ID image)*
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Volunteer registered successfully",
  "data": {
    "id": "v9998887-7766-5544-3322-1100aabbccdd",
    "skills": ["first_aid", "flood_rescue"],
    "verification_status": "not_applied"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 7.2 Get My Volunteer Profile
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/volunteers/me`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Volunteer profile retrieved successfully",
  "data": {
    "id": "v9998887-7766-5544-3322-1100aabbccdd",
    "skills": ["first_aid", "flood_rescue"],
    "available": true,
    "on_duty": false
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 7.3 Update Volunteer Profile
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/volunteers/me`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "skills": ["first_aid", "flood_rescue", "food_distribution"],
  "available": true
}
```

---

### 7.4 Apply for Volunteer Verification
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/verification/apply`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data`
- **Body (form-data):**
  - `file`: *(NID / Student ID / Certificate document)*
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Verification application submitted successfully",
  "data": {
    "verification_status": "pending"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 7.5 Review Volunteer Verification Status *(Admin Only)*
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/volunteers/:id/verification`
- **Headers:**
  - `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "status": "verified"
}
```
*Allowed `status` values:* `verified`, `rejected`, `pending`

---

### 7.6 Update Duty Location & On-Duty Status
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/volunteers/duty/location`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "latitude": 24.8949,
  "longitude": 91.8687,
  "on_duty": true
}
```

---

### 7.7 Get Nearby Rescue Requests
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/volunteers/rescue-requests/nearby?radius=25`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Query Params:** `radius` (in km, default 25)

---

### 7.8 Accept Rescue Task
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/rescue-tasks/:requestId/accept`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Path Params:** `requestId`: Rescue Request UUID

---

### 7.9 Reject Rescue Task
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/rescue-tasks/:requestId/reject`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 7.10 Get My Assigned Rescue Tasks
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/volunteers/rescue-tasks/my`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 7.11 Update Task Progress
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/volunteers/rescue-tasks/:taskId/progress`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "notes": "Reached team at spot. Preparing rescue boat."
}
```

---

### 7.12 Complete Rescue Task
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/volunteers/rescue-tasks/:taskId/complete`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 7.13 Report Route Condition
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/field-reports/routes`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "report_type": "blocked_route",
  "description": "Bridge washed out near Sylhet highway.",
  "latitude": 24.8900,
  "longitude": 91.8600,
  "address": "Sylhet Bypass Highway",
  "severity": "critical"
}
```
*Allowed `report_type`:* `blocked_route`, `dangerous_route`
*Allowed `severity`:* `low`, `medium`, `high`, `critical`

---

### 7.14 Report Resource Shortage
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/field-reports/shortages`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "resource_name": "Clean Drinking Water",
  "quantity_needed": 100,
  "description": "Shelter short of drinking water bottles.",
  "latitude": 24.8949,
  "longitude": 91.8687,
  "address": "Mirpur Camp",
  "severity": "high"
}
```

---

### 7.15 Get My Field Reports
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/volunteers/field-reports/my`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 7.16 Create Organization Volunteer Request *(Relief Org / Admin Only)*
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/organization-requests`
- **Headers:**
  - `Authorization: Bearer <RELIEF_ORG_OR_ADMIN_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "title": "Need 10 Medical Volunteers in Sylhet",
  "description": "Assisting flood victims with first aid and medicine distribution.",
  "required_skills": ["first_aid", "medical_assistance"],
  "location": "Sylhet Sadar Relief Center",
  "needed_volunteers": 10
}
```

---

### 7.17 Get Open Organization Requests
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/volunteers/organization-requests`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 7.18 Join Organization Request
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/organization-requests/:id/join`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 7.19 Get My Organization Request Joins
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/volunteers/organization-requests/my/joins`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 7.20 Join Rescue Group
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/rescue-groups/:id/join`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "notes": "I have speed boat experience."
}
```

---

### 7.21 Join Missing Person Search Group
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/volunteers/missing-person-groups/:id/join`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "notes": "Available for local neighborhood search."
}
```

---

### 7.22 Get My Group Joins
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/volunteers/group-joins/my`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

## 8. Missing Persons (`/missing-persons`)

### 8.1 Report Missing Person
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/missing-persons`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data` (or `application/json`)
- **Body (form-data or JSON):**
  - `full_name`: "Rahim Uddin"
  - `age`: `35`
  - `gender`: "Male"
  - `last_seen_location`: "Sunamganj Market"
  - `last_seen_date`: "2026-07-27"
  - `description`: "Wearing blue shirt and black pants during flood evacuation."
  - `contact_phone`: "+8801912345678"
  - `file`: *(Optional photograph)*
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Missing person report created successfully",
  "data": {
    "id": "e8877665-5544-3322-1100-aabbccddeeff",
    "full_name": "Rahim Uddin",
    "status": "MISSING"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 8.2 Get My Reported Missing Persons
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/missing-persons/my`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 8.3 Get All Missing Person Reports
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/missing-persons`
- **Query Params (Optional):**
  - `status=MISSING` *(Allowed: MISSING, FOUND, RESOLVED, CLOSED)*
  - `search=Rahim`

---

### 8.4 Get Missing Person Details by ID
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/missing-persons/:id`

---

### 8.5 Update Missing Person Report
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/missing-persons/:id`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data` (or `application/json`)
- **Body:**
  - `description`: "Updated info: Last seen near medical shelter."

---

### 8.6 Update Missing Person Status
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/missing-persons/:id/status`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "status": "FOUND"
}
```

---

### 8.7 Delete Missing Person Report
- **Method:** `DELETE`
- **Full URL:** `http://localhost:3000/missing-persons/:id`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

## 9. Donations & Financial Aid (`/donations`)

### 9.1 Get All Donation Campaigns
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/donations/campaigns`

---

### 9.2 Get Donation Campaign Details
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/donations/campaigns/:id`

---

### 9.3 Initiate Donation Payment (Stripe Checkout)
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/donations/campaigns/:id/donate`
- **Headers:** `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "amount": 1000,
  "payment_gateway": "stripe",
  "is_anonymous": false,
  "donor_name": "Ahmad Zubayer",
  "donor_email": "ahmadzubayer@example.com"
}
```
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Donation session created successfully",
  "data": {
    "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6...",
    "transaction_id": "tx_9988776655"
  },
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```

---

### 9.4 Payment Success Webhook/Callback
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/donations/payment/success?session_id=cs_test_123&tx_id=tx_9988776655`
- **Query Params:** `session_id`, `tx_id`

---

### 9.5 Payment Cancel Callback
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/donations/payment/cancel?tx_id=tx_9988776655`
- **Query Params:** `tx_id`

---

### 9.6 Apply for Financial Aid
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/donations/campaigns/:id/apply`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "reason": "Home destroyed by Sylhet flood, urgently need emergency financial assistance.",
  "payout_details": "bKash: +8801700000000 (Personal)",
  "proof_document_url": "https://storage.example.com/proof.jpg"
}
```

---

### 9.7 Get My Aid Applications
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/donations/my-applications`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 9.8 Get All Aid Applications *(Relief Org / Admin Only)*
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/donations/applications`
- **Headers:**
  - `Authorization: Bearer <RELIEF_ORG_OR_ADMIN_TOKEN>`

---

### 9.9 Review Aid Application *(Relief Org / Admin Only)*
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/donations/applications/:id/review`
- **Headers:**
  - `Authorization: Bearer <RELIEF_ORG_OR_ADMIN_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "status": "APPROVED",
  "approved_amount": 15000
}
```
*Allowed `status` values:* `APPROVED`, `REJECTED`

---

## 10. Community Posts & Interaction (`/community-posts`)

### 10.1 Get All Community Posts
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/community-posts`
- **Query Params (Optional):**
  - `search=flood`
  - `sort=desc` *(Allowed: asc, desc)*
  - `userId=e4b5a260-1234-4567-89ab-cdef01234567`

---

### 10.2 Get Single Post Details
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/community-posts/:id`
- **Query Params (Optional):** `userId=e4b5a260-1234-4567-89ab-cdef01234567`

---

### 10.3 Get Comments for Post
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/community-posts/:id/comments`

---

### 10.4 Create Community Post
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/community-posts`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data` (or `application/json`)
- **Body (form-data or JSON):**
  - `title`: "Emergency Relief Center established at Mirpur Stadium"
  - `body`: "Free food and medical supplies are available starting 9:00 AM."
  - `files`: *(Optional attached images/documents)*

---

### 10.5 Update Community Post
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/community-posts/:id`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: multipart/form-data` (or `application/json`)

---

### 10.6 Update Post Status *(Author or Admin)*
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/community-posts/:id/status`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "status": "ARCHIVED"
}
```

---

### 10.7 Bump Post
- **Method:** `PATCH`
- **Full URL:** `http://localhost:3000/community-posts/:id/bump`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 10.8 Delete Post
- **Method:** `DELETE`
- **Full URL:** `http://localhost:3000/community-posts/:id`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 10.9 React to Post
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/community-posts/:id/react`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "type": "LIKE"
}
```
*Allowed `type` values:* `LIKE`, `UPVOTE`, `DOWNVOTE`, `DISLIKE`

---

### 10.10 Add Comment to Post
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/community-posts/:id/comments`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "content": "Thank you for updating! Are volunteers needed on site?"
}
```

---

### 10.11 Delete Comment
- **Method:** `DELETE`
- **Full URL:** `http://localhost:3000/community-posts/:id/comments/:commentId`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

### 10.12 Report Post
- **Method:** `POST`
- **Full URL:** `http://localhost:3000/community-posts/:id/report`
- **Headers:**
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Request Body (JSON):**
```json
{
  "reason": "Contains misleading location information."
}
```

---

## 11. Admin Management & Database (`/admin`)

> ⚠️ All routes in this section require an Admin Bearer Token (`Authorization: Bearer <ADMIN_ACCESS_TOKEN>`).

### 11.1 View Volunteer Verification Requests
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/volunteer-verification-requests`

---

### 11.2 View Relief Org Verification Requests
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/relief-org-verification-requests`

---

### 11.3 Change User Role to Volunteer
- **Method:** `PATCH` (or `POST`)
- **Full URL:** `http://localhost:3000/admin/change-role/volunteer/:userId`
- **Path Params:** `userId`: Target User UUID

---

### 11.4 Change User Role to Relief Org & Verify
- **Method:** `PATCH` (or `POST`)
- **Full URL:** `http://localhost:3000/admin/change-role/relief-org/:userId`
- **Path Params:** `userId`: Target User UUID

---

### 11.5 Change User Role to Admin
- **Method:** `PATCH` (or `POST`)
- **Full URL:** `http://localhost:3000/admin/change-role/admin/:userId`
- **Path Params:** `userId`: Target User UUID

---

### 11.6 View All Database Tables & Row Counts
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/tables`

---

### 11.7 View Specific Database Table Records
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/tables/:tableName`
- **Path Params:** `tableName`: Table name (e.g. `users`, `rescue_requests`, `disasters`)

---

### 11.8 Get All Registered Users
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/users`

---

### 11.9 Get All Volunteers
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/volunteers`

---

### 11.10 Get All Relief Organizations
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/relief-orgs`

---

### 11.11 Get All Disasters
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/disasters`

---

### 11.12 Get All Shelters
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/shelters`

---

### 11.13 Get All Rescue Requests
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/rescue-requests`

---

### 11.14 Get All Missing Persons
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/missing-persons`

---

### 11.15 Get All Campaigns
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/campaigns`

---

### 11.16 Get All Community Posts
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/admin/community-posts`

---

## 12. App Health Check (`/`)

### 12.1 Root Application Health Check
- **Method:** `GET`
- **Full URL:** `http://localhost:3000/`
- **Response Body:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application is running successfully",
  "data": "Hello World!",
  "timestamp": "2026-07-28T11:18:54.000Z"
}
```
