import React, { useState } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';

interface Membership {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  status: 'active' | 'pending' | 'inactive';
}

interface MembershipFormData {
  name: string;
  price: number;
  duration: string;
  features: string[];
}

export function AdminMemberships() {
  const [searchQuery, setSearchQuery] = useState('');
  const [memberships, setMemberships] = useState<Membership[]>([
    {
      id: '1',
      name: 'الخطة الأساسية',
      price: 99,
      duration: '1 شهر',
      features: ['برنامج تدريبي', 'برنامج غذائي', 'متابعة يومية'],
      status: 'active'
    },
    {
      id: '2',
      name: 'الخطة المتقدمة',
      price: 199,
      duration: '3 شهور',
      features: ['برنامج تدريبي متقدم', 'برنامج غذائي مخصص', 'متابعة يومية', 'جلسات خاصة'],
      status: 'active'
    },
    {
      id: '3',
      name: 'الخطة الاحترافية',
      price: 299,
      duration: '6 شهور',
      features: ['برنامج تدريبي احترافي', 'برنامج غذائي احترافي', 'متابعة مستمرة', 'جلسات خاصة', 'استشارات غير محدودة'],
      status: 'active'
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [formData, setFormData] = useState<MembershipFormData>({
    name: '',
    price: 0,
    duration: '',
    features: []
  });

  const handleEdit = (membership: Membership) => {
    setEditingMembership(membership);
    setFormData({
      name: membership.name,
      price: membership.price,
      duration: membership.duration,
      features: membership.features
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingMembership(null);
    setFormData({
      name: '',
      price: 0,
      duration: '',
      features: []
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingMembership) {
      // Update existing membership
      setMemberships(prev => prev.map(m => 
        m.id === editingMembership.id 
          ? { ...m, ...formData }
          : m
      ));
    } else {
      // Add new membership
      const newMembership: Membership = {
        id: Date.now().toString(),
        ...formData,
        status: 'active'
      };
      setMemberships(prev => [...prev, newMembership]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العضوية؟')) return;
    setMemberships(prev => prev.filter(m => m.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'pending':
        return 'text-amber-500 bg-amber-500/10';
      case 'inactive':
        return 'text-rose-500 bg-rose-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1A1F2E] rounded-xl border border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">العضويات</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Filter size={16} className="text-white/60" />
            </button>
            <button 
              onClick={handleAdd}
              className="bg-[#0AE7F2] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>إضافة عضوية</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث عن عضوية..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#0AE7F2]/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">العضوية</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">السعر</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">المدة</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">المميزات</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الحالة</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60"></th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <tr key={membership.id} className="border-b border-white/10 last:border-0">
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0AE7F2]/10 rounded-lg flex items-center justify-center">
                      <CreditCard size={16} className="text-[#0AE7F2]" />
                    </div>
                    <span className="font-medium">{membership.name}</span>
                  </div>
                </td>
                <td className="py-3 px-6">
                  <span className="text-sm">₪{membership.price}</span>
                </td>
                <td className="py-3 px-6">
                  <span className="text-sm">{membership.duration}</span>
                </td>
                <td className="py-3 px-6">
                  <div className="flex flex-wrap gap-2">
                    {membership.features.map((feature, index) => (
                      <span key={index} className="text-xs bg-[#0AE7F2]/10 text-[#0AE7F2] px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-6">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(membership.status)}`}>
                    {getStatusIcon(membership.status)}
                    <span>
                      {membership.status === 'active' ? 'نشط' : 
                       membership.status === 'pending' ? 'معلق' : 'غير نشط'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(membership)}
                      className="p-2 hover:bg-[#0AE7F2]/10 rounded-full transition-colors text-[#0AE7F2]"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(membership.id)}
                      className="p-2 hover:bg-rose-500/10 rounded-full transition-colors text-rose-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-[#0AE7F2]/20">
              <h2 className="text-xl font-bold">
                {editingMembership ? 'تعديل العضوية' : 'إضافة عضوية جديدة'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">اسم العضوية</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">السعر</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">المدة</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                  placeholder="مثال: 3 شهور"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">المميزات (افصل بين المميزات بسطر جديد)</label>
                <textarea
                  value={formData.features.join('\n')}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2] h-32 resize-none"
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#0AE7F2]/20">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors"
                >
                  {editingMembership ? 'حفظ التغييرات' : 'إضافة العضوية'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}