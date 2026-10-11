import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Layers, Save, CheckCircle2 } from 'lucide-react';
import { ResourceItem, ResourceStatus } from '../../types';

interface ResourceEditModalProps {
  resource: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ResourceItem) => void;
}

export const ResourceEditModal: React.FC<ResourceEditModalProps> = ({
  resource,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(10);
  const [availableQuantity, setAvailableQuantity] = useState(5);
  const [status, setStatus] = useState<ResourceStatus>('available');

  useEffect(() => {
    if (resource) {
      setName(resource.name);
      setTotalQuantity(resource.totalQuantity);
      setAvailableQuantity(resource.availableQuantity);
      setStatus(resource.status);
    }
  }, [resource]);

  if (!isOpen || !resource) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...resource,
      name,
      totalQuantity,
      availableQuantity,
      status: availableQuantity === 0 ? 'occupied' : status,
      lastVerified: 'Just now',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-[#1A2233] text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3E8FC4]/20 text-[#3BC9C4] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Update Resource Telemetry</h3>
              <p className="text-xs text-slate-400">Broadcast live inventory change</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Resource Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#3BC9C4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Available Units</label>
              <input
                type="number"
                required
                min={0}
                max={totalQuantity}
                value={availableQuantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAvailableQuantity(val);
                  if (val === 0) setStatus('occupied');
                  else if (status === 'occupied') setStatus('available');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-emerald-600 focus:outline-none focus:border-[#3BC9C4]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Capacity</label>
              <input
                type="number"
                required
                min={1}
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Operational State</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ResourceStatus)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3BC9C4]"
            >
              <option value="available">🟢 Available (Ready for emergency requests)</option>
              <option value="reserved">🟡 Reserved (Locked for incoming patient)</option>
              <option value="occupied">🔴 Occupied (At full capacity)</option>
              <option value="unknown">⚪ Unknown / Unverified</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3E8FC4] to-[#3BC9C4] hover:opacity-95 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Broadcast Telemetry Update</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
