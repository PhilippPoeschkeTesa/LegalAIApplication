export type DocumentType = 'NDA' | 'MSA' | 'SOW' | 'Employment';
export type PurposeTag = 'supplier_onboarding' | 'prototype_discussion' | 'r_and_d' | 'service_delivery' | 'joint_development' | 'employment';
export type CriticalityLevel = 'pilot' | 'operational' | 'strategic';
export type SensitivityLevel = 'standard' | 'high_ip' | 'high_commercial';

export interface BuilderRulesConfig {
  documentTypes: {
    [key in DocumentType]: {
      allowedPurposes: PurposeTag[];
      allowedSensitivityLevels: SensitivityLevel[];
      requiresCommercialTerms: boolean;
      requiresPaymentTerms: boolean;
      requiresLiabilityTerms: boolean;
      description: string;
    };
  };
  purposes: {
    [key in PurposeTag]: {
      compatibleDocTypes: DocumentType[];
      requiresCommercialTerms: boolean;
      suggestedCriticalityLevels: CriticalityLevel[];
      warningMessage?: string;
    };
  };
  criticalityWarnings: {
    combination: [CriticalityLevel, string];
    message: string;
  }[];
}

export const builderRules: BuilderRulesConfig = {
  documentTypes: {
    NDA: {
      allowedPurposes: ['supplier_onboarding', 'prototype_discussion', 'r_and_d', 'joint_development'],
      allowedSensitivityLevels: ['standard', 'high_ip', 'high_commercial'],
      requiresCommercialTerms: false,
      requiresPaymentTerms: false,
      requiresLiabilityTerms: true,
      description: 'Confidentiality agreements to protect sensitive information',
    },
    MSA: {
      allowedPurposes: ['supplier_onboarding', 'service_delivery', 'joint_development'],
      allowedSensitivityLevels: ['standard', 'high_commercial'],
      requiresCommercialTerms: true,
      requiresPaymentTerms: true,
      requiresLiabilityTerms: true,
      description: 'Framework agreements for ongoing business relationships',
    },
    SOW: {
      allowedPurposes: ['service_delivery', 'prototype_discussion', 'r_and_d'],
      allowedSensitivityLevels: ['standard', 'high_ip'],
      requiresCommercialTerms: true,
      requiresPaymentTerms: true,
      requiresLiabilityTerms: true,
      description: 'Project-specific scope and deliverables definition',
    },
    Employment: {
      allowedPurposes: ['employment'],
      allowedSensitivityLevels: ['standard', 'high_ip'],
      requiresCommercialTerms: false,
      requiresPaymentTerms: false,
      requiresLiabilityTerms: false,
      description: 'Employment contracts for hiring employees',
    },
  },
  purposes: {
    supplier_onboarding: {
      compatibleDocTypes: ['NDA', 'MSA'],
      requiresCommercialTerms: true,
      suggestedCriticalityLevels: ['pilot', 'operational'],
    },
    prototype_discussion: {
      compatibleDocTypes: ['NDA', 'SOW'],
      requiresCommercialTerms: false,
      suggestedCriticalityLevels: ['pilot'],
      warningMessage: 'Consider high IP sensitivity for prototype discussions',
    },
    r_and_d: {
      compatibleDocTypes: ['NDA', 'SOW'],
      requiresCommercialTerms: true,
      suggestedCriticalityLevels: ['operational', 'strategic'],
      warningMessage: 'R&D projects typically require high IP sensitivity settings',
    },
    service_delivery: {
      compatibleDocTypes: ['MSA', 'SOW'],
      requiresCommercialTerms: true,
      suggestedCriticalityLevels: ['operational'],
    },
    joint_development: {
      compatibleDocTypes: ['NDA', 'MSA'],
      requiresCommercialTerms: true,
      suggestedCriticalityLevels: ['strategic'],
      warningMessage: 'Joint development requires careful IP ownership clauses',
    },
    employment: {
      compatibleDocTypes: ['Employment'],
      requiresCommercialTerms: false,
      suggestedCriticalityLevels: ['operational'],
      warningMessage: 'Employment agreements require careful attention to local labor law requirements',
    },
  },
  criticalityWarnings: [
    {
      combination: ['pilot', 'unlimited'],
      message: 'Unlimited liability for pilot projects is highly unusual and not recommended',
    },
    {
      combination: ['strategic', 'fees_12m'],
      message: 'Strategic engagements may require more robust liability protection than standard fee-based caps',
    },
  ],
};

export function getCompatiblePurposes(documentType: DocumentType): PurposeTag[] {
  const docConfig = builderRules.documentTypes[documentType];
  return docConfig.allowedPurposes;
}

export function shouldShowCommercialTerms(
  documentType?: string,
  purposeTags?: string[]
): boolean {
  if (!documentType) return true;

  const docType = documentType as DocumentType;
  const docConfig = builderRules.documentTypes[docType];

  if (!docConfig.requiresCommercialTerms) {
    return false;
  }

  if (!purposeTags || purposeTags.length === 0) {
    return true;
  }

  const hasEmploymentPurpose = purposeTags.includes('employment');
  if (hasEmploymentPurpose) {
    return false;
  }

  const purposeConfig = purposeTags.map(tag => builderRules.purposes[tag as PurposeTag]);
  const allPurposesRequireCommercial = purposeConfig.every(
    config => config && config.requiresCommercialTerms
  );

  return allPurposesRequireCommercial;
}

export function shouldShowPaymentTerms(
  documentType?: string,
  purposeTags?: string[]
): boolean {
  if (!documentType) return false;

  const docType = documentType as DocumentType;
  const docConfig = builderRules.documentTypes[docType];

  if (!docConfig.requiresPaymentTerms) {
    return false;
  }

  if (!purposeTags || purposeTags.length === 0) {
    return true;
  }

  const hasEmploymentPurpose = purposeTags.includes('employment');
  return !hasEmploymentPurpose;
}

export function shouldShowLiabilityTerms(
  documentType?: string,
  purposeTags?: string[]
): boolean {
  if (!documentType) return true;

  const docType = documentType as DocumentType;
  const docConfig = builderRules.documentTypes[docType];

  if (!docConfig.requiresLiabilityTerms) {
    return false;
  }

  if (!purposeTags || purposeTags.length === 0) {
    return true;
  }

  const hasEmploymentPurpose = purposeTags.includes('employment');
  return !hasEmploymentPurpose;
}

export function shouldShowBusinessCriticality(
  documentType?: string,
  purposeTags?: string[]
): boolean {
  if (!documentType) return true;
  if (!purposeTags || purposeTags.length === 0) return true;

  if (purposeTags.includes('employment')) {
    return false;
  }

  if (documentType === 'NDA' && purposeTags.length === 1 && purposeTags.includes('prototype_discussion')) {
    return false;
  }

  return true;
}

export function shouldShowDurationSection(
  documentType?: string,
  purposeTags?: string[]
): boolean {
  return true;
}

export function getContextualWarnings(
  documentType?: string,
  purposeTags?: string[],
  sensitivityLevel?: string,
  criticalityLevel?: string,
  liabilityCapModel?: string
): string[] {
  const warnings: string[] = [];

  if (!documentType || !purposeTags || purposeTags.length === 0) {
    return warnings;
  }

  purposeTags.forEach(tag => {
    const purpose = builderRules.purposes[tag as PurposeTag];
    if (purpose && purpose.warningMessage) {
      if (!purpose.compatibleDocTypes.includes(documentType as DocumentType)) {
        warnings.push(`${purpose.warningMessage} - This purpose may not be ideal for ${documentType} documents.`);
      } else if (purpose.warningMessage) {
        warnings.push(purpose.warningMessage);
      }
    }
  });

  if (criticalityLevel && liabilityCapModel) {
    builderRules.criticalityWarnings.forEach(warning => {
      if (warning.combination[0] === criticalityLevel && warning.combination[1] === liabilityCapModel) {
        warnings.push(warning.message);
      }
    });
  }

  if (purposeTags.includes('r_and_d') && sensitivityLevel === 'standard') {
    warnings.push('R&D projects typically benefit from higher IP sensitivity settings to ensure adequate protection.');
  }

  if (purposeTags.includes('prototype_discussion') && sensitivityLevel !== 'high_ip') {
    warnings.push('Consider selecting "High IP Sensitivity" to protect innovative concepts and prototypes.');
  }

  return warnings;
}

export function isPurposeCompatibleWithDocType(
  purpose: PurposeTag,
  documentType: DocumentType
): boolean {
  const purposeConfig = builderRules.purposes[purpose];
  if (!purposeConfig) return false;

  return purposeConfig.compatibleDocTypes.includes(documentType);
}

export function getSuggestedCriticalityForPurpose(purposeTags: string[]): CriticalityLevel[] {
  if (!purposeTags || purposeTags.length === 0) {
    return ['pilot', 'operational', 'strategic'];
  }

  const allSuggestions = purposeTags.flatMap(tag => {
    const purpose = builderRules.purposes[tag as PurposeTag];
    return purpose ? purpose.suggestedCriticalityLevels : [];
  });

  return Array.from(new Set(allSuggestions)) as CriticalityLevel[];
}
