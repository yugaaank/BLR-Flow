# API Endpoints Documentation

## 1. Input a Violation
- **Method:** POST
- **Path:** `/violations/input`
- **Accepts:** `latitude` (float), `longitude` (float), `violation_type` (string), `time` (timestamp/string)
- **Returns:** 
  - `impact_score` (1-100)
  - list of affected junctions
  - estimated commute time increase
  - priority rank
- **Description:** Receives a new violation report and returns the real-time calculated impact.

## 2. Get Recommendations
- **Method:** GET
- **Path:** `/recommendations`
- **Accepts:** nothing
- **Returns:** list of all active violations sorted by `impact_score` (highest first)
- **Description:** Fetches all currently active violations ranked by their cascading impact on traffic to help dispatch resources efficiently.

## 3. Simulate Cascade Removal
- **Method:** GET
- **Path:** `/cascade-sim`
- **Accepts:** list of violation IDs to remove
- **Returns:** 
  - predicted congestion with these violations removed
  - junctions affected
  - commute time
- **Description:** Simulates the reduction in overall network congestion if specific violations are cleared.

## 4. Health Check
- **Method:** GET
- **Path:** `/health`
- **Accepts:** nothing
- **Returns:** status (ok/error)
- **Description:** Simple endpoint to verify the API is running correctly.
