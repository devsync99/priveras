# Data Model Documentation

## Healthcare Portal Modernization Project

**Document Type:** Data Model Specification  
**Project ID:** HCP-2025-001  
**Version:** 1.0  
**Date:** December 9, 2025

---

## Database Schema Overview

### Patient Table

Primary table for storing patient demographic information and authentication data.

**Table Name:** `patients`

| Column Name                 | Data Type    | Constraints                 | Description                        | Sensitivity |
| --------------------------- | ------------ | --------------------------- | ---------------------------------- | ----------- |
| patient_id                  | UUID         | PRIMARY KEY                 | Unique patient identifier          | Medium      |
| health_card_number          | VARCHAR(12)  | UNIQUE, NOT NULL, ENCRYPTED | OHIP health card number            | Critical    |
| first_name                  | VARCHAR(100) | NOT NULL                    | Patient's legal first name         | High        |
| middle_name                 | VARCHAR(100) | NULL                        | Patient's middle name              | High        |
| last_name                   | VARCHAR(100) | NOT NULL                    | Patient's legal last name          | High        |
| date_of_birth               | DATE         | NOT NULL                    | Patient's date of birth            | Critical    |
| gender_identity             | VARCHAR(50)  | NULL                        | Self-identified gender             | High        |
| sin_number                  | VARCHAR(11)  | ENCRYPTED, NULL             | Social Insurance Number (optional) | Critical    |
| drivers_license             | VARCHAR(20)  | ENCRYPTED, NULL             | Driver's license for verification  | High        |
| email_address               | VARCHAR(255) | UNIQUE, NOT NULL            | Primary email contact              | Medium      |
| phone_primary               | VARCHAR(20)  | NOT NULL                    | Primary phone number               | Medium      |
| phone_secondary             | VARCHAR(20)  | NULL                        | Secondary/emergency contact        | Medium      |
| address_street              | VARCHAR(255) | NOT NULL                    | Street address                     | Medium      |
| address_city                | VARCHAR(100) | NOT NULL                    | City                               | Medium      |
| address_province            | VARCHAR(50)  | NOT NULL                    | Province                           | Low         |
| address_postal_code         | VARCHAR(7)   | NOT NULL                    | Postal code                        | Medium      |
| mailing_address_street      | VARCHAR(255) | NULL                        | Mailing street (if different)      | Medium      |
| mailing_address_city        | VARCHAR(100) | NULL                        | Mailing city                       | Medium      |
| mailing_address_province    | VARCHAR(50)  | NULL                        | Mailing province                   | Low         |
| mailing_address_postal_code | VARCHAR(7)   | NULL                        | Mailing postal code                | Medium      |
| account_status              | ENUM         | NOT NULL                    | Active, Suspended, Closed          | Low         |
| created_at                  | TIMESTAMP    | NOT NULL                    | Account creation timestamp         | Low         |
| updated_at                  | TIMESTAMP    | NOT NULL                    | Last update timestamp              | Low         |
| last_login_at               | TIMESTAMP    | NULL                        | Last successful login              | Low         |
| consent_version             | VARCHAR(10)  | NOT NULL                    | Accepted consent version           | Medium      |
| consent_date                | TIMESTAMP    | NOT NULL                    | Date of consent acceptance         | Medium      |

**Indexes:**

- PRIMARY KEY on patient_id
- UNIQUE INDEX on health_card_number
- INDEX on email_address
- INDEX on last_name, first_name

**Encryption:** All fields marked as CRITICAL or HIGH sensitivity are encrypted at rest using AES-256.

---

### Medical Records Table

Stores patient medical history, diagnoses, and clinical notes.

**Table Name:** `medical_records`

| Column Name            | Data Type    | Constraints           | Description                            | Sensitivity |
| ---------------------- | ------------ | --------------------- | -------------------------------------- | ----------- |
| record_id              | UUID         | PRIMARY KEY           | Unique record identifier               | Medium      |
| patient_id             | UUID         | FOREIGN KEY, NOT NULL | Reference to patients table            | Critical    |
| record_type            | ENUM         | NOT NULL              | Diagnosis, Note, Prescription, etc.    | Medium      |
| record_date            | DATE         | NOT NULL              | Date of medical record                 | Medium      |
| provider_id            | UUID         | FOREIGN KEY, NOT NULL | Healthcare provider who created record | Medium      |
| diagnosis_code         | VARCHAR(20)  | NULL                  | ICD-10 diagnosis code                  | Critical    |
| diagnosis_description  | TEXT         | NULL                  | Diagnosis description                  | Critical    |
| clinical_notes         | TEXT         | ENCRYPTED             | Provider's clinical notes              | Critical    |
| treatment_plan         | TEXT         | ENCRYPTED             | Recommended treatment                  | Critical    |
| medications_prescribed | JSONB        | ENCRYPTED             | List of prescribed medications         | Critical    |
| allergies_noted        | JSONB        | ENCRYPTED             | Allergies identified                   | Critical    |
| vital_signs            | JSONB        | NULL                  | Blood pressure, temp, etc.             | High        |
| follow_up_required     | BOOLEAN      | NOT NULL              | Follow-up appointment needed           | Low         |
| follow_up_date         | DATE         | NULL                  | Scheduled follow-up date               | Low         |
| created_at             | TIMESTAMP    | NOT NULL              | Record creation timestamp              | Low         |
| updated_at             | TIMESTAMP    | NOT NULL              | Last update timestamp                  | Low         |
| ehr_sync_status        | ENUM         | NOT NULL              | Synced, Pending, Failed                | Low         |
| ehr_record_id          | VARCHAR(100) | NULL                  | External EHR system record ID          | Medium      |

**Indexes:**

- PRIMARY KEY on record_id
- INDEX on patient_id, record_date
- INDEX on provider_id
- INDEX on record_type

---

### Laboratory Results Table

Stores lab test results and reports.

**Table Name:** `lab_results`

| Column Name          | Data Type    | Constraints           | Description                    | Sensitivity |
| -------------------- | ------------ | --------------------- | ------------------------------ | ----------- |
| result_id            | UUID         | PRIMARY KEY           | Unique result identifier       | Medium      |
| patient_id           | UUID         | FOREIGN KEY, NOT NULL | Reference to patients table    | Critical    |
| test_type            | VARCHAR(100) | NOT NULL              | Type of lab test               | High        |
| test_code            | VARCHAR(20)  | NOT NULL              | LOINC test code                | Medium      |
| test_date            | DATE         | NOT NULL              | Date test was performed        | Medium      |
| result_value         | VARCHAR(255) | ENCRYPTED             | Test result value              | Critical    |
| result_unit          | VARCHAR(50)  | NULL                  | Unit of measurement            | Medium      |
| reference_range      | VARCHAR(100) | NULL                  | Normal reference range         | Low         |
| abnormal_flag        | BOOLEAN      | NOT NULL              | Result outside normal range    | High        |
| result_status        | ENUM         | NOT NULL              | Final, Preliminary, Corrected  | Medium      |
| ordering_provider_id | UUID         | FOREIGN KEY, NOT NULL | Provider who ordered test      | Medium      |
| performing_lab       | VARCHAR(255) | NOT NULL              | Laboratory that performed test | Medium      |
| lab_technician_id    | VARCHAR(100) | NULL                  | Technician identifier          | Medium      |
| result_notes         | TEXT         | ENCRYPTED             | Additional notes or comments   | Critical    |
| result_document_url  | VARCHAR(500) | ENCRYPTED             | Link to full report PDF        | Critical    |
| patient_notified     | BOOLEAN      | NOT NULL              | Patient notification sent      | Low         |
| notification_date    | TIMESTAMP    | NULL                  | Date patient was notified      | Low         |
| created_at           | TIMESTAMP    | NOT NULL              | Record creation timestamp      | Low         |

---

### Appointments Table

Manages patient appointments and scheduling.

**Table Name:** `appointments`

| Column Name         | Data Type    | Constraints           | Description                                | Sensitivity |
| ------------------- | ------------ | --------------------- | ------------------------------------------ | ----------- |
| appointment_id      | UUID         | PRIMARY KEY           | Unique appointment identifier              | Low         |
| patient_id          | UUID         | FOREIGN KEY, NOT NULL | Reference to patients table                | High        |
| provider_id         | UUID         | FOREIGN KEY, NOT NULL | Healthcare provider                        | Medium      |
| appointment_date    | DATE         | NOT NULL              | Date of appointment                        | Medium      |
| appointment_time    | TIME         | NOT NULL              | Time of appointment                        | Medium      |
| appointment_type    | ENUM         | NOT NULL              | Initial, Follow-up, Emergency              | Low         |
| duration_minutes    | INTEGER      | NOT NULL              | Expected duration                          | Low         |
| location            | VARCHAR(255) | NOT NULL              | Clinic/office location                     | Low         |
| room_number         | VARCHAR(20)  | NULL                  | Room or office number                      | Low         |
| reason_for_visit    | TEXT         | ENCRYPTED             | Patient's reason for appointment           | High        |
| status              | ENUM         | NOT NULL              | Scheduled, Confirmed, Completed, Cancelled | Low         |
| check_in_time       | TIMESTAMP    | NULL                  | Patient check-in timestamp                 | Low         |
| check_out_time      | TIMESTAMP    | NULL                  | Patient check-out timestamp                | Low         |
| reminder_sent_48h   | BOOLEAN      | NOT NULL              | 48-hour reminder sent                      | Low         |
| reminder_sent_24h   | BOOLEAN      | NOT NULL              | 24-hour reminder sent                      | Low         |
| cancellation_reason | TEXT         | NULL                  | Reason for cancellation if applicable      | Medium      |
| created_at          | TIMESTAMP    | NOT NULL              | Booking timestamp                          | Low         |
| created_by          | UUID         | NOT NULL              | User who created appointment               | Low         |

---

### Secure Messages Table

Patient-provider secure messaging system.

**Table Name:** `secure_messages`

| Column Name          | Data Type    | Constraints           | Description                    | Sensitivity |
| -------------------- | ------------ | --------------------- | ------------------------------ | ----------- |
| message_id           | UUID         | PRIMARY KEY           | Unique message identifier      | Low         |
| thread_id            | UUID         | NOT NULL              | Conversation thread identifier | Low         |
| sender_id            | UUID         | FOREIGN KEY, NOT NULL | User who sent message          | Medium      |
| sender_type          | ENUM         | NOT NULL              | Patient, Provider, Admin       | Low         |
| recipient_id         | UUID         | FOREIGN KEY, NOT NULL | Message recipient              | Medium      |
| recipient_type       | ENUM         | NOT NULL              | Patient, Provider, Admin       | Low         |
| subject              | VARCHAR(255) | ENCRYPTED             | Message subject                | High        |
| message_body         | TEXT         | ENCRYPTED             | Message content                | Critical    |
| message_type         | ENUM         | NOT NULL              | General, Prescription, Results | Medium      |
| priority             | ENUM         | NOT NULL              | Normal, Urgent                 | Low         |
| attachment_urls      | JSONB        | ENCRYPTED             | Links to attachments           | Critical    |
| read_status          | BOOLEAN      | NOT NULL              | Message has been read          | Low         |
| read_at              | TIMESTAMP    | NULL                  | Timestamp when read            | Low         |
| archived             | BOOLEAN      | NOT NULL              | Message archived               | Low         |
| deleted_by_sender    | BOOLEAN      | NOT NULL              | Sender deleted                 | Low         |
| deleted_by_recipient | BOOLEAN      | NOT NULL              | Recipient deleted              | Low         |
| created_at           | TIMESTAMP    | NOT NULL              | Message sent timestamp         | Low         |

---

### Authentication Table

User authentication credentials and security.

**Table Name:** `user_credentials`

| Column Name            | Data Type    | Constraints           | Description                         | Sensitivity |
| ---------------------- | ------------ | --------------------- | ----------------------------------- | ----------- |
| credential_id          | UUID         | PRIMARY KEY           | Unique credential identifier        | Medium      |
| user_id                | UUID         | FOREIGN KEY, NOT NULL | Reference to patients or providers  | Critical    |
| user_type              | ENUM         | NOT NULL              | Patient, Provider, Admin            | Medium      |
| username               | VARCHAR(100) | UNIQUE, NOT NULL      | Login username                      | High        |
| password_hash          | VARCHAR(255) | NOT NULL              | Bcrypt password hash                | Critical    |
| password_salt          | VARCHAR(255) | NOT NULL              | Password salt                       | Critical    |
| mfa_enabled            | BOOLEAN      | NOT NULL              | Multi-factor authentication enabled | Medium      |
| mfa_method             | ENUM         | NULL                  | SMS, Authenticator, Email           | Medium      |
| mfa_secret             | VARCHAR(255) | ENCRYPTED             | MFA secret key                      | Critical    |
| backup_codes           | JSONB        | ENCRYPTED             | Emergency backup codes              | Critical    |
| security_question_1    | VARCHAR(255) | NOT NULL              | First security question             | Medium      |
| security_answer_1_hash | VARCHAR(255) | NOT NULL              | Hashed answer                       | Critical    |
| security_question_2    | VARCHAR(255) | NOT NULL              | Second security question            | Medium      |
| security_answer_2_hash | VARCHAR(255) | NOT NULL              | Hashed answer                       | Critical    |
| password_changed_at    | TIMESTAMP    | NOT NULL              | Last password change                | Medium      |
| failed_login_attempts  | INTEGER      | NOT NULL              | Count of failed logins              | Medium      |
| account_locked         | BOOLEAN      | NOT NULL              | Account locked status               | Medium      |
| locked_until           | TIMESTAMP    | NULL                  | Lock expiration time                | Medium      |
| password_reset_token   | VARCHAR(255) | ENCRYPTED             | Reset token                         | Critical    |
| password_reset_expires | TIMESTAMP    | NULL                  | Token expiration                    | Medium      |
| last_successful_login  | TIMESTAMP    | NULL                  | Last successful login               | Medium      |
| last_login_ip          | VARCHAR(45)  | NULL                  | IP address of last login            | Medium      |
| created_at             | TIMESTAMP    | NOT NULL              | Credential creation                 | Low         |
| updated_at             | TIMESTAMP    | NOT NULL              | Last update                         | Low         |

---

### Audit Log Table

Comprehensive audit trail for all PHI access and system actions.

**Table Name:** `audit_logs`

| Column Name          | Data Type    | Constraints | Description                         | Sensitivity |
| -------------------- | ------------ | ----------- | ----------------------------------- | ----------- |
| audit_id             | UUID         | PRIMARY KEY | Unique audit entry identifier       | Low         |
| timestamp            | TIMESTAMP    | NOT NULL    | Action timestamp                    | Low         |
| user_id              | UUID         | NOT NULL    | User who performed action           | High        |
| user_type            | ENUM         | NOT NULL    | Patient, Provider, Admin            | Low         |
| action_type          | ENUM         | NOT NULL    | View, Create, Update, Delete, Login | Medium      |
| resource_type        | VARCHAR(100) | NOT NULL    | Type of resource accessed           | Medium      |
| resource_id          | UUID         | NULL        | Specific resource identifier        | High        |
| patient_id           | UUID         | NULL        | Patient whose data was accessed     | Critical    |
| ip_address           | VARCHAR(45)  | NOT NULL    | IP address of user                  | Medium      |
| user_agent           | TEXT         | NOT NULL    | Browser/device information          | Low         |
| session_id           | UUID         | NOT NULL    | Session identifier                  | Medium      |
| action_details       | JSONB        | NULL        | Additional action details           | Medium      |
| data_before          | JSONB        | ENCRYPTED   | Data state before change            | Critical    |
| data_after           | JSONB        | ENCRYPTED   | Data state after change             | Critical    |
| success              | BOOLEAN      | NOT NULL    | Action succeeded                    | Low         |
| error_message        | TEXT         | NULL        | Error if action failed              | Medium      |
| access_justification | TEXT         | NULL        | Reason for access (emergency)       | High        |

**Indexes:**

- PRIMARY KEY on audit_id
- INDEX on timestamp
- INDEX on user_id
- INDEX on patient_id
- INDEX on action_type

**Retention:** 7 years as per PHIPA requirements.

---

### Consent Records Table

Patient consent tracking and management.

**Table Name:** `consent_records`

| Column Name       | Data Type   | Constraints           | Description                           | Sensitivity |
| ----------------- | ----------- | --------------------- | ------------------------------------- | ----------- |
| consent_id        | UUID        | PRIMARY KEY           | Unique consent identifier             | Medium      |
| patient_id        | UUID        | FOREIGN KEY, NOT NULL | Reference to patients table           | Critical    |
| consent_type      | ENUM        | NOT NULL              | Terms, Privacy, DataSharing, Research | High        |
| consent_version   | VARCHAR(10) | NOT NULL              | Version of consent document           | Medium      |
| consent_text      | TEXT        | NOT NULL              | Full text of consent                  | Medium      |
| consent_given     | BOOLEAN     | NOT NULL              | Consent granted or denied             | High        |
| consent_date      | TIMESTAMP   | NOT NULL              | Date consent given/withdrawn          | High        |
| consent_method    | ENUM        | NOT NULL              | Online, Paper, Verbal                 | Medium      |
| witness_id        | UUID        | NULL                  | Witness (if applicable)               | Medium      |
| expiry_date       | DATE        | NULL                  | Consent expiration date               | High        |
| withdrawn_date    | TIMESTAMP   | NULL                  | Date consent withdrawn                | High        |
| withdrawal_reason | TEXT        | NULL                  | Reason for withdrawal                 | Medium      |
| ip_address        | VARCHAR(45) | NULL                  | IP when consent given                 | Low         |
| created_at        | TIMESTAMP   | NOT NULL              | Record creation                       | Low         |
| updated_at        | TIMESTAMP   | NOT NULL              | Last update                           | Low         |

---

## Data Flow Specifications

### 1. Patient Registration Data Flow

```
[Patient Browser]
    → HTTPS/TLS 1.3 →
[Load Balancer]
    → Internal Network →
[API Gateway - Kong]
    → Authentication Check →
[Registration Service]
    → Encrypt Sensitive Fields (AES-256) →
[PostgreSQL Primary Database]
    → Replication →
[PostgreSQL Standby Database]
    → Backup →
[Azure Blob Storage - Encrypted]
```

### 2. Medical Records Retrieval Data Flow

```
[Patient Portal Frontend]
    → HTTPS Request with JWT Token →
[API Gateway]
    → Token Validation →
[Authentication Service]
    → Authorization Check (RBAC) →
[Medical Records Service]
    → Query with patient_id →
[PostgreSQL Database]
    → Decrypt PHI Fields →
[Data Transformation Layer]
    → FHIR Formatting →
[API Response (Encrypted) ]
    → HTTPS Response →
[Patient Portal Frontend]
    → Render (Audit Log Created) →
[Audit Service writes to audit_logs table]
```

### 3. EHR Integration Data Flow

```
[Epic EHR System]
    ← → HL7 FHIR API (mTLS) ← →
[Integration Service]
    → Data Mapping →
[Healthcare Portal Database]
    → Bidirectional Sync →
[Sync Status Monitoring]
```

---

## Data Retention and Disposal

### Retention Periods (PHIPA Compliant)

| Data Type                      | Retention Period                  | Disposal Method    |
| ------------------------------ | --------------------------------- | ------------------ |
| Active patient medical records | Indefinite (while patient active) | N/A                |
| Inactive patient records       | 10 years after last contact       | Secure deletion    |
| Audit logs                     | 7 years                           | Secure deletion    |
| Session logs                   | 90 days                           | Automated deletion |
| Temporary uploads              | 24 hours                          | Automated deletion |
| Closed account data            | 30 days (legal hold)              | Secure deletion    |
| Backup archives                | 7 years                           | Secure deletion    |
| Consent records                | Indefinite                        | N/A                |
| Authentication logs            | 2 years                           | Secure deletion    |

### Secure Deletion Process

1. Database records marked for deletion
2. Automated job runs nightly
3. Cryptographic erasure of encryption keys
4. Physical data overwritten (3-pass DOD 5220.22-M)
5. Deletion audit log entry created
6. Backup purge verification

---

## Data Encryption Standards

### At Rest

- **Algorithm:** AES-256-GCM
- **Key Management:** Azure Key Vault
- **Key Rotation:** Quarterly
- **Encrypted Fields:** All CRITICAL and HIGH sensitivity fields

### In Transit

- **Protocol:** TLS 1.3 (minimum TLS 1.2)
- **Certificate:** 2048-bit RSA certificates
- **Perfect Forward Secrecy:** Enabled
- **HSTS:** Enabled with 1-year max-age

### Backup Encryption

- **Algorithm:** AES-256
- **Storage:** Azure Blob Storage with encryption
- **Geographic Redundancy:** Canada East and Canada Central
- **Access:** Multi-factor authentication required

---

**Document Classification:** Confidential  
**Last Updated:** December 9, 2025  
**Next Review:** June 9, 2026  
**Document Owner:** David Park, CISO
