export interface BuilderState {
  document_type?: string;
  jurisdiction?: string;
  language?: string;
  sensitivity_level?: string;
  purpose_tags?: string[];
  criticality_level?: string;
  engagement_duration?: string;
  party_our_entity_name?: string;
  counterparty_name?: string;
  counterparty_country?: string;
  counterparty_registration?: string;
  effective_date?: string;
  payment_terms?: string;
  termination_notice?: string;
  liability_cap_model?: string;
  employee_name?: string;
  employee_position?: string;
  employee_department?: string;
  employment_start_date?: string;
  employment_type?: string;
  probation_period_months?: number;
  notice_periods?: any;
  selected_clauses?: Record<string, string>;
}

export interface DocumentPreviewResponse {
  receivedPayload: BuilderState;
  message: string;
  timestamp: string;
  summary: {
    documentType?: string;
    selectedClausesCount: number;
    hasParties: boolean;
    jurisdiction?: string;
  };
}

export const documentService = {
  async generateDocumentPreview(builderState: BuilderState): Promise<DocumentPreviewResponse> {
    console.log('📄 Document Service: Generating preview for document type:', builderState.document_type);
    console.log('📋 Selected clauses count:', Object.keys(builderState.selected_clauses || {}).length);

    return {
      receivedPayload: builderState,
      message: 'Document preview generation - payload received successfully',
      timestamp: new Date().toISOString(),
      summary: {
        documentType: builderState.document_type,
        selectedClausesCount: Object.keys(builderState.selected_clauses || {}).length,
        hasParties: !!(builderState.counterparty_name || builderState.employee_name),
        jurisdiction: builderState.jurisdiction
      }
    };
  }
};
