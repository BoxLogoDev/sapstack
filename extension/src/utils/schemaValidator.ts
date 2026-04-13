import Ajv from 'ajv';

/**
 * Schema validator using AJV for YAML/JSON validation
 * Validates session artifacts against sapstack schemas
 */
export class SchemaValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      strict: false,
      allowUnionTypes: true,
    });
  }

  /**
   * Validate session state against the schema
   */
  validateSessionState(data: any): { valid: boolean; errors?: string[] } {
    // Basic validation - full schema validation requires network access to GitHub Pages
    const required = ['session_id', 'created_at', 'status', 'initial_symptom', 'turns'];
    const missing = required.filter((field) => !(field in data));

    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missing.join(', ')}`],
      };
    }

    // Validate session_id format
    if (!/^sess-[0-9]{8}-[a-z0-9]{6}$/.test(data.session_id)) {
      return {
        valid: false,
        errors: ['Invalid session_id format. Expected sess-YYYYMMDD-xxxxxx'],
      };
    }

    // Validate status enum
    const validStatuses = [
      'intake',
      'hypothesizing',
      'awaiting_evidence',
      'verifying',
      'resolved',
      'escalated',
      'abandoned',
      'reopened',
    ];
    if (!validStatuses.includes(data.status)) {
      return {
        valid: false,
        errors: [`Invalid status. Must be one of: ${validStatuses.join(', ')}`],
      };
    }

    return { valid: true };
  }

  /**
   * Validate evidence bundle
   */
  validateEvidenceBundle(data: any): { valid: boolean; errors?: string[] } {
    const required = ['bundle_id', 'collected_at', 'evidence_items'];
    const missing = required.filter((field) => !(field in data));

    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missing.join(', ')}`],
      };
    }

    if (!/^evb-[0-9]{8}-[a-z0-9]{6}$/.test(data.bundle_id)) {
      return {
        valid: false,
        errors: ['Invalid bundle_id format. Expected evb-YYYYMMDD-xxxxxx'],
      };
    }

    return { valid: true };
  }

  /**
   * Validate hypothesis
   */
  validateHypothesis(data: any): { valid: boolean; errors?: string[] } {
    const required = ['hypothesis_id', 'description', 'falsification_evidence'];
    const missing = required.filter((field) => !(field in data));

    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missing.join(', ')}`],
      };
    }

    return { valid: true };
  }

  /**
   * Validate follow-up request
   */
  validateFollowupRequest(data: any): { valid: boolean; errors?: string[] } {
    const required = ['request_id', 'checks'];
    const missing = required.filter((field) => !(field in data));

    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missing.join(', ')}`],
      };
    }

    if (!/^flr-[0-9]{8}-[a-z0-9]{6}$/.test(data.request_id)) {
      return {
        valid: false,
        errors: ['Invalid request_id format. Expected flr-YYYYMMDD-xxxxxx'],
      };
    }

    return { valid: true };
  }

  /**
   * Validate verdict
   */
  validateVerdict(data: any): { valid: boolean; errors?: string[] } {
    const required = ['verdict_id', 'verified_at', 'confirmed_hypotheses'];
    const missing = required.filter((field) => !(field in data));

    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missing.join(', ')}`],
      };
    }

    if (!/^vdc-[0-9]{8}-[a-z0-9]{6}$/.test(data.verdict_id)) {
      return {
        valid: false,
        errors: ['Invalid verdict_id format. Expected vdc-YYYYMMDD-xxxxxx'],
      };
    }

    return { valid: true };
  }
}
