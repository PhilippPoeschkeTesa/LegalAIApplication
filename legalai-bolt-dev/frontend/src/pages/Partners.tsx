import { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { Building2, FileText, AlertTriangle, TrendingUp, Users as UsersIcon, Phone, Plus, Edit2, X } from 'lucide-react';

const dummyPartners = [
  { id: '1', name: 'Acme GmbH', country: 'DE', jurisdiction: 'Germany', contracts: 12, risk: 'Medium', created_at: '2020-03-15' },
  { id: '2', name: 'Nordex SE', country: 'DE', jurisdiction: 'Germany', contracts: 8, risk: 'Low', created_at: '2019-06-20' },
  { id: '3', name: 'Contoso Ltd', country: 'UK', jurisdiction: 'United Kingdom', contracts: 5, risk: 'High', created_at: '2021-11-10' },
];

const dummyContracts = [
  { title: 'MSA 2025', type: 'MSA', status: 'Active', jurisdiction: 'DE', risk: 'High', updated: '2025-09-30' },
  { title: 'NDA 2024', type: 'NDA', status: 'Draft', jurisdiction: 'DE', risk: 'Medium', updated: '2025-10-10' },
];

export function Partners() {
  const { isDark } = useTheme();
  const { t } = useLocale();
  const [partners, setPartners] = useState<any[]>(dummyPartners);
  const [selected, setSelected] = useState<any>(dummyPartners[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    country: '',
    jurisdiction: '',
    risk: 'Low',
  });

  const stats = {
    total_contracts: selected?.contracts || 0,
    active_contracts: Math.floor((selected?.contracts || 0) * 0.8),
    high_risk_count: selected?.risk === 'High' ? 2 : selected?.risk === 'Medium' ? 1 : 0,
    avg_cycle_time_days: 14,
  };

  const openAddModal = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      legal_name: '',
      country: '',
      jurisdiction: '',
      risk: 'Low',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (partner: any) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      legal_name: partner.legal_name || '',
      country: partner.country || '',
      jurisdiction: partner.jurisdiction || '',
      risk: partner.risk || 'Low',
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingPartner) {
      const updated = partners.map((p) =>
        p.id === editingPartner.id
          ? { ...p, ...formData }
          : p
      );
      setPartners(updated);
      setSelected({ ...selected, ...formData });
    } else {
      const newPartner = {
        id: String(partners.length + 1),
        ...formData,
        contracts: 0,
        created_at: new Date().toISOString().split('T')[0],
      };
      setPartners([...partners, newPartner]);
      setSelected(newPartner);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className={`w-80 border-r border-slate-200 ${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} overflow-y-auto`}>
        <div className={`p-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{t.partners.title}</h2>
            <button
              onClick={openAddModal}
              className="p-2 bg-tesa-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Add Partner"
            >
              <Plus size={18} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search partners..."
            className={`w-full px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white placeholder-slate-400' : 'border-slate-300 bg-white'} rounded-lg text-sm`}
          />
        </div>

        <div className="p-2">
          {partners.map((partner) => (
            <button
              key={partner.id}
              onClick={() => setSelected(partner)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                selected?.id === partner.id
                  ? isDark ? 'bg-tesa-blue/20 text-tesa-blue' : 'bg-blue-50 text-tesa-blue'
                  : isDark ? 'hover:bg-slate-700/50 text-white' : 'hover:bg-slate-50 text-slate-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 ${selected?.id === partner.id ? isDark ? 'bg-tesa-blue/30' : 'bg-blue-100' : isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg`}>
                  <Building2 size={18} className={selected?.id === partner.id ? 'text-tesa-blue' : isDark ? 'text-slate-300' : 'text-slate-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm truncate ${selected?.id === partner.id ? 'text-tesa-blue' : isDark ? 'text-white' : 'text-slate-900'}`}>{partner.name}</div>
                  <div className={`text-xs ${selected?.id === partner.id ? isDark ? 'text-blue-300' : 'text-tesa-blue/70' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>{partner.country}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Building2 size={64} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Select a partner to view details</p>
            </div>
          </div>
        ) : (
          <div className="p-6 max-w-6xl mx-auto">
            <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 mb-6`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1`}>{selected.name}</h1>
                  <p className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>{selected.legal_name || selected.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(selected)}
                    className={`p-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} rounded-lg transition-colors`}
                    title="Edit Partner"
                  >
                    <Edit2 size={18} className={isDark ? 'text-slate-300' : 'text-slate-600'} />
                  </button>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {selected.risk_rating || 'Low Risk'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm">
                  <div className={`${isDark ? "text-slate-400" : "text-slate-600"} mb-1`}>Country</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selected.country}</div>
                </div>
                <div className="text-sm">
                  <div className={`${isDark ? "text-slate-400" : "text-slate-600"} mb-1`}>Jurisdiction</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selected.jurisdiction}</div>
                </div>
                <div className="text-sm">
                  <div className={`${isDark ? "text-slate-400" : "text-slate-600"} mb-1`}>Partner Since</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {new Date(selected.created_at).getFullYear()}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Contracts', value: stats?.total_contracts || 0, icon: FileText, color: 'blue' },
                { label: 'Active', value: stats?.active_contracts || 0, icon: TrendingUp, color: 'green' },
                { label: 'High Risk', value: stats?.high_risk_count || 0, icon: AlertTriangle, color: 'red' },
                { label: 'Avg Cycle Time', value: `${stats?.avg_cycle_time_days || 0}d`, icon: TrendingUp, color: 'purple' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-4`}>
                    <div className={`p-2 ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : stat.color === 'green' ? 'bg-green-50 text-green-600' : stat.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'} rounded-lg w-fit mb-2`}>
                      <Icon size={20} />
                    </div>
                    <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1`}>{stat.value}</div>
                    <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
                  <FileText size={18} />
                  {t.partners.contracts}
                </h3>
                <div className="space-y-2">
                  {dummyContracts.map((contract, i) => (
                    <Link
                      key={i}
                      to={`/review/${i+1}`}
                      className={`block p-3 border ${isDark ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-200 hover:bg-slate-50"} rounded-lg transition-colors group`}
                    >
                      <div className={`font-medium text-sm ${isDark ? "text-white group-hover:text-tesa-blue" : "text-slate-900 group-hover:text-tesa-blue"} mb-1 transition-colors`}>
                        {contract.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-tesa-blue rounded font-medium">{contract.status}</span>
                        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Updated: {contract.updated}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
                  <UsersIcon size={18} />
                  {t.partners.contacts}
                </h3>
                <div className="space-y-3">
                  {(selected.contacts || []).length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No contacts available</p>
                  ) : (
                    selected.contacts.map((contact: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-tesa-blue font-medium">
                          {contact.name?.[0]}
                        </div>
                        <div>
                          <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{contact.name}</div>
                          <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>{contact.role}</div>
                          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1 mt-1`}>
                            <Phone size={12} />
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-lg border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-colors`}
              >
                <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Partner Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  placeholder="e.g., Acme GmbH"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Legal Name
                </label>
                <input
                  type="text"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  placeholder="Full legal name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                    placeholder="e.g., DE"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Jurisdiction *
                  </label>
                  <input
                    type="text"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                    placeholder="e.g., Germany"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Risk Level
                </label>
                <select
                  value={formData.risk}
                  onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 border rounded-lg transition-colors ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.country || !formData.jurisdiction}
                className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingPartner ? 'Save Changes' : 'Add Partner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
