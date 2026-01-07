import { GitBranch, ArrowRight, CheckCircle, XCircle, AlertTriangle, Clock, User, Filter, Plus, X, Save, Trash } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useColors } from '../lib/colors';
import { useState, useEffect } from 'react';
import { workflowService, type WorkflowTask, type ComplianceCheck } from '../lib/workflowService';

export function Workflows() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const c = useColors(isDark);
  const [selected, setSelected] = useState('nda');
  const [activeTab, setActiveTab] = useState<'tasks' | 'compliance' | 'rules'>('tasks');
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    contract_type: 'NDA',
    sla_hours: 24,
    conditions: '',
    trigger_rules: {},
    escalation_rules: {},
    approval_stages: [] as any[],
  });

  useEffect(() => {
    if (user?.id) {
      loadUserTasks();
      loadWorkflows();
    }
  }, [user]);

  async function loadWorkflows() {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  }

  async function createWorkflow() {
    if (!user?.id || !newWorkflow.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .insert({
          rule_name: newWorkflow.name,
          description: newWorkflow.description,
          contract_type: newWorkflow.contract_type,
          trigger_conditions: { conditions: newWorkflow.conditions },
          routing_rules: {
            sla_hours: newWorkflow.sla_hours,
            approval_stages: newWorkflow.approval_stages,
          },
          escalation_rules: newWorkflow.escalation_rules,
          is_active: true,
          priority: 1,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setWorkflows(prev => [data, ...prev]);
      setShowCreateWorkflow(false);
      resetWorkflowForm();
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  }

  async function deleteWorkflow(id: string) {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const { error } = await supabase
        .from('workflow_rules')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting workflow:', error);
      alert('Failed to delete workflow. Please try again.');
    }
  }

  function resetWorkflowForm() {
    setNewWorkflow({
      name: '',
      description: '',
      contract_type: 'NDA',
      sla_hours: 24,
      conditions: '',
      trigger_rules: {},
      escalation_rules: {},
      approval_stages: [],
    });
  }

  function addApprovalStage() {
    setNewWorkflow(prev => ({
      ...prev,
      approval_stages: [
        ...prev.approval_stages,
        { stage_name: '', sla_hours: 24, required: true },
      ],
    }));
  }

  function updateApprovalStage(index: number, field: string, value: any) {
    setNewWorkflow(prev => ({
      ...prev,
      approval_stages: prev.approval_stages.map((stage, i) =>
        i === index ? { ...stage, [field]: value } : stage
      ),
    }));
  }

  function removeApprovalStage(index: number) {
    setNewWorkflow(prev => ({
      ...prev,
      approval_stages: prev.approval_stages.filter((_, i) => i !== index),
    }));
  }

  async function loadUserTasks() {
    setLoading(true);
    try {
      const userTasks = await workflowService.getUserTasks(user!.id);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskStatus(taskId: string, status: WorkflowTask['status']) {
    const result = await workflowService.updateTaskStatus(taskId, status);
    if (result.success) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'escalated': return 'text-red-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-6rem)]">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${c.text.primary}`}>Workflows & Compliance</h1>
        <p className={`text-sm ${c.text.secondary} mt-1`}>Manage tasks, compliance checks, and workflow automation</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'bg-tesa-blue text-white'
              : `${c.bg.tertiary} ${c.text.secondary} hover:bg-opacity-80`
          }`}
        >
          My Tasks ({tasks.filter(t => t.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'compliance'
              ? 'bg-tesa-blue text-white'
              : `${c.bg.tertiary} ${c.text.secondary} hover:bg-opacity-80`
          }`}
        >
          Compliance Checks
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'rules'
              ? 'bg-tesa-blue text-white'
              : `${c.bg.tertiary} ${c.text.secondary} hover:bg-opacity-80`
          }`}
        >
          Workflow Rules
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className={`${c.card.bg} border ${c.card.border} rounded-lg p-4`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className={c.text.secondary} />
                <span className={`text-sm font-medium ${c.text.primary}`}>Filters:</span>
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`px-3 py-1.5 text-sm border rounded ${c.input.bg} ${c.input.border} ${c.input.text}`}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-1.5 text-sm border rounded ${c.input.bg} ${c.input.border} ${c.input.text}`}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-tesa-blue"></div>
                <p className={`mt-2 text-sm ${c.text.secondary}`}>Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle size={48} className={`mx-auto mb-4 ${c.text.muted}`} />
                <p className={`text-lg font-medium ${c.text.primary}`}>No tasks found</p>
                <p className={`text-sm ${c.text.secondary} mt-1`}>All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border ${c.border.primary} rounded-lg p-4 ${c.bg.hover} transition-colors`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${c.text.primary}`}>{task.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className={`text-sm ${c.text.secondary}`}>{task.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id!, 'in_progress')}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id!, 'completed')}
                            className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className={c.text.muted} />
                        <span className={c.text.secondary}>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={c.text.muted}>Task type:</span>
                        <span className={c.text.secondary}>{task.task_type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className={`${c.card.bg} border ${c.card.border} rounded-lg p-6`}>
          <div className="mb-6">
            <h2 className={`text-xl font-bold ${c.text.primary} mb-2`}>Automated Compliance Checks</h2>
            <p className={`text-sm ${c.text.secondary}`}>
              AI-powered compliance validation for contracts and legal documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`${c.bg.tertiary} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-green-600" />
                <span className={`text-sm font-medium ${c.text.secondary}`}>Passed</span>
              </div>
              <div className={`text-3xl font-bold ${c.text.primary}`}>0</div>
            </div>
            <div className={`${c.bg.tertiary} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={20} className="text-red-600" />
                <span className={`text-sm font-medium ${c.text.secondary}`}>Failed</span>
              </div>
              <div className={`text-3xl font-bold ${c.text.primary}`}>0</div>
            </div>
            <div className={`${c.bg.tertiary} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={20} className="text-yellow-600" />
                <span className={`text-sm font-medium ${c.text.secondary}`}>Warnings</span>
              </div>
              <div className={`text-3xl font-bold ${c.text.primary}`}>0</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`font-semibold ${c.text.primary}`}>Check Types</h3>

            <div className={`border ${c.border.primary} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-blue-600" />
                  <div>
                    <h4 className={`font-medium ${c.text.primary}`}>Required Clauses Check</h4>
                    <p className={`text-xs ${c.text.muted}`}>Validates presence of mandatory contract clauses</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${c.badge.info.bg} ${c.badge.info.text}`}>
                  Automated
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div className={c.text.secondary}>• Checks for contract-type specific requirements</div>
                <div className={c.text.secondary}>• Validates jurisdiction-specific clauses</div>
                <div className={c.text.secondary}>• Flags missing critical sections</div>
              </div>
            </div>

            <div className={`border ${c.border.primary} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className="text-orange-600" />
                  <div>
                    <h4 className={`font-medium ${c.text.primary}`}>High-Risk Clauses Detection</h4>
                    <p className={`text-xs ${c.text.muted}`}>Identifies potentially problematic terms</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${c.badge.warning.bg} ${c.badge.warning.text}`}>
                  AI-Powered
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div className={c.text.secondary}>• Detects unlimited liability clauses</div>
                <div className={c.text.secondary}>• Flags perpetual obligations</div>
                <div className={c.text.secondary}>• Identifies non-compete restrictions</div>
              </div>
            </div>

            <div className={`border ${c.border.primary} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <h4 className={`font-medium ${c.text.primary}`}>GDPR/Data Protection Compliance</h4>
                    <p className={`text-xs ${c.text.muted}`}>Validates data protection requirements</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${c.badge.success.bg} ${c.badge.success.text}`}>
                  EU/DACH
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div className={c.text.secondary}>• Verifies GDPR compliance for EU contracts</div>
                <div className={c.text.secondary}>• Checks data processing agreements</div>
                <div className={c.text.secondary}>• Validates data breach notification clauses</div>
              </div>
            </div>

            <div className={`border ${c.border.primary} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <GitBranch size={20} className="text-purple-600" />
                  <div>
                    <h4 className={`font-medium ${c.text.primary}`}>Jurisdiction Compliance</h4>
                    <p className={`text-xs ${c.text.muted}`}>Ensures jurisdiction-specific requirements</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${c.badge.info.bg} ${c.badge.info.text}`}>
                  Multi-Jurisdiction
                </span>
              </div>
              <div className="text-xs space-y-1">
                <div className={c.text.secondary}>• Validates governing law clauses</div>
                <div className={c.text.secondary}>• Checks venue/jurisdiction provisions</div>
                <div className={c.text.secondary}>• Verifies local law compliance</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className={`${c.card.bg} border ${c.card.border} rounded-lg p-6`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${c.text.primary} mb-2`}>Workflow Automation Rules</h2>
              <p className={`text-sm ${c.text.secondary}`}>
                Configure intelligent routing and escalation based on contract conditions
              </p>
            </div>
            <button
              onClick={() => setShowCreateWorkflow(true)}
              className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              Create Workflow
            </button>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <div className={`${c.bg.tertiary} rounded-lg p-4 mb-3`}>
                <h3 className={`font-semibold ${c.text.primary} mb-3`}>Saved Workflows</h3>
                <div className="space-y-2">
                  {workflows.length === 0 ? (
                    <p className={`text-sm ${c.text.muted} italic py-4`}>No workflows created yet</p>
                  ) : (
                    workflows.map((workflow) => (
                      <div
                        key={workflow.id}
                        className={`group relative w-full text-left px-3 py-2 rounded transition-colors ${
                          selected === workflow.id ? 'bg-tesa-blue text-white' : c.bg.hover
                        }`}
                      >
                        <button
                          onClick={() => setSelected(workflow.id)}
                          className="w-full text-left"
                        >
                          <div className={`text-sm font-medium ${selected === workflow.id ? 'text-white' : c.text.primary}`}>
                            {workflow.rule_name}
                          </div>
                          <div className={`text-xs mt-0.5 ${selected === workflow.id ? 'text-blue-100' : c.text.muted}`}>
                            {workflow.routing_rules?.sla_hours || 24}h SLA
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkflow(workflow.id);
                          }}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded transition-all"
                          title="Delete workflow"
                        >
                          <Trash size={14} className={selected === workflow.id ? 'text-white' : c.text.muted} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-6">
              <div className={`${c.bg.tertiary} rounded-lg p-6 flex items-center justify-center min-h-[300px]`}>
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-3 border-2 ${c.border.primary} rounded`}>
                    <div className={`text-sm font-medium ${c.text.primary}`}>Start</div>
                  </div>
                  <ArrowRight className={c.text.muted} />
                  <div className="px-4 py-3 border-2 border-tesa-blue rounded bg-blue-50">
                    <div className={`text-sm font-medium ${c.text.primary}`}>Legal Review</div>
                    <div className="text-xs text-tesa-blue font-medium mt-1">
                      {selected === 'nda' ? '24h' : '48h'}
                    </div>
                  </div>
                  {selected === 'msa' && (
                    <>
                      <ArrowRight className={c.text.muted} />
                      <div className={`px-4 py-3 border-2 ${c.border.primary} rounded`}>
                        <div className={`text-sm font-medium ${c.text.primary}`}>Finance Approval</div>
                        <div className="text-xs text-tesa-blue font-medium mt-1">72h</div>
                      </div>
                    </>
                  )}
                  <ArrowRight className={c.text.muted} />
                  <div className={`px-4 py-3 border-2 ${c.border.primary} rounded`}>
                    <div className={`text-sm font-medium ${c.text.primary}`}>Done</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-3">
              <div className={`${c.bg.tertiary} rounded-lg p-4`}>
                <h3 className={`font-semibold ${c.text.primary} mb-3`}>Properties</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className={`block ${c.text.secondary} mb-1`}>Node name</label>
                    <input
                      className={`w-full px-3 py-1.5 border rounded ${c.input.bg} ${c.input.border} ${c.input.text}`}
                      value="Legal Review"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={`block ${c.text.secondary} mb-1`}>SLA (hours)</label>
                    <input
                      className={`w-full px-3 py-1.5 border rounded ${c.input.bg} ${c.input.border} ${c.input.text}`}
                      type="number"
                      value={selected === 'nda' ? 24 : 48}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={`block ${c.text.secondary} mb-1`}>Conditions</label>
                    <textarea
                      className={`w-full px-3 py-1.5 border rounded ${c.input.bg} ${c.input.border} ${c.input.text} text-xs`}
                      rows={3}
                      value="Risk score > 5 OR\nContract value > $100k OR\nHigh-risk clauses detected"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className={`${c.card.bg} rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border ${c.card.border}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${c.text.primary}`}>Create New Workflow</h2>
              <button
                onClick={() => {
                  setShowCreateWorkflow(false);
                  resetWorkflowForm();
                }}
                className={`p-2 ${c.bg.hover} rounded-lg transition-colors`}
              >
                <X size={20} className={c.text.muted} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="e.g., NDA Review Process"
                  className={`w-full px-4 py-2 border rounded-lg ${c.input.bg} ${c.input.border} ${c.input.text} ${c.input.placeholder}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                  Description
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  placeholder="Describe the workflow purpose and process"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg ${c.input.bg} ${c.input.border} ${c.input.text} ${c.input.placeholder}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                    Contract Type *
                  </label>
                  <select
                    value={newWorkflow.contract_type}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, contract_type: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${c.input.bg} ${c.input.border} ${c.input.text}`}
                  >
                    <option value="NDA">NDA</option>
                    <option value="MSA">MSA</option>
                    <option value="DPA">DPA</option>
                    <option value="SOW">SOW</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                    SLA (hours) *
                  </label>
                  <input
                    type="number"
                    value={newWorkflow.sla_hours}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, sla_hours: parseInt(e.target.value) || 24 })}
                    min={1}
                    className={`w-full px-4 py-2 border rounded-lg ${c.input.bg} ${c.input.border} ${c.input.text}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                  Trigger Conditions
                </label>
                <textarea
                  value={newWorkflow.conditions}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, conditions: e.target.value })}
                  placeholder="e.g., Contract value > $100k OR Risk score > 5"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg ${c.input.bg} ${c.input.border} ${c.input.text} ${c.input.placeholder}`}
                />
                <p className={`text-xs ${c.text.muted} mt-1`}>
                  Define conditions that trigger this workflow (optional)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-medium ${c.text.primary}`}>
                    Approval Stages
                  </label>
                  <button
                    onClick={addApprovalStage}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Stage
                  </button>
                </div>

                {newWorkflow.approval_stages.length === 0 ? (
                  <p className={`text-sm ${c.text.muted} italic py-3`}>
                    No approval stages defined. Click "Add Stage" to create workflow steps.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {newWorkflow.approval_stages.map((stage, index) => (
                      <div
                        key={index}
                        className={`border ${c.border.primary} rounded-lg p-3 ${c.bg.tertiary}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className={`block text-xs font-medium ${c.text.secondary} mb-1`}>
                                Stage Name
                              </label>
                              <input
                                type="text"
                                value={stage.stage_name}
                                onChange={(e) => updateApprovalStage(index, 'stage_name', e.target.value)}
                                placeholder="e.g., Legal Review"
                                className={`w-full px-3 py-1.5 text-sm border rounded ${c.input.bg} ${c.input.border} ${c.input.text}`}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={`block text-xs font-medium ${c.text.secondary} mb-1`}>
                                  SLA (hours)
                                </label>
                                <input
                                  type="number"
                                  value={stage.sla_hours}
                                  onChange={(e) => updateApprovalStage(index, 'sla_hours', parseInt(e.target.value) || 24)}
                                  min={1}
                                  className={`w-full px-3 py-1.5 text-sm border rounded ${c.input.bg} ${c.input.border} ${c.input.text}`}
                                />
                              </div>
                              <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={stage.required}
                                    onChange={(e) => updateApprovalStage(index, 'required', e.target.checked)}
                                    className="rounded"
                                  />
                                  <span className={`text-xs ${c.text.secondary}`}>Required</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeApprovalStage(index)}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                            title="Remove stage"
                          >
                            <Trash size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createWorkflow}
                  disabled={!newWorkflow.name.trim()}
                  className="flex-1 px-6 py-3 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Create Workflow
                </button>
                <button
                  onClick={() => {
                    setShowCreateWorkflow(false);
                    resetWorkflowForm();
                  }}
                  className={`px-6 py-3 ${c.bg.tertiary} rounded-lg hover:bg-opacity-80 transition-colors font-medium`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
