// JSON Schema validation using AJV for all data types

import Ajv from 'ajv';

const ajv = new Ajv();

export const prospectProfileSchema = {
  type: "object",
  properties: {
    full_name: { type: "string" },
    headline: { type: "string" },
    location: { type: "string" },
    contact: {
      type: "object",
      properties: {
        email: { type: "string" },
        phone: { type: "string" },
        linkedin_url: { type: "string" }
      }
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          location: { type: "string" },
          summary_bullets: { type: "array", items: { type: "string" } }
        },
        required: ["title", "company", "start_date", "end_date"]
      }
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          school: { type: "string" },
          degree: { type: "string" },
          field: { type: "string" },
          start_year: { type: "string" },
          end_year: { type: "string" }
        },
        required: ["school"]
      }
    },
    licenses_certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: "string" },
          issue_date: { type: "string" },
          expiry_date: { type: "string" },
          credential_id: { type: "string" }
        },
        required: ["name", "issuer"]
      }
    },
    notes: { type: "array", items: { type: "string" } }
  },
  required: ["full_name", "experience"]
};

export const companyResearchSchema = {
  type: "object",
  properties: {
    company_snapshot: {
      type: "object",
      properties: {
        legal_name: { type: "string" },
        aka: { type: "array", items: { type: "string" } },
        industry: { type: "string" },
        hq: { type: "string" },
        employee_count: { type: "string" },
        revenue_estimate: { type: "string" },
        compliance_frameworks: { type: "array", items: { type: "string" } },
        recent_security_incidents: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string" },
              summary: { type: "string" },
              sources: { type: "array", items: { type: "string" } }
            },
            required: ["date", "summary", "sources"]
          }
        }
      },
      required: ["legal_name", "industry"]
    },
    hiring_signals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string" },
          team: { type: "string" },
          location: { type: "string" },
          source: { type: "string" }
        },
        required: ["role", "source"]
      }
    },
    meddpicc_bant: {
      type: "object",
      properties: {
        metrics: { type: "string" },
        economic_buyer: { type: "string" },
        decision_criteria: { type: "string" },
        decision_process: { type: "string" },
        paper_process: { type: "string" },
        pain_identified: { type: "string" },
        implicated_champion: { type: "string" },
        competition: { type: "string" },
        budget: { type: "string" },
        authority: { type: "string" },
        need: { type: "string" },
        timeline: { type: "string" }
      }
    },
    prospect_relevance: { type: "string" },
    citations: { type: "array", items: { type: "string" } }
  },
  required: ["company_snapshot", "citations"]
};

export const techStackReconSchema = {
  type: "object",
  properties: {
    dev_stack: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          tool: { type: "string" },
          evidence: { type: "string" },
          source: { type: "string" }
        },
        required: ["category", "tool", "source"]
      }
    },
    security_stack: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          tool: { type: "string" },
          evidence: { type: "string" },
          source: { type: "string" }
        },
        required: ["category", "tool", "source"]
      }
    },
    unknowns_gaps: { type: "array", items: { type: "string" } },
    citations: { type: "array", items: { type: "string" } }
  },
  required: ["citations"]
};

export const accountMapSchema = {
  type: "object",
  properties: {
    company_snapshot: {
      type: "object",
      properties: {
        industry: { type: "string" },
        hq: { type: "string" },
        size: { type: "string" },
        revenue: { type: "string" },
        structure_summary: { type: "string" }
      }
    },
    org_tree: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          reports_to: { type: "string" },
          level: { type: "string" },
          region_function: { type: "string" },
          sources: { type: "array", items: { type: "string" } }
        },
        required: ["name", "title", "sources"]
      }
    },
    role_analysis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          role: {
            type: "string",
            enum: ["economic buyer", "champion", "evaluator", "influencer", "blocker", "Lead to validate"]
          },
          notes: { type: "string" },
          sources: { type: "array", items: { type: "string" } }
        },
        required: ["name", "title", "role", "sources"]
      }
    },
    gaps: { type: "array", items: { type: "string" } },
    citations: { type: "array", items: { type: "string" } }
  },
  required: ["org_tree", "citations"]
};

export const salesPlanSchema = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    current_state: { type: "string" },
    opportunity_hypotheses: { type: "array", items: { type: "string" } },
    value_map: {
      type: "array",
      items: {
        type: "object",
        properties: {
          problem: { type: "string" },
          impact: { type: "string" },
          portswigger_solution: { type: "string" },
          proof_points: { type: "array", items: { type: "string" } }
        },
        required: ["problem", "impact", "portswigger_solution"]
      }
    },
    stakeholder_strategy: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          role: { type: "string" },
          goals: { type: "string" },
          talk_track: { type: "string" },
          next_actions: { type: "array", items: { type: "string" } }
        },
        required: ["name", "title", "talk_track"]
      }
    },
    meddpicc_summary: { type: "string" },
    mutual_action_plan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          milestone: { type: "string" },
          owner: { type: "string" },
          due_date: { type: "string" }
        },
        required: ["milestone", "owner", "due_date"]
      }
    },
    risks: { type: "array", items: { type: "string" } },
    citations: { type: "array", items: { type: "string" } }
  },
  required: ["executive_summary", "mutual_action_plan"]
};

// Compiled validators
export const validateProspectProfile = ajv.compile(prospectProfileSchema);
export const validateCompanyResearch = ajv.compile(companyResearchSchema);
export const validateTechStackRecon = ajv.compile(techStackReconSchema);
export const validateAccountMap = ajv.compile(accountMapSchema);
export const validateSalesPlan = ajv.compile(salesPlanSchema);

// Utility function to validate any data with proper error reporting
export function validateData<T>(data: unknown, validator: any, type: string): { isValid: boolean; data?: T; errors?: string[] } {
  const isValid = validator(data);
  
  if (isValid) {
    return { isValid: true, data: data as T };
  } else {
    const errors = validator.errors?.map((err: any) => 
      `${err.instancePath || 'root'}: ${err.message}`
    ) || [`Invalid ${type} format`];
    
    return { isValid: false, errors };
  }
}