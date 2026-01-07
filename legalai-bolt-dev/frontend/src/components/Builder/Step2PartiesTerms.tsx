import { useState, useEffect } from 'react';
import { Building2, MapPin, Calendar, DollarSign, AlertTriangle, Search, Users, AlertCircle, User, Briefcase, Clock } from 'lucide-react';
import { shouldShowPaymentTerms, shouldShowLiabilityTerms, getContextualWarnings } from '../../lib/builderRules';

interface Partner {
  id: string;
  name: string;
  legal_name: string | null;
  country: string | null;
  jurisdiction: string | null;
  risk_rating: string | null;
}

interface EmploymentDefaults {
  default_probation_months: number;
  notice_during_probation_days: number;
  notice_after_probation_months: number;
  description: string;
  legal_reference: string;
}

interface Step2Props {
  state: {
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
    notice_period_during_probation?: string;
    notice_period_after_probation?: string;
  };
  contextState: {
    jurisdiction?: string;
    document_type?: string;
    purpose_tags?: string[];
    sensitivity_level?: string;
    criticality_level?: string;
  };
  onChange: (updates: Partial<Step2Props['state']>) => void;
  isDark: boolean;
}

const PAYMENT_TERMS = [
  { id: 'net_30', name: 'Net 30 days', description: 'Payment due 30 days after invoice' },
  { id: 'net_60', name: 'Net 60 days', description: 'Payment due 60 days after invoice' },
  { id: 'advance', name: 'Advance payment', description: 'Payment before service delivery' },
  { id: 'custom', name: 'Custom', description: 'Define specific terms' },
];

const TERMINATION_NOTICE = [
  { id: '30_days', name: '30 days notice', description: 'Standard for short-term agreements' },
  { id: '60_days', name: '60 days notice', description: 'Balanced approach' },
  { id: '90_days', name: '90 days notice', description: 'For strategic partnerships' },
];

const LIABILITY_CAP_MODELS = [
  { id: 'fees_12m', name: 'Limited to fees paid (12 months)', description: 'Standard limitation, caps liability at fees paid in last 12 months', risk: 'Low' },
  { id: 'absolute_cap', name: 'Absolute cap (fixed amount)', description: 'Fixed maximum liability amount regardless of fees', risk: 'Medium' },
  { id: 'unlimited', name: 'Unlimited liability', description: 'No cap on liability - requires legal approval', risk: 'High' },
];

const EMPLOYMENT_TYPES = [
  { id: 'full_time', name: 'Full-time', description: 'Regular full-time employment' },
  { id: 'part_time', name: 'Part-time', description: 'Reduced working hours' },
  { id: 'fixed_term', name: 'Fixed-term', description: 'Contract with defined end date' },
  { id: 'temporary', name: 'Temporary', description: 'Short-term or project-based' },
];

const PROBATION_PERIODS = [
  { id: 0, name: 'No probation period', description: 'No trial period' },
  { id: 1, name: '1 month', description: 'Short probation period' },
  { id: 3, name: '3 months', description: 'Standard probation period' },
  { id: 6, name: '6 months', description: 'Extended probation period (common in Germany)' },
];

const NOTICE_DURING_PROBATION = [
  { id: '2_weeks', name: '2 weeks', description: 'Standard in Germany (BGB §622)' },
  { id: '1_week', name: '1 week', description: 'Shorter notice period' },
  { id: '1_month', name: '1 month', description: 'Extended notice period' },
  { id: 'none', name: 'No notice required', description: 'Immediate termination possible' },
];

const NOTICE_AFTER_PROBATION = [
  { id: '1_month', name: '1 month', description: 'Minimum notice period' },
  { id: '2_months', name: '2 months', description: 'Standard notice period' },
  { id: '3_months', name: '3 months', description: 'Standard in Germany (BGB §622)' },
  { id: '6_months', name: '6 months', description: 'Extended notice period for senior roles' },
];

export function Step2PartiesTerms({ state, contextState, onChange, isDark }: Step2Props) {
  const isEmployment = contextState.document_type === 'Employment';

  const [formData, setFormData] = useState({
    party_our_entity_name: state.party_our_entity_name || 'TESA GmbH',
    counterparty_name: state.counterparty_name || '',
    counterparty_country: state.counterparty_country || '',
    counterparty_registration: state.counterparty_registration || '',
    effective_date: state.effective_date || new Date().toISOString().split('T')[0],
    payment_terms: state.payment_terms || 'net_30',
    termination_notice: state.termination_notice || '30_days',
    liability_cap_model: state.liability_cap_model || 'fees_12m',
    employee_name: state.employee_name || '',
    employee_position: state.employee_position || '',
    employee_department: state.employee_department || '',
    employment_start_date: state.employment_start_date || new Date().toISOString().split('T')[0],
    employment_type: state.employment_type || 'full_time',
    probation_period_months: state.probation_period_months ?? 6,
    notice_period_during_probation: state.notice_period_during_probation || '2_weeks',
    notice_period_after_probation: state.notice_period_after_probation || '3_months',
  });

  const [showJurisdictionWarning, setShowJurisdictionWarning] = useState(false);
  const [useExistingPartner, setUseExistingPartner] = useState(true);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerSuggestions, setPartnerSuggestions] = useState<Partner[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [employmentDefaults, setEmploymentDefaults] = useState<EmploymentDefaults | null>(null);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  useEffect(() => {
    if (isEmployment && contextState.jurisdiction) {
      loadEmploymentDefaults(contextState.jurisdiction);
    }
  }, [isEmployment, contextState.jurisdiction]);

  useEffect(() => {
    if (partnerSearchQuery.length >= 2 && !isEmployment) {
      searchPartners(partnerSearchQuery);
    } else {
      setPartnerSuggestions([]);
    }
  }, [partnerSearchQuery, isEmployment]);

  const loadEmploymentDefaults = async (jurisdiction: string) => {
    try {
      const { data, error } = await supabase
        .from('employment_jurisdiction_defaults')
        .select('*')
        .eq('jurisdiction', jurisdiction)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setEmploymentDefaults(data);
        if (!state.probation_period_months) {
          handleChange('probation_period_months', data.default_probation_months);
        }
      }
    } catch (err) {
      console.error('Failed to load employment defaults:', err);
    }
  };

  const searchPartners = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, legal_name, country, jurisdiction, risk_rating')
        .or(`name.ilike.%${query}%,legal_name.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setPartnerSuggestions(data || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to search partners:', err);
    }
  };

  const selectPartner = (partner: Partner) => {
    setSelectedPartnerId(partner.id);
    setPartnerSearchQuery(partner.name);
    setShowSuggestions(false);

    setFormData(prev => ({
      ...prev,
      counterparty_name: partner.legal_name || partner.name,
      counterparty_country: partner.country || '',
      counterparty_registration: '',
    }));
  };

  useEffect(() => {
    if (contextState.jurisdiction && formData.counterparty_country && !isEmployment) {
      const cpCountryCode = formData.counterparty_country.split('-')[0];
      const jurisdictionCode = contextState.jurisdiction.split('-')[0];

      setShowJurisdictionWarning(cpCountryCode !== jurisdictionCode);
    }
  }, [formData.counterparty_country, contextState.jurisdiction, isEmployment]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showPaymentFields = shouldShowPaymentTerms(
    contextState.document_type,
    contextState.purpose_tags
  );

  const showLiabilityFields = shouldShowLiabilityTerms(
    contextState.document_type,
    contextState.purpose_tags
  );

  const warnings = getContextualWarnings(
    contextState.document_type,
    contextState.purpose_tags,
    contextState.sensitivity_level,
    contextState.criticality_level,
    formData.liability_cap_model
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Who's involved and what are the terms?
        </h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {isEmployment
            ? 'Enter the employee details and employment terms'
            : 'Enter the party details and key commercial terms for this agreement'}
        </p>
      </div>

      <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Building2 size={20} />
          Our Company
        </h3>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Legal Entity Name
          </label>
          <input
            type="text"
            value={formData.party_our_entity_name}
            onChange={(e) => handleChange('party_our_entity_name', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
            placeholder="TESA GmbH"
          />
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isEmployment ? <User size={20} /> : <Building2 size={20} />}
            {isEmployment ? 'Employee Information' : 'Counterparty'}
          </h3>
          {!isEmployment && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseExistingPartner(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                useExistingPartner
                  ? 'bg-tesa-blue text-white'
                  : isDark
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users size={14} className="inline mr-1" />
              Existing Partner
            </button>
            <button
              onClick={() => {
                setUseExistingPartner(false);
                setSelectedPartnerId(null);
                setPartnerSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !useExistingPartner
                  ? 'bg-tesa-blue text-white'
                  : isDark
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              New Partner
            </button>
          </div>
          )}
        </div>

        <div className="space-y-4">
          {isEmployment ? (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  value={formData.employee_name}
                  onChange={(e) => handleChange('employee_name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
                  <Briefcase size={16} />
                  Position / Job Title *
                </label>
                <input
                  type="text"
                  value={formData.employee_position}
                  onChange={(e) => handleChange('employee_position', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
                  placeholder="Software Engineer"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Department (optional)
                </label>
                <input
                  type="text"
                  value={formData.employee_department}
                  onChange={(e) => handleChange('employee_department', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
                  placeholder="Engineering"
                />
              </div>
            </>
          ) : (
            <>
          {useExistingPartner ? (
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Search Partner in Partner 360 Database *
              </label>
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={partnerSearchQuery}
                  onChange={(e) => setPartnerSearchQuery(e.target.value)}
                  onFocus={() => partnerSuggestions.length > 0 && setShowSuggestions(true)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
                  placeholder="Start typing partner name..."
                  required
                />
              </div>

              {showSuggestions && partnerSuggestions.length > 0 && (
                <div className={`absolute z-10 w-full mt-2 rounded-lg border shadow-lg ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  {partnerSuggestions.map((partner) => (
                    <button
                      key={partner.id}
                      onClick={() => selectPartner(partner)}
                      className={`w-full p-4 text-left transition-colors border-b last:border-b-0 ${
                        isDark
                          ? 'border-slate-700 hover:bg-slate-700'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {partner.name}
                          </p>
                          {partner.legal_name && partner.legal_name !== partner.name && (
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {partner.legal_name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {partner.country && (
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                {partner.country}
                              </span>
                            )}
                            {partner.risk_rating && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                partner.risk_rating === 'low'
                                  ? 'bg-green-100 text-green-700'
                                  : partner.risk_rating === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                Risk: {partner.risk_rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedPartnerId && (
                <p className={`text-sm mt-2 ${isDark ? 'text-green-400' : 'text-green-600'} flex items-center gap-2`}>
                  <Building2 size={14} />
                  Partner selected from database
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Company Name *
              </label>
              <input
                type="text"
                value={formData.counterparty_name}
                onChange={(e) => handleChange('counterparty_name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
                placeholder="Acme Corporation GmbH"
                required
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
              <MapPin size={16} />
              Country *
            </label>
            <select
              value={formData.counterparty_country}
              onChange={(e) => handleChange('counterparty_country', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
              required
            >
              <option value="">Select country...</option>
              <option value="DE">Germany</option>
              <option value="AT">Austria</option>
              <option value="CH">Switzerland</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="FR">France</option>
              <option value="IT">Italy</option>
              <option value="NL">Netherlands</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Registration Number (optional)
            </label>
            <input
              type="text"
              value={formData.counterparty_registration}
              onChange={(e) => handleChange('counterparty_registration', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
              placeholder="HRB 12345"
            />
          </div>
          </>
          )}
        </div>
      </div>

      {showJurisdictionWarning && (
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} flex items-start gap-3`}>
          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
              Jurisdiction Mismatch
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
              Counterparty is based in {formData.counterparty_country} but governing law is {contextState.jurisdiction}. This may require legal review and counterparty might push back on foreign jurisdiction.
            </p>
          </div>
        </div>
      )}

      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
          <Calendar size={16} />
          {isEmployment ? 'Employment Start Date' : 'Effective Date'}
        </label>
        <input
          type="date"
          value={isEmployment ? formData.employment_start_date : formData.effective_date}
          onChange={(e) => handleChange(isEmployment ? 'employment_start_date' : 'effective_date', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900'
          } focus:ring-2 focus:ring-tesa-blue focus:border-transparent`}
        />
        {isEmployment && (
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            The date when employment begins
          </p>
        )}
      </div>

      {isEmployment && (
        <>
          <div>
            <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Employment Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EMPLOYMENT_TYPES.map((type) => {
                const isSelected = formData.employment_type === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleChange('employment_type', type.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-tesa-blue bg-tesa-blue/10'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {type.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
              <Clock size={18} />
              Probation Period (Probezeit)
            </label>
            {employmentDefaults && (
              <div className={`mb-3 p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  {employmentDefaults.description}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Legal reference: {employmentDefaults.legal_reference}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PROBATION_PERIODS.map((period) => {
                const isSelected = formData.probation_period_months === period.id;
                const isRecommended = employmentDefaults?.default_probation_months === period.id;
                return (
                  <button
                    key={period.id}
                    onClick={() => handleChange('probation_period_months', period.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                      isSelected
                        ? 'border-tesa-blue bg-tesa-blue/10'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {isRecommended && (
                      <span className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        Default
                      </span>
                    )}
                    <h4 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {period.name}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {period.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Notice Period During Probation
            </label>
            <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              The notice period that applies during the probation period
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {NOTICE_DURING_PROBATION.map((notice) => {
                const isSelected = formData.notice_period_during_probation === notice.id;
                const isRecommended = employmentDefaults &&
                  ((notice.id === '2_weeks' && employmentDefaults.notice_during_probation_days === 14) ||
                  (notice.id === '1_week' && employmentDefaults.notice_during_probation_days === 7));
                return (
                  <button
                    key={notice.id}
                    onClick={() => handleChange('notice_period_during_probation', notice.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                      isSelected
                        ? 'border-tesa-blue bg-tesa-blue/10'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {isRecommended && (
                      <span className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        Default
                      </span>
                    )}
                    <h4 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {notice.name}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {notice.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Notice Period After Probation
            </label>
            <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              The notice period that applies after the probation period ends
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {NOTICE_AFTER_PROBATION.map((notice) => {
                const isSelected = formData.notice_period_after_probation === notice.id;
                const isRecommended = employmentDefaults &&
                  ((notice.id === '3_months' && employmentDefaults.notice_after_probation_months === 3) ||
                  (notice.id === '2_months' && employmentDefaults.notice_after_probation_months === 2) ||
                  (notice.id === '1_month' && employmentDefaults.notice_after_probation_months === 1));
                return (
                  <button
                    key={notice.id}
                    onClick={() => handleChange('notice_period_after_probation', notice.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                      isSelected
                        ? 'border-tesa-blue bg-tesa-blue/10'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {isRecommended && (
                      <span className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        Default
                      </span>
                    )}
                    <h4 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {notice.name}
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {notice.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {formData.probation_period_months > 0 && (
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} flex items-start gap-3`}>
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  Two-Tier Notice Period
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  During the first {formData.probation_period_months} month{formData.probation_period_months !== 1 ? 's' : ''} (probation period),
                  either party can terminate with <strong>{NOTICE_DURING_PROBATION.find(n => n.id === formData.notice_period_during_probation)?.name}</strong> notice.
                  After probation ends, the notice period increases to <strong>{NOTICE_AFTER_PROBATION.find(n => n.id === formData.notice_period_after_probation)?.name}</strong>.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {showPaymentFields && !isEmployment && (
        <>
          <div>
            <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
              <DollarSign size={18} />
              Payment Terms
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PAYMENT_TERMS.map((term) => {
                const isSelected = formData.payment_terms === term.id;
                return (
                  <button
                    key={term.id}
                    onClick={() => handleChange('payment_terms', term.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-tesa-blue bg-tesa-blue/10'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {term.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {term.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!isEmployment && (
      <div>
        <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Termination Notice Period
        </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TERMINATION_NOTICE.map((notice) => {
                const isSelected = formData.termination_notice === notice.id;
                return (
                  <button
                    key={notice.id}
                    onClick={() => handleChange('termination_notice', notice.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-tesa-blue bg-tesa-blue/10'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {notice.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {notice.description}
                    </p>
                  </button>
                );
              })}
            </div>
      </div>
      )}

      {showLiabilityFields && !isEmployment && (
        <>
          <div>
            <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Liability Cap Model
            </label>
            <div className="space-y-3">
              {LIABILITY_CAP_MODELS.map((model) => {
                const isSelected = formData.liability_cap_model === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleChange('liability_cap_model', model.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-tesa-blue bg-tesa-blue/10'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {model.name}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              model.risk === 'Low'
                                ? 'bg-green-100 text-green-700'
                                : model.risk === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {model.risk} Risk
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {model.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
              } flex items-start gap-3`}
            >
              <AlertCircle
                size={20}
                className={`flex-shrink-0 mt-0.5 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}
              />
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                {warning}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
