import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { Step0ContextSetup } from '../components/Builder/Step0ContextSetup';
import { Step1DealFrame } from '../components/Builder/Step1DealFrame';
import { Step2PartiesTerms } from '../components/Builder/Step2PartiesTerms';
import { Step3ClauseSelection } from '../components/Builder/Step3ClauseSelection';
import { Step4ReviewGenerate } from '../components/Builder/Step4ReviewGenerate';

type WizardStep = 'context' | 'deal_frame' | 'parties' | 'clauses' | 'review';

interface BuilderState {
  document_type?: string;
  governing_law?: string;
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
  notice_period_during_probation?: string;
  notice_period_after_probation?: string;
  selected_clauses?: Record<string, string>;
}

export function Builder() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('context');
  const [builderState, setBuilderState] = useState<BuilderState>({
    language: 'en',
    sensitivity_level: 'standard',
    selected_clauses: {},
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    loadOrCreateSession();
  }, [user]);

  useEffect(() => {
    if (builderState.document_type) {
      loadTemplate();
    }
  }, [builderState.document_type]);

  useEffect(() => {
    if (sessionId) {
      saveSessionState();
    }
  }, [builderState]);

  const loadOrCreateSession = async () => {
    if (!user) return;

    try {
      const { data: existingSessions } = await supabase
        .from('builder_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (existingSessions && existingSessions.length > 0) {
        const session = existingSessions[0];
        setSessionId(session.id);
        setBuilderState({
          ...session,
          purpose_tags: session.purpose_tags || [],
          selected_clauses: session.selected_clauses || {},
        });
        setCurrentStep(session.current_step || 'context');
      } else {
        const { data: newSession } = await supabase
          .from('builder_sessions')
          .insert({
            user_id: user.id,
            status: 'draft',
            current_step: 'context',
            language: 'en',
            sensitivity_level: 'standard',
          })
          .select()
          .single();

        if (newSession) {
          setSessionId(newSession.id);
        }
      }
    } catch (err) {
      console.error('Failed to load or create session:', err);
    }
  };

  const loadTemplate = async () => {
    try {
      const { data } = await supabase
        .from('document_templates')
        .select('id')
        .eq('document_type', builderState.document_type)
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setTemplateId(data.id);
      }
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  };

  const saveSessionState = async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from('builder_sessions')
        .update({
          ...builderState,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Failed to save session state:', err);
    }
  };

  const updateBuilderState = (updates: Partial<BuilderState>) => {
    setBuilderState(prev => ({ ...prev, ...updates }));
  };

  const updateSelectedClause = (sectionId: string, clauseId: string) => {
    setBuilderState(prev => ({
      ...prev,
      selected_clauses: {
        ...prev.selected_clauses,
        [sectionId]: clauseId,
      },
    }));
  };

  const handleNext = () => {
    const steps: WizardStep[] = ['context', 'deal_frame', 'parties', 'clauses', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    console.log('[Builder] handleNext called, currentStep:', currentStep, 'currentIndex:', currentIndex);
    console.log('[Builder] builderState.selected_clauses:', builderState.selected_clauses);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      console.log('[Builder] Moving to next step:', nextStep);
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const steps: WizardStep[] = ['context', 'deal_frame', 'parties', 'clauses', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSaveDocument = async () => {
    if (!user || !sessionId) return;

    try {
      await supabase
        .from('builder_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      alert('Document saved successfully to repository!');
    } catch (err) {
      console.error('Failed to save document:', err);
      alert('Failed to save document. Please try again.');
    }
  };

  const handleExportWord = () => {
    alert('Word export feature coming soon! Document has been saved to your repository.');
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'context':
        return builderState.document_type && builderState.jurisdiction;
      case 'deal_frame': {
        const hasPurpose = builderState.purpose_tags && builderState.purpose_tags.length > 0;
        const hasEmploymentPurpose = builderState.purpose_tags?.includes('employment');
        const needsCriticality = !hasEmploymentPurpose;
        const hasCriticality = builderState.criticality_level;
        return hasPurpose && (!needsCriticality || hasCriticality);
      }
      case 'parties': {
        const isEmployment = builderState.document_type === 'Employment';
        if (isEmployment) {
          return builderState.employee_name && builderState.employee_position;
        }
        return builderState.counterparty_name && builderState.counterparty_country;
      }
      case 'clauses':
        return builderState.selected_clauses && Object.keys(builderState.selected_clauses).length > 0;
      default:
        return true;
    }
  };

  const getStepNumber = () => {
    const steps: WizardStep[] = ['context', 'deal_frame', 'parties', 'clauses', 'review'];
    return steps.indexOf(currentStep) + 1;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'context': return 'Step 0: Context Setup';
      case 'deal_frame': return 'Step 1: Deal Frame';
      case 'parties': return 'Step 2: Parties & Terms';
      case 'clauses': return 'Step 3: Select Clauses';
      case 'review': return 'Step 4: Review & Generate';
      default: return 'Document Builder';
    }
  };

  const isStepCompleted = (step: WizardStep) => {
    const steps: WizardStep[] = ['context', 'deal_frame', 'parties', 'clauses', 'review'];
    return steps.indexOf(step) < steps.indexOf(currentStep);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
            Guided Document Builder
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Create legal documents step-by-step with intelligent clause selection
          </p>
        </div>

        <div className={`mb-8 p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {getStepTitle()}
            </span>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Step {getStepNumber()} of 5
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(['context', 'deal_frame', 'parties', 'clauses', 'review'] as WizardStep[]).map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep === step
                        ? 'bg-tesa-blue text-white'
                        : isStepCompleted(step)
                        ? 'bg-green-500 text-white'
                        : isDark
                        ? 'bg-slate-700 text-slate-400'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isStepCompleted(step) ? <CheckCircle size={20} /> : index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      isStepCompleted(['context', 'deal_frame', 'parties', 'clauses', 'review'][index + 1])
                        ? 'bg-green-500'
                        : isDark
                        ? 'bg-slate-700'
                        : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-8 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} mb-6`}>
          {currentStep === 'context' && (
            <Step0ContextSetup
              state={builderState}
              onChange={updateBuilderState}
              isDark={isDark}
            />
          )}

          {currentStep === 'deal_frame' && (
            <Step1DealFrame
              state={builderState}
              contextState={{
                document_type: builderState.document_type,
              }}
              onChange={updateBuilderState}
              isDark={isDark}
            />
          )}

          {currentStep === 'parties' && (
            <Step2PartiesTerms
              state={builderState}
              contextState={{
                jurisdiction: builderState.jurisdiction,
                document_type: builderState.document_type,
                purpose_tags: builderState.purpose_tags,
                sensitivity_level: builderState.sensitivity_level,
                criticality_level: builderState.criticality_level,
              }}
              onChange={updateBuilderState}
              isDark={isDark}
            />
          )}

          {currentStep === 'clauses' && templateId && (
            <Step3ClauseSelection
              templateId={templateId}
              contextState={{
                jurisdiction: builderState.jurisdiction,
                sensitivity_level: builderState.sensitivity_level,
                criticality_level: builderState.criticality_level,
              }}
              selectedClauses={builderState.selected_clauses || {}}
              onChange={updateSelectedClause}
              isDark={isDark}
            />
          )}

          {currentStep === 'review' && (
            <>
              {console.log('[Builder] Rendering Step 4, currentStep:', currentStep)}
              {console.log('[Builder] builderState for Step 4:', builderState)}
              <Step4ReviewGenerate
                builderState={builderState}
                onSave={handleSaveDocument}
                onExport={handleExportWord}
                isDark={isDark}
              />
            </>
          )}
        </div>

        {currentStep !== 'clauses' && (
          <div className="flex gap-3">
            {currentStep !== 'context' && (
              <button
                onClick={handlePrevious}
                className={`px-6 py-3 border ${isDark ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 text-slate-900 hover:bg-slate-50'} rounded-lg transition-colors font-medium flex items-center gap-2`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
            )}

            {currentStep !== 'review' && (
              <button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className={`flex-1 px-6 py-3 bg-tesa-blue text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  !canProceedToNext()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:opacity-90'
                }`}
              >
                Continue
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
