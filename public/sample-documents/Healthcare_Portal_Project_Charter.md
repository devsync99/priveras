# Healthcare Portal Modernization Project

## Project Charter Document

**Document Version:** 2.0  
**Date:** December 9, 2025  
**Project ID:** HCP-2025-001  
**Classification:** Confidential

---

## 1. Executive Summary

The Healthcare Portal Modernization Project aims to transform the existing legacy patient portal system into a modern, secure, and user-friendly digital platform. This initiative will enable patients to access their medical records, book appointments, view test results, and communicate with healthcare providers through a secure online portal.

**Project Duration:** 18 months  
**Estimated Budget:** $2.5 million CAD  
**Project Sponsor:** Dr. Sarah Johnson, Chief Medical Information Officer  
**Project Manager:** Michael Chen, Digital Transformation Lead

---

## 2. Project Background and Justification

### 2.1 Current State

The existing patient portal was implemented in 2010 and has become outdated, with frequent security vulnerabilities and poor user experience. Current system limitations include:

- No mobile responsiveness
- Limited integration with Electronic Health Records (EHR)
- Outdated security protocols (TLS 1.0)
- Manual appointment booking process
- No real-time test result notifications
- Poor accessibility compliance

### 2.2 Business Drivers

- **Patient Satisfaction:** Current portal has a satisfaction rating of 42%
- **Security Compliance:** Must comply with PHIPA (Personal Health Information Protection Act) and PIPEDA
- **Digital Transformation:** Aligns with provincial healthcare digitization strategy
- **Cost Reduction:** Reduce administrative burden by 30%
- **Accessibility:** Meet WCAG 2.1 AA standards

---

## 3. Project Scope

### 3.1 In Scope

- Modern web-based patient portal with mobile-responsive design
- Integration with existing EHR system (Epic)
- Secure patient authentication using multi-factor authentication (MFA)
- Appointment booking and management
- Access to medical records and test results
- Secure messaging with healthcare providers
- Prescription renewal requests
- Health education resources
- Patient consent management system
- PHIPA-compliant data storage and transmission

### 3.2 Out of Scope

- Replacement of existing EHR system
- Telemedicine video consultation features (Phase 2)
- Integration with pharmacy systems (Phase 2)
- Billing and payment processing (Phase 3)

---

## 4. Stakeholders

### 4.1 Primary Stakeholders

- **Patients:** 150,000 registered patients
- **Healthcare Providers:** 450 physicians, 1,200 nurses
- **Administrative Staff:** 200 staff members
- **IT Department:** 25 IT professionals
- **Privacy Office:** Privacy Officer and compliance team

### 4.2 Regulatory Bodies

- Ontario Information and Privacy Commissioner
- Health Canada
- College of Physicians and Surgeons of Ontario

---

## 5. Personal Information Collected

### 5.1 Patient Identity Data

- Full legal name (first, middle, last)
- Date of birth
- Gender identity
- Health card number (Ontario Health Insurance Plan)
- Driver's license number (for identity verification)
- Social Insurance Number (optional, for billing)
- Current residential address
- Mailing address (if different)
- Email address
- Primary phone number
- Secondary/emergency contact phone number

### 5.2 Medical Information (Personal Health Information)

- Medical history and diagnoses
- Current medications and prescriptions
- Allergies and adverse reactions
- Laboratory test results
- Radiology reports and images
- Physician consultation notes
- Vaccination records
- Family medical history
- Mental health assessments
- Surgical history
- Vital signs and measurements (blood pressure, weight, height, BMI)

### 5.3 Authentication and System Data

- Username and password (encrypted)
- Security questions and answers
- Multi-factor authentication tokens
- Login timestamps and IP addresses
- Session logs and activity history
- Device information (browser type, operating system)
- Failed login attempts
- Password reset history

### 5.4 Communication Data

- Secure messages with healthcare providers
- Appointment booking requests and confirmations
- Notification preferences (email, SMS, push notifications)
- Consent records and acknowledgments
- Survey responses and feedback

---

## 6. Legal and Regulatory Framework

### 6.1 Applicable Legislation

- **Personal Health Information Protection Act (PHIPA), 2004**
  - Authority for collection: Section 29(1) - Collection of PHI
  - Consent requirements: Section 18-25
  - Retention: Section 10-11
- **Personal Information Protection and Electronic Documents Act (PIPEDA)**

  - Applies to commercial activities
  - Privacy principles compliance

- **Freedom of Information and Protection of Privacy Act (FIPPA)**
  - Public sector privacy obligations
  - Access and correction rights

### 6.2 Compliance Standards

- ISO 27001 Information Security Management
- SOC 2 Type II compliance
- WCAG 2.1 AA accessibility standards
- OWASP Top 10 security practices

---

## 7. System Architecture Overview

### 7.1 Technology Stack

- **Frontend:** React.js 18, Next.js 14, TypeScript
- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL 15 (primary), MongoDB (document storage)
- **Cache:** Redis for session management
- **Authentication:** OAuth 2.0 with OIDC, SAML 2.0 for SSO
- **API Gateway:** Kong API Gateway
- **Message Queue:** RabbitMQ for async processing

### 7.2 Infrastructure

- **Cloud Provider:** Microsoft Azure (Canadian data centers - Toronto and Quebec)
- **Hosting:** Azure Kubernetes Service (AKS)
- **CDN:** Azure CDN for static content delivery
- **Backup:** Automated daily backups with 7-year retention
- **Disaster Recovery:** Multi-region failover capability (RTO: 4 hours, RPO: 1 hour)

### 7.3 Security Architecture

- **Encryption at Rest:** AES-256 encryption for all PHI
- **Encryption in Transit:** TLS 1.3 for all communications
- **Network Security:** Virtual Private Network (VPN), Network Security Groups
- **Identity Management:** Azure Active Directory integration
- **Access Control:** Role-Based Access Control (RBAC)
- **Audit Logging:** Comprehensive audit trails for all PHI access
- **Vulnerability Management:** Quarterly penetration testing
- **SIEM:** Azure Sentinel for security monitoring

---

## 8. Data Flow and Processing

### 8.1 Patient Registration Flow

1. Patient accesses portal via web browser or mobile app
2. Patient selects "Register" option
3. Identity verification via Ontario health card number
4. Secondary verification via driver's license scan (OCR processing)
5. Email verification with secure token
6. Multi-factor authentication setup (SMS or authenticator app)
7. Account creation with encrypted credentials
8. Consent acceptance for data collection and processing
9. Account activation confirmation

### 8.2 Medical Records Access Flow

1. Patient logs in with username/password + MFA
2. Authentication service validates credentials
3. Session token generated with 30-minute timeout
4. Patient requests medical records
5. API call to EHR integration service
6. Authorization check (patient owns the records)
7. Records retrieved from EHR database
8. Data encryption layer applied
9. Records transmitted to frontend via HTTPS
10. Audit log entry created with timestamp, user ID, and accessed records
11. Records displayed in patient portal

### 8.3 Appointment Booking Flow

1. Patient selects "Book Appointment"
2. System displays available physicians and time slots
3. Patient selects preferred date/time
4. System checks availability in scheduling database
5. Temporary hold placed on time slot (5 minutes)
6. Patient confirms appointment
7. Appointment created in EHR system
8. Confirmation notification sent via email/SMS
9. Appointment added to patient's calendar
10. Reminder notifications scheduled (48 hours and 24 hours before)

### 8.4 Data Sharing and Disclosure

- **Healthcare Provider Access:** Authorized physicians and nurses can access patient records through role-based permissions
- **Emergency Access:** Break-glass functionality for emergency situations with enhanced audit logging
- **Third-Party Labs:** Encrypted data transmission to integrated laboratory systems
- **Health Information Custodians:** Data sharing agreements with authorized HICs
- **Patient Consent:** Explicit consent required for data sharing beyond circle of care
- **Research:** Anonymized data may be used for research with ethics board approval

---

## 9. Privacy and Security Measures

### 9.1 Access Controls

- **Principle of Least Privilege:** Users granted minimum necessary access
- **Role-Based Access Control:**
  - Patient role: Own records only
  - Physician role: Assigned patients only
  - Nurse role: Limited access based on care assignment
  - Administrator role: System configuration only (no PHI access)
  - Privacy Officer role: Audit logs and compliance reports

### 9.2 Data Minimization

- Only essential personal information collected
- Optional fields clearly marked
- Data retention policies enforced:
  - Active patient records: Indefinite (as required by PHIPA)
  - Audit logs: 7 years
  - Session logs: 90 days
  - Temporary files: 24 hours

### 9.3 Patient Rights

- **Access:** Patients can view and download all their records
- **Correction:** Patients can request corrections to their information
- **Withdrawal:** Patients can request account closure (with 30-day retention for legal purposes)
- **Consent Management:** Granular consent controls for different types of data usage
- **Data Portability:** Export records in machine-readable format (HL7 FHIR)

### 9.4 Breach Response Plan

1. Detection and containment within 1 hour
2. Investigation and assessment within 24 hours
3. Notification to Privacy Officer immediately
4. Notification to affected individuals within 72 hours (as per PHIPA)
5. Notification to Information and Privacy Commissioner if required
6. Remediation and prevention measures implemented
7. Post-incident review and documentation

---

## 10. Third-Party Vendors and Data Processors

### 10.1 Cloud Service Provider

- **Vendor:** Microsoft Azure
- **Services:** Infrastructure hosting, database services, identity management
- **Data Location:** Canadian data centers only (Toronto and Quebec)
- **Compliance:** SOC 2 Type II, ISO 27001, PHIPA-compliant
- **Contract:** Data Processing Agreement (DPA) in place

### 10.2 SMS Notification Service

- **Vendor:** Twilio Canada
- **Service:** SMS notifications for appointments and alerts
- **Data Shared:** Phone number, first name, appointment date/time (no PHI details)
- **Data Location:** Canadian servers
- **Compliance:** PIPEDA-compliant

### 10.3 Email Service Provider

- **Vendor:** SendGrid (Twilio)
- **Service:** Transactional emails
- **Data Shared:** Email address, first name (no PHI in email body)
- **Encryption:** TLS in transit, encrypted at rest
- **Compliance:** PIPEDA-compliant

### 10.4 Identity Verification Service

- **Vendor:** Verified.me
- **Service:** Identity verification during registration
- **Data Shared:** Name, date of birth, address (temporary, not stored)
- **Compliance:** PIPEDA-compliant, Canadian company

---

## 11. Risk Assessment Summary

### 11.1 Privacy Risks

| Risk                             | Likelihood | Impact   | Mitigation                                         |
| -------------------------------- | ---------- | -------- | -------------------------------------------------- |
| Unauthorized PHI disclosure      | Medium     | Critical | MFA, encryption, RBAC, audit logging               |
| Data breach via external attack  | Medium     | Critical | Penetration testing, SIEM, WAF, IDS/IPS            |
| Insider threat (employee access) | Low        | High     | Background checks, access logging, least privilege |
| Third-party vendor breach        | Low        | High     | DPAs, vendor assessments, data minimization        |
| Patient identity theft           | Low        | High     | Strong authentication, identity verification       |
| Lost/stolen patient devices      | Medium     | Medium   | Session timeouts, remote logout capability         |
| Inadequate consent management    | Low        | Medium   | Clear consent flows, audit trails                  |
| Data retention non-compliance    | Low        | Medium   | Automated retention policies, regular audits       |

### 11.2 Security Controls

- Web Application Firewall (WAF)
- Intrusion Detection/Prevention System (IDS/IPS)
- DDoS protection
- Regular security assessments and penetration testing
- Security awareness training for all staff
- Incident response team and procedures
- Business continuity and disaster recovery plans
- Annual privacy audits

---

## 12. Project Timeline

### Phase 1: Planning and Design (Months 1-4)

- Requirements gathering
- Privacy Impact Assessment
- Security Threat and Risk Assessment
- System design and architecture
- Vendor selection and procurement

### Phase 2: Development (Months 5-10)

- Frontend development
- Backend API development
- EHR integration
- Security implementation
- Accessibility compliance

### Phase 3: Testing (Months 11-14)

- Unit testing
- Integration testing
- Security testing and penetration testing
- User acceptance testing
- Privacy compliance review

### Phase 4: Deployment (Months 15-16)

- Pilot launch with 1,000 patients
- Monitoring and optimization
- Staff training
- Documentation finalization

### Phase 5: Full Launch (Months 17-18)

- Phased rollout to all patients
- Post-launch support
- Continuous monitoring
- Lessons learned documentation

---

## 13. Success Metrics

- **Patient Adoption:** 60% of registered patients using portal within 12 months
- **Patient Satisfaction:** Increase satisfaction rating from 42% to 80%
- **Security:** Zero PHI breaches
- **Availability:** 99.9% uptime
- **Performance:** Page load time under 2 seconds
- **Accessibility:** WCAG 2.1 AA compliance score of 100%
- **Administrative Efficiency:** 30% reduction in phone-based appointment bookings

---

## 14. Approval and Sign-off

**Project Sponsor:**  
Dr. Sarah Johnson, Chief Medical Information Officer  
Date: ******\_\_\_******

**Privacy Officer:**  
Maria Rodriguez, Privacy and Compliance Officer  
Date: ******\_\_\_******

**Chief Information Security Officer:**  
David Park, CISO  
Date: ******\_\_\_******

**Project Manager:**  
Michael Chen, Digital Transformation Lead  
Date: ******\_\_\_******

---

**Document Control:**

- Last Updated: December 9, 2025
- Next Review: March 9, 2026
- Document Owner: Michael Chen
- Classification: Confidential
- Version History: v1.0 (May 2025), v2.0 (December 2025)

---

_This document contains confidential information and is intended for authorized personnel only. Unauthorized distribution or disclosure is strictly prohibited._
