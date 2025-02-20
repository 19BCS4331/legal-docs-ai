-- Seed document templates
INSERT INTO public.document_templates (name, description, category, prompt_template, required_fields, available_in_plan)
VALUES
    (
        'Non-Disclosure Agreement (NDA)',
        'A standard NDA to protect confidential information',
        'Confidentiality',
        'Create a comprehensive Non-Disclosure Agreement with the following details: Party A (Disclosing Party): {party_a_name}, Party B (Receiving Party): {party_b_name}, Purpose: {purpose}, Duration: {duration}. Include standard clauses for confidential information definition, obligations, exclusions, return of information, and remedies.',
        '{
            "party_a_name": {"type": "string", "label": "Disclosing Party Name", "required": true},
            "party_b_name": {"type": "string", "label": "Receiving Party Name", "required": true},
            "purpose": {"type": "text", "label": "Purpose of Disclosure", "required": true},
            "duration": {"type": "string", "label": "Agreement Duration", "required": true}
        }'::jsonb,
        '{free,pro,enterprise}'
    ),
    (
        'Employment Agreement',
        'A comprehensive employment contract',
        'Employment',
        'Create an Employment Agreement with the following details: Employer: {employer_name}, Employee: {employee_name}, Position: {position}, Start Date: {start_date}, Salary: {salary}, Location: {work_location}. Include standard clauses for duties, compensation, benefits, termination, and confidentiality.',
        '{
            "employer_name": {"type": "string", "label": "Employer Name", "required": true},
            "employee_name": {"type": "string", "label": "Employee Name", "required": true},
            "position": {"type": "string", "label": "Job Position", "required": true},
            "start_date": {"type": "date", "label": "Start Date", "required": true},
            "salary": {"type": "string", "label": "Annual Salary", "required": true},
            "work_location": {"type": "string", "label": "Work Location", "required": true}
        }'::jsonb,
        '{pro,enterprise}'
    ),
    (
        'Service Agreement',
        'A contract for service providers',
        'Services',
        'Create a Service Agreement with the following details: Service Provider: {provider_name}, Client: {client_name}, Services: {services_description}, Payment Terms: {payment_terms}, Duration: {duration}. Include standard clauses for scope of services, payment terms, termination, and liability.',
        '{
            "provider_name": {"type": "string", "label": "Service Provider Name", "required": true},
            "client_name": {"type": "string", "label": "Client Name", "required": true},
            "services_description": {"type": "text", "label": "Description of Services", "required": true},
            "payment_terms": {"type": "text", "label": "Payment Terms", "required": true},
            "duration": {"type": "string", "label": "Agreement Duration", "required": true}
        }'::jsonb,
        '{pro,enterprise}'
    );
