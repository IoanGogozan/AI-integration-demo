export const intakeCategories = [
  'sales_inquiry',
  'support_request',
  'invoice_billing',
  'contract_agreement',
  'general_admin',
  'complaint'
];

export const intakePriorities = ['low', 'medium', 'high'];

export const intakeRoutes = ['sales', 'support', 'finance', 'admin', 'legal'];

export const intakeResponseJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'category',
    'priority',
    'summary',
    'suggested_route',
    'suggested_next_action',
    'suggested_reply',
    'confidence',
    'extracted_fields'
  ],
  properties: {
    category: {
      type: 'string',
      enum: intakeCategories
    },
    priority: {
      type: 'string',
      enum: intakePriorities
    },
    summary: {
      type: 'string'
    },
    suggested_route: {
      type: 'string',
      enum: intakeRoutes
    },
    suggested_next_action: {
      type: 'string'
    },
    suggested_reply: {
      type: 'string'
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1
    },
    extracted_fields: {
      type: 'object',
      additionalProperties: false,
      required: [
        'company_name',
        'contact_name',
        'contact_email',
        'phone',
        'invoice_number',
        'amount',
        'deadline',
        'request_type'
      ],
      properties: {
        company_name: {
          type: ['string', 'null']
        },
        contact_name: {
          type: ['string', 'null']
        },
        contact_email: {
          type: ['string', 'null']
        },
        phone: {
          type: ['string', 'null']
        },
        invoice_number: {
          type: ['string', 'null']
        },
        amount: {
          type: ['string', 'null']
        },
        deadline: {
          type: ['string', 'null']
        },
        request_type: {
          type: ['string', 'null']
        }
      }
    }
  }
};

export function validateIntakeResult(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('AI result must be an object');
  }

  validateEnum('category', value.category, intakeCategories);
  validateEnum('priority', value.priority, intakePriorities);
  validateString('summary', value.summary);
  validateEnum('suggested_route', value.suggested_route, intakeRoutes);
  validateString('suggested_next_action', value.suggested_next_action);
  validateString('suggested_reply', value.suggested_reply);

  if (typeof value.confidence !== 'number' || Number.isNaN(value.confidence)) {
    throw new Error('confidence must be a number');
  }

  if (value.confidence < 0 || value.confidence > 1) {
    throw new Error('confidence must be between 0 and 1');
  }

  const fields = value.extracted_fields;

  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    throw new Error('extracted_fields must be an object');
  }

  validateNullableString('company_name', fields.company_name);
  validateNullableString('contact_name', fields.contact_name);
  validateNullableString('contact_email', fields.contact_email);
  validateNullableString('phone', fields.phone);
  validateNullableString('invoice_number', fields.invoice_number);
  validateNullableString('amount', fields.amount);
  validateNullableString('deadline', fields.deadline);
  validateNullableString('request_type', fields.request_type);

  return value;
}

function validateEnum(fieldName, value, acceptedValues) {
  if (!acceptedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${acceptedValues.join(', ')}`);
  }
}

function validateString(fieldName, value) {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
}

function validateNullableString(fieldName, value) {
  if (value !== null && typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string or null`);
  }
}
