const fs = require('fs');
const path = require('path');

const collection = {
  info: {
    name: "EDRMS Backend v1 — API Test Collection",
    _postman_id: "edrms-backend-v1-collection-id",
    description: "Complete Postman API test collection for EDRMS (Emergency Disaster Response Management System) backend. Includes all endpoints for auth, users, relief orgs, shelters, disasters, rescue requests, volunteers, missing persons, donations, community posts, and admin management.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    {
      name: "01. Authentication & Auth Tokens",
      item: [
        {
          name: "Register User",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Ahmad Zubayer",
                email: "ahmadzubayer@example.com",
                phoneNumber: "+8801712345678",
                password: "Password@123",
                address: {
                  house: "House 12, Road 4",
                  city: "Dhaka",
                  district: "Dhaka",
                  country: "Bangladesh"
                }
              }, null, 2)
            },
            url: { raw: "{{base_url}}/auth/register-user", host: ["{{base_url}}"], path: ["auth", "register-user"] }
          }
        },
        {
          name: "Verify Email",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/auth/verify-email?token={{email_verification_token}}",
              host: ["{{base_url}}"],
              path: ["auth", "verify-email"],
              query: [{ key: "token", value: "{{email_verification_token}}" }]
            }
          }
        },
        {
          name: "Sign In (User)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    if (jsonData.data && jsonData.data.access_token) {",
                  "        pm.environment.set('access_token', jsonData.data.access_token);",
                  "        pm.environment.set('refresh_token', jsonData.data.refresh_token);",
                  "        console.log('Access token saved to environment.');",
                  "    }",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "ahmadzubayer@example.com",
                password: "Password@123"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/auth/sign-in", host: ["{{base_url}}"], path: ["auth", "sign-in"] }
          }
        },
        {
          name: "Sign In (Admin)",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    if (jsonData.data && jsonData.data.access_token) {",
                  "        pm.environment.set('admin_access_token', jsonData.data.access_token);",
                  "        console.log('Admin access token saved to environment.');",
                  "    }",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "admin@edrms.com",
                password: "Admin@1234"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/auth/sign-in", host: ["{{base_url}}"], path: ["auth", "sign-in"] }
          }
        },
        {
          name: "Refresh Token",
          event: [
            {
              listen: "test",
              script: {
                type: "text/javascript",
                exec: [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    if (jsonData.data && jsonData.data.access_token) {",
                  "        pm.environment.set('access_token', jsonData.data.access_token);",
                  "        pm.environment.set('refresh_token', jsonData.data.refresh_token);",
                  "    }",
                  "}"
                ]
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{refresh_token}}" }],
            url: { raw: "{{base_url}}/auth/refresh-token", host: ["{{base_url}}"], path: ["auth", "refresh-token"] }
          }
        }
      ]
    },
    {
      name: "02. User Profile & Safety",
      item: [
        {
          name: "Update User Profile",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "name", value: "Ahmad Zubayer", type: "text" },
                { key: "phone", value: "+8801712345679", type: "text" },
                { key: "emergency_message", value: "Safe at Dhaka camp.", type: "text" },
                { key: "medical_information", value: "Blood Group O+", type: "text" },
                { key: "file", type: "file", src: [] }
              ]
            },
            url: { raw: "{{base_url}}/users/update-profile", host: ["{{base_url}}"], path: ["users", "update-profile"] }
          }
        },
        {
          name: "Complete User Profile",
          request: {
            method: "PUT",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "gps_lat", value: "23.8103", type: "text" },
                { key: "gps_lng", value: "90.4125", type: "text" },
                { key: "emergency_message", value: "Require shelter near Mirpur.", type: "text" },
                { key: "medical_information", value: "Asthma patient", type: "text" },
                { key: "file", type: "file", src: [] }
              ]
            },
            url: { raw: "{{base_url}}/users/complete-profile", host: ["{{base_url}}"], path: ["users", "complete-profile"] }
          }
        },
        {
          name: "Toggle Safety Status (is_safe)",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/users/is-safe", host: ["{{base_url}}"], path: ["users", "is-safe"] }
          }
        }
      ]
    },
    {
      name: "03. Relief Organizations",
      item: [
        {
          name: "Sign Up / Apply as Relief Org",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "organization_name", value: "Red Cross Bangladesh", type: "text" },
                { key: "registration_number", value: "REG-NGO-2026-101", type: "text" },
                { key: "address", value: "House 12, Road 5, Dhanmondi, Dhaka", type: "text" },
                { key: "website", value: "https://redcross.org.bd", type: "text" },
                { key: "description", value: "Providing emergency relief and shelter services.", type: "text" },
                { key: "organization_type", value: "NGO", type: "text" },
                { key: "verification_doc", type: "file", src: [] }
              ]
            },
            url: { raw: "{{base_url}}/relief-org/sign-up-as-relief-org", host: ["{{base_url}}"], path: ["relief-org", "sign-up-as-relief-org"] }
          }
        },
        {
          name: "Verify Relief Org (Admin)",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/relief-org/{{relief_org_id}}/verify", host: ["{{base_url}}"], path: ["relief-org", "{{relief_org_id}}", "verify"] }
          }
        },
        {
          name: "Get My Relief Org Profile",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{relief_org_access_token}}" }],
            url: { raw: "{{base_url}}/relief-org/profile/me", host: ["{{base_url}}"], path: ["relief-org", "profile", "me"] }
          }
        },
        {
          name: "Get All Relief Organizations",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/relief-org", host: ["{{base_url}}"], path: ["relief-org"] }
          }
        },
        {
          name: "Get Relief Org by ID",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/relief-org/{{relief_org_id}}", host: ["{{base_url}}"], path: ["relief-org", "{{relief_org_id}}"] }
          }
        }
      ]
    },
    {
      name: "04. Disaster Alerts",
      item: [
        {
          name: "Create Disaster Alert (Relief Org)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{relief_org_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                disasterName: "Sylhet Flash Flood 2026",
                impactedLocation: "Sylhet Sadar, Sunamganj",
                impactTime: "2026-07-28T06:00:00.000Z",
                type: "flood"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/disaster", host: ["{{base_url}}"], path: ["disaster"] }
          }
        }
      ]
    },
    {
      name: "05. Shelters",
      item: [
        {
          name: "Create Shelter (Relief Org / Admin)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{relief_org_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                shelter_name: "Mirpur Central Relief Camp",
                shelter_location: "Mirpur Stadium, Section 10, Dhaka",
                shelter_capacity: 500,
                current_people_count: 45,
                disaster_id: "{{disaster_id}}"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/shelter", host: ["{{base_url}}"], path: ["shelter"] }
          }
        },
        {
          name: "Get All Shelters",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/shelter?disasterId={{disaster_id}}",
              host: ["{{base_url}}"],
              path: ["shelter"],
              query: [{ key: "disasterId", value: "{{disaster_id}}" }]
            }
          }
        },
        {
          name: "Get Shelter by ID",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/shelter/{{shelter_id}}", host: ["{{base_url}}"], path: ["shelter", "{{shelter_id}}"] }
          }
        },
        {
          name: "Update Shelter",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{relief_org_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                shelter_capacity: 600,
                current_people_count: 120
              }, null, 2)
            },
            url: { raw: "{{base_url}}/shelter/{{shelter_id}}", host: ["{{base_url}}"], path: ["shelter", "{{shelter_id}}"] }
          }
        },
        {
          name: "Delete Shelter",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{relief_org_access_token}}" }],
            url: { raw: "{{base_url}}/shelter/{{shelter_id}}", host: ["{{base_url}}"], path: ["shelter", "{{shelter_id}}"] }
          }
        }
      ]
    },
    {
      name: "06. Rescue Requests",
      item: [
        {
          name: "Create Rescue Request",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "latitude", value: "24.8949", type: "text" },
                { key: "longitude", value: "91.8687", type: "text" },
                { key: "description", value: "Water level rising rapidly, 5 people stuck on rooftop.", type: "text" },
                { key: "contact_phone", value: "+8801812345678", type: "text" },
                { key: "address", value: "Kazir Bazar, Sylhet", type: "text" },
                { key: "people_count", value: "5", type: "text" },
                { key: "urgency_level", value: "CRITICAL", type: "text" },
                { key: "medical_notes", value: "One elderly person needs insulin.", type: "text" },
                { key: "file", type: "file", src: [] }
              ]
            },
            url: { raw: "{{base_url}}/rescue-requests", host: ["{{base_url}}"], path: ["rescue-requests"] }
          }
        },
        {
          name: "Get My Rescue Requests",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/rescue-requests/my", host: ["{{base_url}}"], path: ["rescue-requests", "my"] }
          }
        },
        {
          name: "Get All Rescue Requests",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/rescue-requests", host: ["{{base_url}}"], path: ["rescue-requests"] }
          }
        },
        {
          name: "Get Rescue Request Details",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/rescue-requests/{{rescue_request_id}}", host: ["{{base_url}}"], path: ["rescue-requests", "{{rescue_request_id}}"] }
          }
        },
        {
          name: "Update Rescue Request Status",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                status: "IN_PROGRESS",
                assigned_rescuer_id: "{{volunteer_id}}"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/rescue-requests/{{rescue_request_id}}/status", host: ["{{base_url}}"], path: ["rescue-requests", "{{rescue_request_id}}", "status"] }
          }
        },
        {
          name: "Cancel My Rescue Request",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/rescue-requests/{{rescue_request_id}}/cancel", host: ["{{base_url}}"], path: ["rescue-requests", "{{rescue_request_id}}", "cancel"] }
          }
        }
      ]
    },
    {
      name: "07. Volunteer Management & Tasks",
      item: [
        {
          name: "Register as Volunteer",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "skills", value: "[\"first_aid\", \"flood_rescue\"]", type: "text" },
                { key: "why_join", value: "Want to support disaster victims with emergency first aid.", type: "text" },
                { key: "available", value: "true", type: "text" },
                { key: "file", type: "file", src: [] }
              ]
            },
            url: { raw: "{{base_url}}/volunteers/register", host: ["{{base_url}}"], path: ["volunteers", "register"] }
          }
        },
        {
          name: "Get My Volunteer Profile",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/me", host: ["{{base_url}}"], path: ["volunteers", "me"] }
          }
        },
        {
          name: "Update Volunteer Profile",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                skills: ["first_aid", "flood_rescue", "food_distribution"],
                available: true
              }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/me", host: ["{{base_url}}"], path: ["volunteers", "me"] }
          }
        },
        {
          name: "Apply for Verification",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [{ key: "file", type: "file", src: [] }]
            },
            url: { raw: "{{base_url}}/volunteers/verification/apply", host: ["{{base_url}}"], path: ["volunteers", "verification", "apply"] }
          }
        },
        {
          name: "Review Volunteer Verification (Admin)",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{admin_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ status: "verified" }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/{{volunteer_id}}/verification", host: ["{{base_url}}"], path: ["volunteers", "{{volunteer_id}}", "verification"] }
          }
        },
        {
          name: "Update Duty Location",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ latitude: 24.8949, longitude: 91.8687, on_duty: true }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/duty/location", host: ["{{base_url}}"], path: ["volunteers", "duty", "location"] }
          }
        },
        {
          name: "Get Nearby Rescue Requests",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: {
              raw: "{{base_url}}/volunteers/rescue-requests/nearby?radius=25",
              host: ["{{base_url}}"],
              path: ["volunteers", "rescue-requests", "nearby"],
              query: [{ key: "radius", value: "25" }]
            }
          }
        },
        {
          name: "Accept Rescue Task",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/rescue-tasks/{{rescue_request_id}}/accept", host: ["{{base_url}}"], path: ["volunteers", "rescue-tasks", "{{rescue_request_id}}", "accept"] }
          }
        },
        {
          name: "Reject Rescue Task",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/rescue-tasks/{{rescue_request_id}}/reject", host: ["{{base_url}}"], path: ["volunteers", "rescue-tasks", "{{rescue_request_id}}", "reject"] }
          }
        },
        {
          name: "Get My Assigned Rescue Tasks",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/rescue-tasks/my", host: ["{{base_url}}"], path: ["volunteers", "rescue-tasks", "my"] }
          }
        },
        {
          name: "Update Task Progress",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ notes: "Reached team at spot. Preparing rescue boat." }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/rescue-tasks/{{task_id}}/progress", host: ["{{base_url}}"], path: ["volunteers", "rescue-tasks", "{{task_id}}", "progress"] }
          }
        },
        {
          name: "Complete Rescue Task",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/rescue-tasks/{{task_id}}/complete", host: ["{{base_url}}"], path: ["volunteers", "rescue-tasks", "{{task_id}}", "complete"] }
          }
        },
        {
          name: "Report Route Condition",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                report_type: "blocked_route",
                description: "Bridge washed out near Sylhet highway.",
                latitude: 24.8900,
                longitude: 91.8600,
                address: "Sylhet Bypass Highway",
                severity: "critical"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/field-reports/routes", host: ["{{base_url}}"], path: ["volunteers", "field-reports", "routes"] }
          }
        },
        {
          name: "Report Resource Shortage",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                resource_name: "Clean Drinking Water",
                quantity_needed: 100,
                description: "Shelter short of drinking water bottles.",
                latitude: 24.8949,
                longitude: 91.8687,
                address: "Mirpur Camp",
                severity: "high"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/field-reports/shortages", host: ["{{base_url}}"], path: ["volunteers", "field-reports", "shortages"] }
          }
        },
        {
          name: "Get My Field Reports",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/field-reports/my", host: ["{{base_url}}"], path: ["volunteers", "field-reports", "my"] }
          }
        },
        {
          name: "Create Organization Request (Relief Org / Admin)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{relief_org_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Need 10 Medical Volunteers in Sylhet",
                description: "Assisting flood victims with first aid and medicine distribution.",
                required_skills: ["first_aid", "medical_assistance"],
                location: "Sylhet Sadar Relief Center",
                needed_volunteers: 10
              }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/organization-requests", host: ["{{base_url}}"], path: ["volunteers", "organization-requests"] }
          }
        },
        {
          name: "Get Open Organization Requests",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/organization-requests", host: ["{{base_url}}"], path: ["volunteers", "organization-requests"] }
          }
        },
        {
          name: "Join Organization Request",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/organization-requests/{{org_request_id}}/join", host: ["{{base_url}}"], path: ["volunteers", "organization-requests", "{{org_request_id}}", "join"] }
          }
        },
        {
          name: "Get My Organization Request Joins",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/organization-requests/my/joins", host: ["{{base_url}}"], path: ["volunteers", "organization-requests", "my", "joins"] }
          }
        },
        {
          name: "Join Rescue Group",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ notes: "I have speed boat experience." }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/rescue-groups/{{rescue_request_id}}/join", host: ["{{base_url}}"], path: ["volunteers", "rescue-groups", "{{rescue_request_id}}", "join"] }
          }
        },
        {
          name: "Join Missing Person Group",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ notes: "Available for local neighborhood search." }, null, 2)
            },
            url: { raw: "{{base_url}}/volunteers/missing-person-groups/{{missing_person_id}}/join", host: ["{{base_url}}"], path: ["volunteers", "missing-person-groups", "{{missing_person_id}}", "join"] }
          }
        },
        {
          name: "Get My Group Joins",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/volunteers/group-joins/my", host: ["{{base_url}}"], path: ["volunteers", "group-joins", "my"] }
          }
        }
      ]
    },
    {
      name: "08. Missing Persons",
      item: [
        {
          name: "Report Missing Person",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "full_name", value: "Rahim Uddin", type: "text" },
                { key: "age", value: "35", type: "text" },
                { key: "gender", value: "Male", type: "text" },
                { key: "last_seen_location", value: "Sunamganj Market", type: "text" },
                { key: "last_seen_date", value: "2026-07-27", type: "text" },
                { key: "description", value: "Wearing blue shirt and black pants during flood evacuation.", type: "text" },
                { key: "contact_phone", value: "+8801912345678", type: "text" },
                { key: "file", type: "file", src: [] }
              ]
            },
            url: { raw: "{{base_url}}/missing-persons", host: ["{{base_url}}"], path: ["missing-persons"] }
          }
        },
        {
          name: "Get My Reported Missing Persons",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/missing-persons/my", host: ["{{base_url}}"], path: ["missing-persons", "my"] }
          }
        },
        {
          name: "Get All Missing Persons",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/missing-persons?status=MISSING&search=Rahim",
              host: ["{{base_url}}"],
              path: ["missing-persons"],
              query: [
                { key: "status", value: "MISSING" },
                { key: "search", value: "Rahim" }
              ]
            }
          }
        },
        {
          name: "Get Missing Person by ID",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/missing-persons/{{missing_person_id}}", host: ["{{base_url}}"], path: ["missing-persons", "{{missing_person_id}}"] }
          }
        },
        {
          name: "Update Missing Person Report",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [{ key: "description", value: "Updated info: Last seen near medical shelter.", type: "text" }]
            },
            url: { raw: "{{base_url}}/missing-persons/{{missing_person_id}}", host: ["{{base_url}}"], path: ["missing-persons", "{{missing_person_id}}"] }
          }
        },
        {
          name: "Update Missing Person Status",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ status: "FOUND" }, null, 2)
            },
            url: { raw: "{{base_url}}/missing-persons/{{missing_person_id}}/status", host: ["{{base_url}}"], path: ["missing-persons", "{{missing_person_id}}", "status"] }
          }
        },
        {
          name: "Delete Missing Person Report",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/missing-persons/{{missing_person_id}}", host: ["{{base_url}}"], path: ["missing-persons", "{{missing_person_id}}"] }
          }
        }
      ]
    },
    {
      name: "09. Donations & Financial Aid",
      item: [
        {
          name: "Get All Donation Campaigns",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/donations/campaigns", host: ["{{base_url}}"], path: ["donations", "campaigns"] }
          }
        },
        {
          name: "Get Campaign Details by ID",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/donations/campaigns/{{campaign_id}}", host: ["{{base_url}}"], path: ["donations", "campaigns", "{{campaign_id}}"] }
          }
        },
        {
          name: "Initiate Donation Payment (Stripe)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                amount: 1000,
                payment_gateway: "stripe",
                is_anonymous: false,
                donor_name: "Ahmad Zubayer",
                donor_email: "ahmadzubayer@example.com"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/donations/campaigns/{{campaign_id}}/donate", host: ["{{base_url}}"], path: ["donations", "campaigns", "{{campaign_id}}", "donate"] }
          }
        },
        {
          name: "Payment Success Callback",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/donations/payment/success?session_id={{session_id}}&tx_id={{tx_id}}",
              host: ["{{base_url}}"],
              path: ["donations", "payment", "success"],
              query: [
                { key: "session_id", value: "{{session_id}}" },
                { key: "tx_id", value: "{{tx_id}}" }
              ]
            }
          }
        },
        {
          name: "Payment Cancel Callback",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/donations/payment/cancel?tx_id={{tx_id}}",
              host: ["{{base_url}}"],
              path: ["donations", "payment", "cancel"],
              query: [{ key: "tx_id", value: "{{tx_id}}" }]
            }
          }
        },
        {
          name: "Apply for Financial Aid",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                reason: "Home destroyed by Sylhet flood, urgently need emergency financial assistance.",
                payout_details: "bKash: +8801700000000 (Personal)",
                proof_document_url: "https://storage.example.com/proof.jpg"
              }, null, 2)
            },
            url: { raw: "{{base_url}}/donations/campaigns/{{campaign_id}}/apply", host: ["{{base_url}}"], path: ["donations", "campaigns", "{{campaign_id}}", "apply"] }
          }
        },
        {
          name: "Get My Aid Applications",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/donations/my-applications", host: ["{{base_url}}"], path: ["donations", "my-applications"] }
          }
        },
        {
          name: "Get All Aid Applications (Relief Org / Admin)",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{relief_org_access_token}}" }],
            url: { raw: "{{base_url}}/donations/applications", host: ["{{base_url}}"], path: ["donations", "applications"] }
          }
        },
        {
          name: "Review Aid Application (Relief Org / Admin)",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{relief_org_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ status: "APPROVED", approved_amount: 15000 }, null, 2)
            },
            url: { raw: "{{base_url}}/donations/applications/{{application_id}}/review", host: ["{{base_url}}"], path: ["donations", "applications", "{{application_id}}", "review"] }
          }
        }
      ]
    },
    {
      name: "10. Community Posts",
      item: [
        {
          name: "Get All Community Posts",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/community-posts?search=flood&sort=desc",
              host: ["{{base_url}}"],
              path: ["community-posts"],
              query: [
                { key: "search", value: "flood" },
                { key: "sort", value: "desc" }
              ]
            }
          }
        },
        {
          name: "Get Post Details by ID",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/community-posts/{{post_id}}", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}"] }
          }
        },
        {
          name: "Get Comments for Post",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/community-posts/{{post_id}}/comments", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}", "comments"] }
          }
        },
        {
          name: "Create Community Post",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [
                { key: "title", value: "Emergency Relief Center established at Mirpur Stadium", type: "text" },
                { key: "body", value: "Free food and medical supplies are available starting 9:00 AM.", type: "text" },
                { key: "files", type: "file", src: [] }
              ]
            },
            url: { raw: "{{base_url}}/community-posts", host: ["{{base_url}}"], path: ["community-posts"] }
          }
        },
        {
          name: "Update Community Post",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            body: {
              mode: "formdata",
              formdata: [{ key: "body", value: "Updated: Medicines available until 5:00 PM.", type: "text" }]
            },
            url: { raw: "{{base_url}}/community-posts/{{post_id}}", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}"] }
          }
        },
        {
          name: "Update Post Status (Author/Admin)",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ status: "ARCHIVED" }, null, 2)
            },
            url: { raw: "{{base_url}}/community-posts/{{post_id}}/status", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}", "status"] }
          }
        },
        {
          name: "Bump Post",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/community-posts/{{post_id}}/bump", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}", "bump"] }
          }
        },
        {
          name: "Delete Post",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/community-posts/{{post_id}}", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}"] }
          }
        },
        {
          name: "React to Post",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ type: "LIKE" }, null, 2)
            },
            url: { raw: "{{base_url}}/community-posts/{{post_id}}/react", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}", "react"] }
          }
        },
        {
          name: "Add Comment to Post",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ content: "Thank you for updating! Are volunteers needed on site?" }, null, 2)
            },
            url: { raw: "{{base_url}}/community-posts/{{post_id}}/comments", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}", "comments"] }
          }
        },
        {
          name: "Delete Comment",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{access_token}}" }],
            url: { raw: "{{base_url}}/community-posts/{{post_id}}/comments/{{comment_id}}", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}", "comments", "{{comment_id}}"] }
          }
        },
        {
          name: "Report Post",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ reason: "Contains misleading location information." }, null, 2)
            },
            url: { raw: "{{base_url}}/community-posts/{{post_id}}/report", host: ["{{base_url}}"], path: ["community-posts", "{{post_id}}", "report"] }
          }
        }
      ]
    },
    {
      name: "11. Admin Management",
      item: [
        {
          name: "List Accounts",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: {
              raw: "{{base_url}}/admin/accounts?page=1&limit=10",
              host: ["{{base_url}}"],
              path: ["admin", "accounts"],
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "10" }
              ]
            }
          }
        },
        {
          name: "Update Account Role",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{admin_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ role: "USER" }, null, 2)
            },
            url: { raw: "{{base_url}}/admin/accounts/{{user_id}}/role", host: ["{{base_url}}"], path: ["admin", "accounts", "{{user_id}}", "role"] }
          }
        },
        {
          name: "Soft Delete Account",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/accounts/{{user_id}}", host: ["{{base_url}}"], path: ["admin", "accounts", "{{user_id}}"] }
          }
        },
        {
          name: "Restore Soft-Deleted Account",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/accounts/{{user_id}}/restore", host: ["{{base_url}}"], path: ["admin", "accounts", "{{user_id}}", "restore"] }
          }
        },
        {
          name: "List Volunteers",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: {
              raw: "{{base_url}}/admin/volunteers?status=pending",
              host: ["{{base_url}}"],
              path: ["admin", "volunteers"],
              query: [{ key: "status", value: "pending" }]
            }
          }
        },
        {
          name: "Verify Volunteer Account",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{admin_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ status: "verified" }, null, 2)
            },
            url: { raw: "{{base_url}}/admin/volunteers/{{volunteer_id}}/verify", host: ["{{base_url}}"], path: ["admin", "volunteers", "{{volunteer_id}}", "verify"] }
          }
        },
        {
          name: "List Relief Orgs",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/relief-orgs", host: ["{{base_url}}"], path: ["admin", "relief-orgs"] }
          }
        },
        {
          name: "Verify Relief Org",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{admin_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ status: "verified" }, null, 2)
            },
            url: { raw: "{{base_url}}/admin/relief-orgs/{{relief_org_id}}/verify", host: ["{{base_url}}"], path: ["admin", "relief-orgs", "{{relief_org_id}}", "verify"] }
          }
        },
        {
          name: "List Disaster Reports",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/disasters", host: ["{{base_url}}"], path: ["admin", "disasters"] }
          }
        },
        {
          name: "Verify Disaster Report",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{admin_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ verified: true }, null, 2)
            },
            url: { raw: "{{base_url}}/admin/disasters/{{disaster_id}}/verify", host: ["{{base_url}}"], path: ["admin", "disasters", "{{disaster_id}}", "verify"] }
          }
        },
        {
          name: "List Rescue Requests",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/rescue-requests", host: ["{{base_url}}"], path: ["admin", "rescue-requests"] }
          }
        },
        {
          name: "List Community Posts",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/community-posts", host: ["{{base_url}}"], path: ["admin", "community-posts"] }
          }
        },
        {
          name: "Moderate Post Status",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{admin_access_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ status: "APPROVED" }, null, 2)
            },
            url: { raw: "{{base_url}}/admin/community-posts/{{post_id}}/status", host: ["{{base_url}}"], path: ["admin", "community-posts", "{{post_id}}", "status"] }
          }
        },
        {
          name: "Soft Delete Community Post",
          request: {
            method: "DELETE",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/community-posts/{{post_id}}", host: ["{{base_url}}"], path: ["admin", "community-posts", "{{post_id}}"] }
          }
        },
        {
          name: "Restore Soft-Deleted Community Post",
          request: {
            method: "PATCH",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/community-posts/{{post_id}}/restore", host: ["{{base_url}}"], path: ["admin", "community-posts", "{{post_id}}", "restore"] }
          }
        },
        {
          name: "Generate Admin Report Summary",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{admin_access_token}}" }],
            url: { raw: "{{base_url}}/admin/reports", host: ["{{base_url}}"], path: ["admin", "reports"] }
          }
        }
      ]
    },
    {
      name: "12. App Health Check",
      item: [
        {
          name: "Root Health Check",
          request: {
            method: "GET",
            header: [],
            url: { raw: "{{base_url}}/", host: ["{{base_url}}"], path: [""] }
          }
        }
      ]
    }
  ]
};

const environment = {
  id: "edrms-backend-v1-env-id",
  name: "EDRMS Local Environment",
  values: [
    { key: "base_url", value: "http://localhost:3000", enabled: true },
    { key: "access_token", value: "", enabled: true },
    { key: "refresh_token", value: "", enabled: true },
    { key: "admin_access_token", value: "", enabled: true },
    { key: "relief_org_access_token", value: "", enabled: true },
    { key: "email_verification_token", value: "YOUR_EMAIL_TOKEN_HERE", enabled: true },
    { key: "user_id", value: "e4b5a260-1234-4567-89ab-cdef01234567", enabled: true },
    { key: "volunteer_id", value: "v9998887-7766-5544-3322-1100aabbccdd", enabled: true },
    { key: "relief_org_id", value: "a9876543-e21b-12d3-a456-426614174000", enabled: true },
    { key: "disaster_id", value: "b1112223-3344-5566-7788-99aabbccdd00", enabled: true },
    { key: "shelter_id", value: "c1234567-89ab-cdef-0123-456789abcdef", enabled: true },
    { key: "rescue_request_id", value: "d9876543-210a-4b98-8765-43210fedcba9", enabled: true },
    { key: "task_id", value: "t1112223-3344-5566-7788-99aabbccdd00", enabled: true },
    { key: "missing_person_id", value: "e8877665-5544-3322-1100-aabbccddeeff", enabled: true },
    { key: "campaign_id", value: "f7766554-4433-2211-00aa-bbccddeeff00", enabled: true },
    { key: "application_id", value: "app-1234-uuid", enabled: true },
    { key: "post_id", value: "p1122334-4455-6677-8899-00aabbccdd00", enabled: true },
    { key: "comment_id", value: "comm-1234-uuid", enabled: true },
    { key: "org_request_id", value: "org-req-1234-uuid", enabled: true },
    { key: "session_id", value: "cs_test_sample", enabled: true },
    { key: "tx_id", value: "tx_sample_123", enabled: true }
  ],
  _postman_variable_scope: "environment"
};

const rootDir = 'd:\\AhmadZubayer\\Dev\\Projects\\Emergency-Disaster-Response-Management-System-APWT\\edrms-backend-v1';
fs.writeFileSync(path.join(rootDir, 'EDRMS_v1.postman_collection.json'), JSON.stringify(collection, null, 2));
fs.writeFileSync(path.join(rootDir, 'EDRMS_v1.postman_environment.json'), JSON.stringify(environment, null, 2));

console.log('Successfully generated EDRMS_v1.postman_collection.json and EDRMS_v1.postman_environment.json!');
