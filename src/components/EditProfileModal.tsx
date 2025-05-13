import React, { useState } from 'react';
import { X, Camera, Save } from 'lucide-react';

interface EditProfileModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    email: string;
    phone: string;
    height: number;
    weight: number;
    age: number;
    goal: string;
  }) => void;
  initialData: {
    name: string;
    email: string;
    phone: string;
    height: number;
    weight: number;
    age: number;
    goal: string;
  };
}

export function EditProfileModal({ onClose, onSave, initialData }: EditProfileModalProps) {
  const [formData, setFormData] = useState(initialData);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#0AE7F2]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">تعديل الملف الشخصي</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Photo Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-[#0A0F1C] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#0AE7F2]">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[#0AE7F2] text-4xl font-bold">
                    {formData.name.charAt(0)}
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-[#0AE7F2] p-2 rounded-full cursor-pointer"
              >
                <Camera size={16} className="text-black" />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">الاسم</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">الطول (سم)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">الوزن (كجم)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">العمر</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">الهدف</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                required
              >
                <option value="weight_loss">خسارة الوزن</option>
                <option value="muscle_gain">زيادة الكتلة العضلية</option>
                <option value="maintain">المحافظة على الوزن</option>
                <option value="fitness">تحسين اللياقة البدنية</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-[#0AE7F2]/20">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}