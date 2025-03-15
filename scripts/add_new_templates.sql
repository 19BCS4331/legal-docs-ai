-- Add new document templates to enhance the application
-- This script adds a variety of legal document templates for different user plans

-- 1. Free Plan Templates

-- Privacy Policy Template
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Privacy Policy',
  'A comprehensive privacy policy for websites and applications',
  'Website Legal',
  'Create a comprehensive Privacy Policy for {company_name} with the following details: Website/App Name: {website_name}, Data Collection: {data_collection}, Data Usage: {data_usage}, User Rights: {user_rights}. Include standard clauses for cookies, third-party sharing, security measures, and compliance with relevant regulations.',
  '{
    "company_name": {
      "type": "string",
      "label": "Company Name",
      "required": true
    },
    "website_name": {
      "type": "string",
      "label": "Website/App Name",
      "required": true
    },
    "data_collection": {
      "type": "text",
      "label": "Data Collection Practices",
      "required": true
    },
    "data_usage": {
      "type": "text",
      "label": "How Data Will Be Used",
      "required": true
    },
    "user_rights": {
      "type": "text",
      "label": "User Rights Regarding Data",
      "required": true
    }
  }',
  ARRAY['free', 'pro', 'enterprise'],
  NOW(),
  NOW()
);

-- Terms of Service Template
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Terms of Service',
  'Standard terms of service agreement for websites and applications',
  'Website Legal',
  'Create a comprehensive Terms of Service agreement for {company_name} with the following details: Website/App Name: {website_name}, Services Provided: {services}, User Responsibilities: {user_responsibilities}, Termination Conditions: {termination_conditions}. Include standard clauses for intellectual property, limitation of liability, governing law, and dispute resolution.',
  '{
    "company_name": {
      "type": "string",
      "label": "Company Name",
      "required": true
    },
    "website_name": {
      "type": "string",
      "label": "Website/App Name",
      "required": true
    },
    "services": {
      "type": "text",
      "label": "Services Provided",
      "required": true
    },
    "user_responsibilities": {
      "type": "text",
      "label": "User Responsibilities",
      "required": true
    },
    "termination_conditions": {
      "type": "text",
      "label": "Termination Conditions",
      "required": true
    }
  }',
  ARRAY['free', 'pro', 'enterprise'],
  NOW(),
  NOW()
);

-- Mutual NDA Template
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Mutual Non-Disclosure Agreement',
  'A bilateral confidentiality agreement between two parties',
  'Confidentiality',
  'Create a Mutual Non-Disclosure Agreement with the following details: Party A: {party_a_name}, Party B: {party_b_name}, Purpose: {purpose}, Duration: {duration}, Jurisdiction: {jurisdiction}. Include standard clauses for mutual protection of confidential information, permitted disclosures, return of information, and remedies for breach.',
  '{
    "party_a_name": {
      "type": "string",
      "label": "First Party Name",
      "required": true
    },
    "party_b_name": {
      "type": "string",
      "label": "Second Party Name",
      "required": true
    },
    "purpose": {
      "type": "text",
      "label": "Purpose of Information Exchange",
      "required": true
    },
    "duration": {
      "type": "string",
      "label": "Agreement Duration",
      "required": true
    },
    "jurisdiction": {
      "type": "string",
      "label": "Governing Jurisdiction",
      "required": true
    }
  }',
  ARRAY['free', 'pro', 'enterprise'],
  NOW(),
  NOW()
);

-- 2. Pro Plan Templates

-- Independent Contractor Agreement
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Independent Contractor Agreement',
  'A contract for hiring independent contractors or freelancers',
  'Employment',
  'Create an Independent Contractor Agreement with the following details: Client: {client_name}, Contractor: {contractor_name}, Services: {services_description}, Payment Terms: {payment_terms}, Project Timeline: {timeline}, Intellectual Property: {ip_ownership}. Include standard clauses for contractor status, taxes, termination, confidentiality, and non-solicitation.',
  '{
    "client_name": {
      "type": "string",
      "label": "Client Name",
      "required": true
    },
    "contractor_name": {
      "type": "string",
      "label": "Contractor Name",
      "required": true
    },
    "services_description": {
      "type": "text",
      "label": "Description of Services",
      "required": true
    },
    "payment_terms": {
      "type": "text",
      "label": "Payment Terms",
      "required": true
    },
    "timeline": {
      "type": "text",
      "label": "Project Timeline",
      "required": true
    },
    "ip_ownership": {
      "type": "text",
      "label": "Intellectual Property Ownership",
      "required": true
    }
  }',
  ARRAY['pro', 'enterprise'],
  NOW(),
  NOW()
);

-- Software License Agreement
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Software License Agreement',
  'A contract governing the use and distribution of software',
  'Intellectual Property',
  'Create a Software License Agreement with the following details: Licensor: {licensor_name}, Licensee: {licensee_name}, Software: {software_name}, License Type: {license_type}, License Fee: {license_fee}, Term: {term}. Include standard clauses for grant of rights, restrictions, warranties, support, termination, and liability limitations.',
  '{
    "licensor_name": {
      "type": "string",
      "label": "Licensor Name",
      "required": true
    },
    "licensee_name": {
      "type": "string",
      "label": "Licensee Name",
      "required": true
    },
    "software_name": {
      "type": "string",
      "label": "Software Name",
      "required": true
    },
    "license_type": {
      "type": "string",
      "label": "License Type",
      "required": true
    },
    "license_fee": {
      "type": "string",
      "label": "License Fee",
      "required": true
    },
    "term": {
      "type": "string",
      "label": "License Term",
      "required": true
    }
  }',
  ARRAY['pro', 'enterprise'],
  NOW(),
  NOW()
);

-- Partnership Agreement
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Partnership Agreement',
  'A contract establishing a business partnership between two or more parties',
  'Business Formation',
  'Create a Partnership Agreement with the following details: Partnership Name: {partnership_name}, Partners: {partners_list}, Business Purpose: {business_purpose}, Capital Contributions: {capital_contributions}, Profit Sharing: {profit_sharing}, Management Structure: {management}. Include standard clauses for decision making, partner duties, addition/withdrawal of partners, dispute resolution, and dissolution.',
  '{
    "partnership_name": {
      "type": "string",
      "label": "Partnership Name",
      "required": true
    },
    "partners_list": {
      "type": "text",
      "label": "List of Partners",
      "required": true
    },
    "business_purpose": {
      "type": "text",
      "label": "Business Purpose",
      "required": true
    },
    "capital_contributions": {
      "type": "text",
      "label": "Capital Contributions",
      "required": true
    },
    "profit_sharing": {
      "type": "text",
      "label": "Profit Sharing Arrangement",
      "required": true
    },
    "management": {
      "type": "text",
      "label": "Management Structure",
      "required": true
    }
  }',
  ARRAY['pro', 'enterprise'],
  NOW(),
  NOW()
);

-- 3. Enterprise Plan Templates

-- Merger & Acquisition Agreement
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Merger & Acquisition Agreement',
  'A comprehensive agreement for business mergers and acquisitions',
  'Corporate',
  'Create a Merger & Acquisition Agreement with the following details: Acquiring Company: {acquirer_name}, Target Company: {target_name}, Transaction Type: {transaction_type}, Purchase Price: {purchase_price}, Payment Structure: {payment_structure}, Closing Date: {closing_date}. Include standard clauses for representations and warranties, conditions to closing, covenants, indemnification, and post-closing obligations.',
  '{
    "acquirer_name": {
      "type": "string",
      "label": "Acquiring Company Name",
      "required": true
    },
    "target_name": {
      "type": "string",
      "label": "Target Company Name",
      "required": true
    },
    "transaction_type": {
      "type": "string",
      "label": "Transaction Type (Merger/Acquisition)",
      "required": true
    },
    "purchase_price": {
      "type": "string",
      "label": "Purchase Price",
      "required": true
    },
    "payment_structure": {
      "type": "text",
      "label": "Payment Structure",
      "required": true
    },
    "closing_date": {
      "type": "date",
      "label": "Expected Closing Date",
      "required": true
    }
  }',
  ARRAY['enterprise'],
  NOW(),
  NOW()
);

-- Venture Capital Financing Agreement
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Venture Capital Financing Agreement',
  'A financing agreement for startups seeking venture capital investment',
  'Corporate',
  'Create a Venture Capital Financing Agreement with the following details: Company: {company_name}, Investor(s): {investors}, Investment Amount: {investment_amount}, Equity Percentage: {equity_percentage}, Valuation: {valuation}, Investment Terms: {investment_terms}. Include standard clauses for representations and warranties, investor rights, board composition, information rights, and exit provisions.',
  '{
    "company_name": {
      "type": "string",
      "label": "Company Name",
      "required": true
    },
    "investors": {
      "type": "text",
      "label": "Investor Names",
      "required": true
    },
    "investment_amount": {
      "type": "string",
      "label": "Investment Amount",
      "required": true
    },
    "equity_percentage": {
      "type": "string",
      "label": "Equity Percentage",
      "required": true
    },
    "valuation": {
      "type": "string",
      "label": "Company Valuation",
      "required": true
    },
    "investment_terms": {
      "type": "text",
      "label": "Special Investment Terms",
      "required": true
    }
  }',
  ARRAY['enterprise'],
  NOW(),
  NOW()
);

-- Intellectual Property Assignment
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Intellectual Property Assignment',
  'An agreement for transferring intellectual property rights',
  'Intellectual Property',
  'Create an Intellectual Property Assignment Agreement with the following details: Assignor: {assignor_name}, Assignee: {assignee_name}, IP Description: {ip_description}, Assignment Scope: {assignment_scope}, Consideration: {consideration}, Effective Date: {effective_date}. Include standard clauses for representations and warranties, further assurances, indemnification, and governing law.',
  '{
    "assignor_name": {
      "type": "string",
      "label": "Assignor Name",
      "required": true
    },
    "assignee_name": {
      "type": "string",
      "label": "Assignee Name",
      "required": true
    },
    "ip_description": {
      "type": "text",
      "label": "Intellectual Property Description",
      "required": true
    },
    "assignment_scope": {
      "type": "text",
      "label": "Scope of Assignment",
      "required": true
    },
    "consideration": {
      "type": "string",
      "label": "Consideration",
      "required": true
    },
    "effective_date": {
      "type": "date",
      "label": "Effective Date",
      "required": true
    }
  }',
  ARRAY['enterprise'],
  NOW(),
  NOW()
);

-- Commercial Lease Agreement
INSERT INTO document_templates (id, name, description, category, prompt_template, required_fields, available_in_plan, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Commercial Lease Agreement',
  'A comprehensive lease agreement for commercial properties',
  'Real Estate',
  'Create a Commercial Lease Agreement with the following details: Landlord: {landlord_name}, Tenant: {tenant_name}, Property Address: {property_address}, Lease Term: {lease_term}, Monthly Rent: {monthly_rent}, Security Deposit: {security_deposit}, Permitted Use: {permitted_use}. Include standard clauses for maintenance responsibilities, utilities, insurance, default, assignment and subletting, and renewal options.',
  '{
    "landlord_name": {
      "type": "string",
      "label": "Landlord Name",
      "required": true
    },
    "tenant_name": {
      "type": "string",
      "label": "Tenant Name",
      "required": true
    },
    "property_address": {
      "type": "text",
      "label": "Property Address",
      "required": true
    },
    "lease_term": {
      "type": "string",
      "label": "Lease Term",
      "required": true
    },
    "monthly_rent": {
      "type": "string",
      "label": "Monthly Rent",
      "required": true
    },
    "security_deposit": {
      "type": "string",
      "label": "Security Deposit",
      "required": true
    },
    "permitted_use": {
      "type": "text",
      "label": "Permitted Use",
      "required": true
    }
  }',
  ARRAY['pro', 'enterprise'],
  NOW(),
  NOW()
);
