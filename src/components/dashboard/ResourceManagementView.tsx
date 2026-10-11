import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Droplet,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import { ResourceItem, ResourceStatus } from '../../types';
import { ResourceStatusBadge, ConfidenceBadge } from '../common/StatusBadge';
import { ResourceEditModal } from '../modals/ResourceEditModal';

export const ResourceManagementView: React.FC = () => {
  const { currentHospital, updateResourceQuantity, addResource, removeResource, updateBloodStock } = useMediLink();
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Resource Form state
  const [newResName, setNewResName] = useState('');
  const [newResCategory, setNewResCategory] = useState('Critical Care');
  const [newResTotal, setNewResTotal] = useState(10);
  const [newResAvailable, setNewResAvailable] = useState(5);

  if (!currentHospital) return null;

  const filteredResources = currentHospital.resources.filter((res) => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || (res.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleQuickAdjust = (resourceId: string, delta: number) => {
    const res = currentHospital.resources.find((r) => r.id === resourceId);
    if (res) {
      const newAvail = Math.max(0, Math.min(res.totalQuantity, res.availableQuantity + delta));
      updateResourceQuantity(currentHospital.id, resourceId, newAvail);
    }
  };

  const handleBloodAdjust = (group: string, delta: number) => {
    const item = currentHospital.bloodInventory.find((b) => b.group === group);
    if (item) {
      const newUnits = Math.max(0, item.units + delta);
      updateBloodStock(currentHospital.id, group, newUnits);
    }
  };

  const handleAddNewResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResName.trim()) {
      addResource(currentHospital.id, {
        type: 'custom',
        name: newResName.trim(),
        category: newResCategory,
        totalQuantity: newResTotal,
        availableQuantity: newResAvailable,
        reservedQuantity: 0,
        occupiedQuantity: newResTotal - newResAvailable,
        status: newResAvailable > 0 ? 'available' : 'occupied',
        confidence: 'HIGH',
        lastVerified: 'Just now',
      });
      setNewResName('');
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A3D34]">Resource Telemetry & Capacity</h2>
          <p className="text-xs sm:text-sm text-[#707565] mt-1">
            Manage live bed capacities, equipment, and blood inventory for {currentHospital.name}.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] font-serif font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Resource</span>
        </button>
      </div>

      {/* Blood Bank Live Stock Widget */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E5E2D9] shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF0ED] text-[#C87D55] flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#3A3D34]">Blood Bank Inventory Telemetry</h3>
              <p className="text-[11px] text-[#707565]">Live units available for emergency transfusions</p>
            </div>
          </div>
          <span className="text-xs text-[#5F8575] font-semibold bg-[#F1F3EB] px-3 py-1 rounded-full border border-[#D9E2D5]">
            Real-Time Bank Synced
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {currentHospital.bloodInventory.map((item) => (
            <div
              key={item.group}
              className="bg-[#F9F7F2] rounded-2xl p-3.5 border border-[#E5E2D9] text-center flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-serif font-bold text-[#C87D55]">{item.group}</span>
                <div className="text-xl font-bold text-[#3A3D34] mt-0.5">{item.units} <span className="text-[10px] font-normal text-[#707565]">units</span></div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 pt-2 border-t border-[#E5E2D9]">
                <button
                  onClick={() => handleBloodAdjust(item.group, -1)}
                  className="w-6 h-6 rounded-full bg-white border border-[#DCD7CD] text-[#3A3D34] hover:bg-[#F1EDE4] flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs"
                >
                  -
                </button>
                <button
                  onClick={() => handleBloodAdjust(item.group, 1)}
                  className="w-6 h-6 rounded-full bg-white border border-[#DCD7CD] text-[#3A3D34] hover:bg-[#F1EDE4] flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C947A] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search resources by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#DCD7CD] rounded-full pl-10 pr-4 py-2.5 text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#707565]" />
          <span className="text-xs text-[#707565] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#DCD7CD] rounded-full px-4 py-2 text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="reserved">Reserved Only</option>
            <option value="occupied">Occupied Only</option>
          </select>
        </div>
      </div>

      {/* Resource Inventory Table */}
      <div className="bg-white rounded-[32px] border border-[#E5E2D9] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1EDE4] text-[#707565] font-semibold border-b border-[#E5E2D9]">
              <tr>
                <th className="py-4 px-6">Resource Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Availability Ratio</th>
                <th className="py-4 px-6">Operational Status</th>
                <th className="py-4 px-6">Confidence</th>
                <th className="py-4 px-6">Quick Adjust</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2D9] text-[#3A3D34]">
              {filteredResources.map((res) => (
                <tr key={res.id} className="hover:bg-[#F9F7F2] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-serif font-bold text-[#3A3D34] text-sm">{res.name}</div>
                    <div className="text-[10px] text-[#707565]">Verified {res.lastVerified}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-[#F1EDE4] text-[#707565] px-2.5 py-1 rounded-full text-[11px] font-medium">
                      {res.category || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-serif font-bold text-[#3A3D34]">{res.availableQuantity}</span>
                    <span className="text-[#707565]"> / {res.totalQuantity} units</span>
                    {res.reservedQuantity > 0 && (
                      <span className="ml-2 text-[#B07D38] font-semibold text-[10px]">
                        ({res.reservedQuantity} reserved)
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <ResourceStatusBadge status={res.status} />
                  </td>
                  <td className="py-4 px-6">
                    <ConfidenceBadge confidence={res.confidence} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickAdjust(res.id, -1)}
                        className="w-6 h-6 rounded-full bg-[#F1EDE4] text-[#3A3D34] hover:bg-[#EAE4D8] font-bold flex items-center justify-center cursor-pointer text-xs"
                        title="Decrease available count"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(res.id, 1)}
                        className="w-6 h-6 rounded-full bg-[#F1EDE4] text-[#3A3D34] hover:bg-[#EAE4D8] font-bold flex items-center justify-center cursor-pointer text-xs"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => setEditingResource(res)}
                      className="p-1.5 rounded-full text-[#707565] hover:text-[#3A3D34] hover:bg-[#F1EDE4] transition-colors cursor-pointer"
                      title="Edit telemetry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeResource(currentHospital.id, res.id)}
                      className="p-1.5 rounded-full text-[#707565] hover:text-[#C87D55] hover:bg-[#FAF0ED] transition-colors cursor-pointer"
                      title="Delete resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <ResourceEditModal
        isOpen={!!editingResource}
        resource={editingResource}
        onClose={() => setEditingResource(null)}
        onSave={(updated) => updateResourceQuantity(currentHospital.id, updated.id, updated.availableQuantity)}
      />

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-xl border border-[#E5E2D9] p-7 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#3A3D34]">+ Add Clinical Resource</h3>
            <form onSubmit={handleAddNewResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Resource Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neonatal Incubator"
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-2.5 text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Category</label>
                <select
                  value={newResCategory}
                  onChange={(e) => setNewResCategory(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-2.5 text-xs text-[#3A3D34] focus:outline-none focus:border-[#8C947A]"
                >
                  <option value="Critical Care">Critical Care</option>
                  <option value="Emergency Department">Emergency Department</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Operating Theatre">Operating Theatre</option>
                  <option value="Diagnostic / Imaging">Diagnostic / Imaging</option>
                  <option value="Specialized Asset">Specialized Asset</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Available Units</label>
                  <input
                    type="number"
                    min={0}
                    value={newResAvailable}
                    onChange={(e) => setNewResAvailable(Number(e.target.value))}
                    className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-2.5 text-xs text-[#3A3D34]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3A3D34] mb-1.5">Total Units</label>
                  <input
                    type="number"
                    min={1}
                    value={newResTotal}
                    onChange={(e) => setNewResTotal(Number(e.target.value))}
                    className="w-full bg-[#F9F7F2] border border-[#E5E2D9] rounded-2xl px-4 py-2.5 text-xs text-[#3A3D34]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E2D9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#707565] font-semibold hover:text-[#3A3D34]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#8C947A] hover:bg-[#788066] text-[#F9F7F2] font-serif font-bold px-5 py-2.5 rounded-full text-xs"
                >
                  Confirm & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
