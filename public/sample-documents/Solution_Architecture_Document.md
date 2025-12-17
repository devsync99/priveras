# Solution Architecture Document

## Healthcare Portal Modernization Project

**Document Version:** 1.1  
**Project ID:** HCP-2025-001  
**Date:** December 9, 2025  
**Architect:** Jennifer Liu, Senior Solutions Architect

---

## 1. Architecture Overview

The Healthcare Portal Modernization solution employs a modern, cloud-native, microservices-based architecture designed for scalability, security, and PHIPA compliance. The system is hosted entirely within Canadian Azure regions to ensure data sovereignty.

### 1.1 Architecture Principles

- **Security by Design:** Every component includes security controls
- **Privacy by Default:** Minimal data collection and processing
- **Data Sovereignty:** All data remains in Canada
- **High Availability:** 99.9% uptime SLA
- **Scalability:** Auto-scaling based on demand
- **Interoperability:** HL7 FHIR standards compliance
- **Auditability:** Comprehensive audit logging

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  [Web Browser]    [iOS App]    [Android App]    [Provider Portal]   │
│      (React)       (Swift)        (Kotlin)         (React)           │
└────────────────┬────────────────────────────────────────────────────┘
                 │ HTTPS/TLS 1.3
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EDGE LAYER                                      │
├─────────────────────────────────────────────────────────────────────┤
│  [Azure Front Door] → [WAF] → [DDoS Protection]                     │
│         │                                                             │
│         └──→ [Azure CDN] (Static Assets)                            │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  [Kong API Gateway]                                                  │
│    • Rate Limiting                                                   │
│    • Request Validation                                              │
│    • JWT Token Verification                                          │
│    • API Versioning                                                  │
│    • Request/Response Logging                                        │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER (AKS)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   Auth Service   │  │  Patient Service │  │ Medical Records │  │
│  │   (Node.js)      │  │    (Node.js)     │  │   Service       │  │
│  │  • OAuth 2.0     │  │  • Registration  │  │  • View Records │  │
│  │  • JWT Tokens    │  │  • Profile Mgmt  │  │  • EHR Sync     │  │
│  │  • MFA           │  │  • Identity Ver. │  │  • FHIR API     │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ Appointment Svc  │  │ Messaging Service│  │ Notification    │  │
│  │   (Node.js)      │  │    (Node.js)     │  │   Service       │  │
│  │  • Scheduling    │  │  • Secure Chat   │  │  • Email/SMS    │  │
│  │  • Reminders     │  │  • Attachments   │  │  • Push Notif.  │  │
│  │  • Availability  │  │  • Encryption    │  │  • Preferences  │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ Lab Results Svc  │  │  Consent Service │  │  Audit Service  │  │
│  │   (Node.js)      │  │    (Node.js)     │  │   (Node.js)     │  │
│  │  • Test Results  │  │  • Consent Mgmt  │  │  • Logging      │  │
│  │  • Notifications │  │  • Tracking      │  │  • Compliance   │  │
│  │  • Lab Integr.   │  │  • Withdrawal    │  │  • Analytics    │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                       │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────┤
│  [PostgreSQL Primary]    [PostgreSQL Standby]    [MongoDB]          │
│   (Transactional Data)    (Read Replica)         (Documents)        │
│         │                       │                     │              │
│         └───────────────────────┴─────────────────────┘              │
│                                 │                                    │
│                    [Azure Blob Storage]                              │
│                    (Medical Images, PDFs)                            │
│                                 │                                    │
│                         [Redis Cluster]                              │
│                      (Sessions, Cache)                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  INTEGRATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  [EHR Integration Service]                                           │
│    • Epic FHIR API (HL7 FHIR R4)                                    │
│    • Mutual TLS Authentication                                       │
│    • Real-time Sync via Webhooks                                     │
│    • Message Queue (RabbitMQ) for async processing                  │
│                                                                       │
│  [Third-Party Integrations]                                          │
│    • Twilio (SMS Notifications)                                      │
│    • SendGrid (Email)                                                │
│    • Verified.me (Identity Verification)                            │
│    • Laboratory Systems (HL7 v2.5)                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  SECURITY & MONITORING                               │
├─────────────────────────────────────────────────────────────────────┤
│  [Azure AD B2C]  [Key Vault]  [Azure Sentinel]  [Log Analytics]    │
│  [Azure Monitor] [App Insights] [Security Center]                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Details

### 3.1 Client Layer

#### 3.1.1 Web Application (Patient Portal)

- **Technology:** React 18.2 with Next.js 14
- **Language:** TypeScript 5.0
- **State Management:** Redux Toolkit
- **UI Framework:** Material-UI with custom healthcare theme
- **Accessibility:** WCAG 2.1 AA compliant
- **Responsive:** Mobile-first design
- **PWA:** Progressive Web App capabilities
- **Security:**
  - Content Security Policy (CSP)
  - Subresource Integrity (SRI)
  - XSS protection headers
  - Secure cookie handling

#### 3.1.2 Mobile Applications

- **iOS:** Native Swift 5.9, iOS 14+
- **Android:** Native Kotlin 1.9, Android 8+
- **Features:**
  - Biometric authentication (Face ID, Touch ID, fingerprint)
  - Push notifications
  - Offline mode for viewing cached records
  - Certificate pinning
  - Encrypted local storage

#### 3.1.3 Provider Portal

- **Technology:** React 18.2 with specialized provider interface
- **Features:**
  - Patient search and management
  - Clinical documentation interface
  - Appointment scheduling
  - Secure messaging
  - E-prescribing integration

---

### 3.2 Edge Layer

#### 3.2.1 Azure Front Door

- **Function:** Global load balancing and routing
- **Features:**
  - SSL/TLS termination
  - URL routing and redirection
  - Session affinity
  - Health probes
  - Failover to secondary region

#### 3.2.2 Web Application Firewall (WAF)

- **Rules:**
  - OWASP Core Rule Set 3.2
  - Custom rules for healthcare-specific threats
  - Rate limiting (100 requests/minute per IP)
  - Geo-blocking for non-Canadian IPs (configurable)
  - SQL injection protection
  - XSS attack prevention

#### 3.2.3 Azure CDN

- **Purpose:** Static asset delivery
- **Cached Content:**
  - JavaScript bundles
  - CSS stylesheets
  - Images and icons
  - Public documentation
- **Cache Duration:** 1 hour for application assets, 24 hours for images
- **Edge Locations:** All Canadian Azure CDN POPs

---

### 3.3 API Gateway Layer

#### 3.3.1 Kong API Gateway

- **Version:** Kong 3.x Enterprise
- **Plugins Enabled:**
  - JWT Authentication
  - Rate Limiting (1000 requests/hour per user)
  - Request Size Limiting (10MB max)
  - CORS handling
  - Request/Response Transformer
  - Prometheus metrics
  - File Log for audit
  - IP Restriction
  - Bot Detection

**API Versioning Strategy:**

- URL-based versioning: `/api/v1/`, `/api/v2/`
- Backward compatibility maintained for 2 major versions
- Deprecation notices 6 months in advance

---

### 3.4 Services Layer (Microservices)

#### 3.4.1 Authentication Service

**Responsibility:** User authentication, authorization, session management

**Technology Stack:**

- Node.js 20 LTS
- Express.js 4.18
- Passport.js for OAuth
- jsonwebtoken for JWT handling
- bcrypt for password hashing

**Key Features:**

- OAuth 2.0 / OpenID Connect (OIDC)
- JWT token generation and validation
- Multi-factor authentication (SMS, TOTP)
- Password policy enforcement (12+ chars, complexity)
- Account lockout after 5 failed attempts
- Session timeout: 30 minutes idle, 8 hours maximum
- Refresh token rotation

**Endpoints:**

- POST `/auth/login` - User login
- POST `/auth/logout` - User logout
- POST `/auth/refresh` - Refresh access token
- POST `/auth/mfa/setup` - Configure MFA
- POST `/auth/mfa/verify` - Verify MFA code
- POST `/auth/password/reset` - Password reset request
- POST `/auth/password/change` - Change password

**Security:**

- Rate limiting: 5 login attempts per 15 minutes
- Secure password storage (bcrypt cost factor 12)
- Session stored in Redis with encryption
- Account lockout notification via email

---

#### 3.4.2 Patient Service

**Responsibility:** Patient registration, profile management, identity verification

**Technology Stack:**

- Node.js 20 LTS
- Express.js 4.18
- PostgreSQL client (pg)
- Sharp for image processing
- Joi for validation

**Key Features:**

- Patient registration workflow
- Identity verification via Verified.me
- Profile CRUD operations
- Address validation
- Consent management integration
- Health card validation

**Endpoints:**

- POST `/patients/register` - Register new patient
- GET `/patients/{id}` - Get patient profile
- PATCH `/patients/{id}` - Update patient profile
- GET `/patients/{id}/consents` - View consent history
- POST `/patients/{id}/verify` - Verify identity

**Data Validation:**

- Email format validation
- Phone number format (Canadian)
- Postal code validation
- Health card number format (Ontario OHIP)
- Date of birth range (must be at least 1 year old)

---

#### 3.4.3 Medical Records Service

**Responsibility:** Access to medical records, EHR integration, FHIR API

**Technology Stack:**

- Node.js 20 LTS
- Express.js 4.18
- HAPI FHIR library for HL7 FHIR R4
- PostgreSQL for structured data
- MongoDB for unstructured clinical notes

**Key Features:**

- Retrieve patient medical history
- View diagnoses and medications
- Access lab results
- View radiology reports
- Download medical documents
- Real-time EHR synchronization
- FHIR-compliant API

**Endpoints:**

- GET `/medical-records/patients/{id}` - Get all records
- GET `/medical-records/{recordId}` - Get specific record
- GET `/medical-records/patients/{id}/diagnoses` - Get diagnoses
- GET `/medical-records/patients/{id}/medications` - Get medications
- GET `/medical-records/patients/{id}/labs` - Get lab results
- GET `/fhir/Patient/{id}` - FHIR Patient resource
- GET `/fhir/Observation/{id}` - FHIR Observation resource

**EHR Integration:**

- Protocol: HL7 FHIR R4
- Authentication: Mutual TLS (mTLS) with client certificates
- Sync Frequency: Real-time via webhooks for new records
- Batch Sync: Daily at 2 AM for updates
- Error Handling: Retry with exponential backoff (max 5 attempts)

---

#### 3.4.4 Appointment Service

**Responsibility:** Appointment scheduling, reminders, availability management

**Technology Stack:**

- Node.js 20 LTS
- Express.js 4.18
- node-cron for scheduled jobs
- PostgreSQL for appointment data

**Key Features:**

- View provider availability
- Book appointments
- Reschedule appointments
- Cancel appointments
- Automated reminders (48h, 24h before)
- Waitlist management
- No-show tracking

**Endpoints:**

- GET `/appointments/availability` - Check provider availability
- POST `/appointments` - Book appointment
- GET `/appointments/patients/{id}` - Get patient appointments
- PATCH `/appointments/{id}` - Reschedule appointment
- DELETE `/appointments/{id}` - Cancel appointment
- GET `/appointments/{id}/reminders` - View reminder history

**Business Rules:**

- Appointments must be booked at least 2 hours in advance
- Cancellations allowed up to 24 hours before
- Automatic cancellation after 3 no-shows
- Maximum 5 appointments per patient per month (configurable)

---

#### 3.4.5 Messaging Service

**Responsibility:** Secure patient-provider messaging

**Technology Stack:**

- Node.js 20 LTS
- Express.js 4.18
- Socket.io for real-time messaging
- MongoDB for message storage
- crypto for end-to-end encryption

**Key Features:**

- Secure messaging threads
- File attachments (max 10MB)
- Read receipts
- Message archiving
- Search functionality
- Auto-reply for out-of-office

**Endpoints:**

- GET `/messages/threads` - Get conversation threads
- POST `/messages` - Send message
- GET `/messages/threads/{id}` - Get messages in thread
- PATCH `/messages/{id}/read` - Mark as read
- POST `/messages/{id}/attachments` - Upload attachment
- DELETE `/messages/{id}` - Delete message

**Security:**

- Messages encrypted at rest (AES-256)
- Encrypted attachments stored in Azure Blob Storage
- Messages auto-deleted after 2 years
- Virus scanning on all attachments (ClamAV)

---

#### 3.4.6 Notification Service

**Responsibility:** Email, SMS, and push notifications

**Technology Stack:**

- Node.js 20 LTS
- Bull queue for job processing
- Redis for queue storage
- Twilio for SMS
- SendGrid for email
- Firebase Cloud Messaging for push

**Key Features:**

- Multi-channel notifications
- User preferences management
- Notification templates
- Delivery tracking
- Retry logic for failed deliveries

**Notification Types:**

- Appointment reminders
- Lab results available
- Message received
- Password reset
- Account security alerts
- System maintenance notices

**Endpoints:**

- POST `/notifications/send` - Send notification
- GET `/notifications/preferences/{userId}` - Get preferences
- PATCH `/notifications/preferences/{userId}` - Update preferences
- GET `/notifications/history/{userId}` - Notification history

---

#### 3.4.7 Lab Results Service

**Responsibility:** Laboratory test results management

**Technology Stack:**

- Node.js 20 LTS
- Express.js 4.18
- HL7 v2.5 parser for lab integrations
- PostgreSQL for results data

**Key Features:**

- Receive lab results from external labs
- Notify patients of new results
- Display results with reference ranges
- Trend analysis and visualization
- PDF report generation

**Endpoints:**

- GET `/lab-results/patients/{id}` - Get patient lab results
- GET `/lab-results/{resultId}` - Get specific result
- GET `/lab-results/{resultId}/pdf` - Download PDF report
- GET `/lab-results/patients/{id}/trends` - Trend data

**Lab Integrations:**

- LifeLabs Canada (HL7 v2.5 over HTTPS)
- Dynacare (HL7 v2.5 over HTTPS)
- Hospital lab systems (HL7 FHIR)

---

#### 3.4.8 Consent Service

**Responsibility:** Consent management and tracking

**Technology Stack:**

- Node.js 20 LTS
- Express.js 4.18
- PostgreSQL for consent records

**Key Features:**

- Consent collection and storage
- Version control for consent documents
- Consent withdrawal
- Audit trail for all consent actions
- Reminder for expired consents

**Endpoints:**

- GET `/consents/patients/{id}` - Get patient consents
- POST `/consents` - Record new consent
- PATCH `/consents/{id}/withdraw` - Withdraw consent
- GET `/consents/versions` - Get consent document versions

**Consent Types:**

- Terms of Service
- Privacy Policy
- Data Sharing (research)
- Marketing communications
- Third-party data sharing

---

#### 3.4.9 Audit Service

**Responsibility:** Comprehensive audit logging for compliance

**Technology Stack:**

- Node.js 20 LTS
- Express.js 4.18
- PostgreSQL for audit logs
- Elasticsearch for log search and analytics

**Key Features:**

- Log all PHI access
- User action tracking
- System event logging
- Real-time alerting for suspicious activity
- Compliance reports generation
- SIEM integration

**Logged Events:**

- User login/logout
- PHI view/access
- Record creation/update/deletion
- Permission changes
- System configuration changes
- Failed authentication attempts
- Export/download of data

**Endpoints:**

- POST `/audit/log` - Create audit entry
- GET `/audit/logs` - Query audit logs
- GET `/audit/reports/compliance` - Compliance report
- GET `/audit/reports/access` - Access report for patient

**Retention:** 7 years (PHIPA requirement)

---

### 3.5 Data Layer

#### 3.5.1 PostgreSQL Database

**Version:** PostgreSQL 15.x  
**Configuration:** High Availability with automatic failover

**Database Clusters:**

1. **Primary Database (Canada Central)**

   - Master for all write operations
   - Read operations distributed across replicas
   - Connection pooling: PgBouncer (max 100 connections)

2. **Standby Database (Canada East)**
   - Streaming replication (synchronous)
   - Automatic promotion on primary failure
   - RPO: 0 seconds, RTO: 4 hours

**Performance Optimization:**

- Indexes on frequently queried columns
- Partitioning for audit_logs table (monthly partitions)
- Query optimization with EXPLAIN ANALYZE
- Connection pooling to reduce overhead
- Read replicas for reporting queries

**Backup Strategy:**

- Full backup: Daily at 2 AM EST
- Incremental backups: Every 6 hours
- Transaction log archiving: Continuous
- Backup retention: 30 days online, 7 years archived
- Backup testing: Monthly restore verification

---

#### 3.5.2 MongoDB

**Version:** MongoDB 6.x  
**Purpose:** Document storage for unstructured data

**Collections:**

- Clinical notes (text documents)
- Medical images metadata
- Message attachments metadata
- System logs

**Configuration:**

- Replica set with 3 nodes
- Automatic failover
- TLS/SSL encryption
- Role-based access control

---

#### 3.5.3 Redis Cluster

**Version:** Redis 7.x  
**Purpose:** Caching and session storage

**Use Cases:**

- User session data
- JWT token blacklist (for logout)
- API response caching
- Rate limiting counters
- Real-time analytics

**Configuration:**

- Cluster mode with 6 nodes (3 master, 3 replica)
- Automatic failover
- TLS encryption
- Password authentication
- Data persistence: AOF (Append-Only File)
- Eviction policy: allkeys-lru

---

#### 3.5.4 Azure Blob Storage

**Purpose:** Object storage for files and medical images

**Containers:**

- `medical-images`: Radiology images, scans
- `lab-reports`: PDF lab reports
- `attachments`: Message attachments
- `exports`: Patient data exports
- `backups`: Database backups

**Security:**

- Storage encryption (Microsoft-managed keys)
- Shared Access Signatures (SAS) for time-limited access
- Private endpoints (no public access)
- Immutable storage for backups
- Soft delete enabled (30-day retention)

---

### 3.6 Integration Layer

#### 3.6.1 EHR Integration Service

**Purpose:** Bidirectional integration with Epic EHR system

**Integration Method:**

- Protocol: HL7 FHIR R4
- Authentication: Mutual TLS with client certificates
- Authorization: OAuth 2.0 with private_key_jwt

**Integrated Resources:**

- Patient demographics
- Encounters
- Observations (lab results, vitals)
- Medications
- Allergies
- Conditions (diagnoses)
- Procedures
- Appointments

**Sync Strategy:**

- Real-time: Webhooks for new records
- Batch: Daily sync at 2 AM for updates
- On-demand: Patient-initiated refresh

**Error Handling:**

- Retry with exponential backoff
- Dead letter queue for failed messages
- Alert on-call team after 5 failed attempts
- Manual reconciliation process

---

#### 3.6.2 Laboratory System Integration

**Labs Integrated:**

- LifeLabs
- Dynacare
- Local hospital labs

**Protocol:** HL7 v2.5 messages over HTTPS

**Message Types:**

- ORU^R01: Unsolicited observation results
- ORM^O01: Order message
- ACK: Acknowledgment

**Processing:**

1. Lab sends ORU message
2. HL7 parser extracts data
3. Data validation and transformation
4. Store in lab_results table
5. Trigger notification to patient
6. Send acknowledgment to lab

---

#### 3.6.3 Identity Verification (Verified.me)

**Purpose:** Identity verification during registration

**Integration:**

- RESTful API
- OAuth 2.0 authentication
- Data shared: Name, DOB, Address (temporary)
- Verification level: LOA3 (Level of Assurance 3)

**Flow:**

1. Patient initiates verification
2. Redirect to Verified.me
3. Patient authenticates with banking credentials
4. Verified.me returns verified attributes
5. System matches with registration data
6. Account approved or manual review required

---

#### 3.6.4 Notification Services Integration

**Twilio (SMS):**

- Appointment reminders
- MFA codes
- Security alerts
- Canadian phone numbers only
- Message encryption in transit

**SendGrid (Email):**

- Appointment confirmations
- Lab result notifications
- Password resets
- Marketing (with consent)
- DKIM and SPF configured
- No PHI in email body

**Firebase Cloud Messaging (Push):**

- Mobile app notifications
- Real-time message alerts
- Appointment reminders
- Certificate pinning for security

---

## 4. Security Architecture

### 4.1 Network Security

- **Virtual Network (VNet):** Isolated network in Azure
- **Subnets:** Separate subnets for web tier, application tier, data tier
- **Network Security Groups (NSG):** Firewall rules for each subnet
- **Private Endpoints:** Database access only through private network
- **VPN Gateway:** Secure admin access
- **Azure Firewall:** Centralized network security

### 4.2 Identity and Access Management

- **Azure Active Directory B2C:** Patient identity management
- **Azure AD:** Provider and admin identity management
- **RBAC (Role-Based Access Control):** Fine-grained permissions
- **Privileged Identity Management (PIM):** Just-in-time admin access
- **Conditional Access:** MFA required for admin access

### 4.3 Data Protection

- **Encryption at Rest:** AES-256 for all data
- **Encryption in Transit:** TLS 1.3 for all communications
- **Key Management:** Azure Key Vault with HSM backing
- **Data Classification:** Automated tagging of PHI
- **Data Loss Prevention (DLP):** Policies to prevent PHI exfiltration

### 4.4 Application Security

- **OWASP Top 10 Compliance:** Regular testing
- **Static Application Security Testing (SAST):** SonarQube
- **Dynamic Application Security Testing (DAST):** OWASP ZAP
- **Dependency Scanning:** Snyk for vulnerable libraries
- **Secrets Management:** No hardcoded secrets, Key Vault integration

### 4.5 Monitoring and Detection

- **Azure Sentinel (SIEM):** Security information and event management
- **Azure Security Center:** Threat detection
- **Log Analytics:** Centralized logging
- **Application Insights:** Application performance monitoring
- **Security Alerts:** Real-time alerts for suspicious activity

---

## 5. Compliance and Governance

### 5.1 PHIPA Compliance

- **Lawful Collection:** Section 29(1) authority
- **Consent Management:** Explicit consent tracking
- **Access Controls:** Need-to-know principle
- **Audit Trails:** 7-year retention
- **Breach Notification:** 72-hour requirement
- **Patient Rights:** Access, correction, withdrawal

### 5.2 PIPEDA Compliance

- **Privacy Principles:** All 10 principles implemented
- **Consent:** Clear and understandable
- **Purpose Limitation:** Data used only for stated purposes
- **Retention Limits:** Defined retention periods
- **Safeguards:** Appropriate security measures

### 5.3 ISO 27001

- **Information Security Management System (ISMS)**
- **Risk Assessment:** Annual comprehensive assessment
- **Security Controls:** Implemented and documented
- **Continuous Improvement:** Regular reviews

### 5.4 SOC 2 Type II

- **Security:** Logical and physical access controls
- **Availability:** 99.9% uptime
- **Processing Integrity:** Accurate and timely processing
- **Confidentiality:** Protection of confidential information
- **Privacy:** PHIPA and PIPEDA compliance

---

## 6. Disaster Recovery and Business Continuity

### 6.1 Backup Strategy

- **Database Backups:**
  - Full: Daily
  - Incremental: Every 6 hours
  - Transaction logs: Continuous
  - Retention: 30 days online, 7 years archived
- **File Backups:**
  - Daily backups of Blob Storage
  - Geo-redundant storage (Canada Central and Canada East)
  - Retention: 7 years

### 6.2 Disaster Recovery

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 1 hour
- **Secondary Region:** Canada East
- **Failover Strategy:** Automated DNS failover
- **Testing:** Quarterly DR drills

### 6.3 High Availability

- **Application Tier:** Multiple instances with auto-scaling
- **Database Tier:** Synchronous replication
- **Load Balancing:** Azure Front Door
- **Health Checks:** Every 30 seconds
- **Auto-healing:** Automatic restart of failed instances

---

## 7. Performance and Scalability

### 7.1 Performance Targets

- **Page Load Time:** < 2 seconds (p95)
- **API Response Time:** < 500ms (p95)
- **Database Query Time:** < 100ms (p95)
- **Availability:** 99.9% uptime

### 7.2 Scalability Strategy

- **Horizontal Scaling:** Auto-scale groups for services
- **Vertical Scaling:** Database upgrades as needed
- **Caching:** Redis for frequently accessed data
- **CDN:** Static asset delivery
- **Database Optimization:** Indexing, query optimization

### 7.3 Capacity Planning

- **Expected Load:**
  - 150,000 registered patients
  - 50,000 active users/month
  - 10,000 concurrent users (peak)
  - 500 appointments/day
  - 2,000 messages/day

---

## 8. Deployment and DevOps

### 8.1 CI/CD Pipeline

- **Source Control:** GitHub
- **CI/CD:** Azure DevOps Pipelines
- **Build:** Automated on every commit
- **Testing:** Unit, integration, security tests
- **Deployment:** Blue-green deployment strategy
- **Rollback:** Automated rollback on failure

### 8.2 Environments

- **Development:** Developer workstations, sandbox Azure
- **Testing:** Integrated testing environment
- **Staging:** Production-like environment
- **Production:** Live environment (Canada Central primary)

### 8.3 Infrastructure as Code

- **Tool:** Terraform
- **Version Control:** All infrastructure code in Git
- **Change Management:** Pull request reviews required
- **State Management:** Remote state in Azure Storage

---

## 9. Monitoring and Observability

### 9.1 Application Monitoring

- **Application Insights:** Performance metrics, errors, dependencies
- **Custom Metrics:** Business KPIs (appointments booked, logins, etc.)
- **Distributed Tracing:** End-to-end request tracing
- **Real-time Dashboards:** Grafana visualization

### 9.2 Infrastructure Monitoring

- **Azure Monitor:** Resource metrics (CPU, memory, disk, network)
- **Log Analytics:** Centralized log aggregation
- **Alerts:** Proactive alerts for anomalies
- **On-call Rotation:** PagerDuty integration

### 9.3 Security Monitoring

- **Azure Sentinel:** SIEM for security events
- **Threat Intelligence:** Integration with threat feeds
- **Incident Response:** Automated playbooks
- **Compliance Dashboards:** Real-time compliance status

---

## 10. Cost Optimization

### 10.1 Azure Cost Management

- **Resource Tagging:** Cost allocation by service
- **Right-sizing:** Regular review of resource utilization
- **Reserved Instances:** 3-year commitment for predictable workloads
- **Auto-shutdown:** Non-production environments shutdown after hours
- **Spot Instances:** For non-critical batch jobs

### 10.2 Estimated Monthly Costs (CAD)

- **Compute (AKS):** $8,000
- **Database (PostgreSQL):** $5,000
- **Storage (Blob):** $2,000
- **Networking (Front Door, CDN):** $3,000
- **Monitoring (Sentinel, Insights):** $2,000
- **Backup and DR:** $1,500
- **Third-party Services (Twilio, SendGrid):** $1,000
- **Total Estimated:** $22,500/month

---

**Document Classification:** Confidential  
**Last Updated:** December 9, 2025  
**Next Review:** June 9, 2026  
**Document Owner:** Jennifer Liu, Senior Solutions Architect
