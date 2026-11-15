import React, { useState, useEffect } from 'react';
import { User, Plus, X, Sparkles, Check } from 'lucide-react';
import { fetchUsersList, createChildUserApi, setCurrentUserId, getCurrentUserId } from '../services/api.js';
import { Mascot } from './Mascot.js';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelected: (user: any) => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  onUserSelected
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('chispa');
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    if (isOpen) {
      fetchUsersList().then(list => {
        setUsers(list);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (user: any) => {
    setCurrentUserId(user.id);
    onUserSelected(user);
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await createChildUserApi(newName.trim(), newAvatar, '1234');
      setUsers(prev => [...prev, created]);
      handleSelect(created);
    } catch (err: any) {
      alert(err.message || 'Error al crear estudiante');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-4xl p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-magic-200 animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-1 mb-6">
          <span className="text-xs font-black uppercase tracking-wider text-magic-600 bg-magic-100 px-3 py-1 rounded-full">
            Perfiles de Estudio
          </span>
          <h3 className="text-2xl font-black text-slate-800">¿Quién va a estudiar hoy?</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Tus estrellas, temas y progresos se guardan en tu perfil.
          </p>
        </div>

        {!isCreating ? (
          <div className="space-y-4">
            {/* Lista de perfiles */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {users.map(u => {
                const isSelected = u.id === currentUserId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(u)}
                    className={`w-full p-4 rounded-3xl border-3 flex items-center justify-between transition-all duration-150 active:scale-98 shadow-sm ${
                      isSelected
                        ? 'bg-magic-50 border-magic-500 ring-4 ring-magic-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                        <Mascot mascotType={u.avatar || 'chispa'} size="sm" mood="happy" />
                      </div>
                      <div className="text-left">
                        <span className="font-black text-slate-800 text-lg block leading-tight">{u.name}</span>
                        <span className="text-xs font-bold text-amber-700">⭐ {u.stars || 10} estrellas</span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-8 h-8 rounded-full bg-magic-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Botón Nuevo Perfil */}
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-magic-300 text-magic-700 font-black text-sm flex items-center justify-center gap-2 hover:bg-magic-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Añadir otro estudiante</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                Nombre de la niña o niño:
              </label>
              <input
                type="text"
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ej: Samantha"
                className="w-full px-4 py-3 rounded-2xl border-2 border-magic-300 focus:outline-none focus:border-magic-600 font-bold text-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                Elige su mascota:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewAvatar('chispa')}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-2 ${
                    newAvatar === 'chispa' ? 'bg-amber-100 border-amber-500 font-black' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Mascot mascotType="chispa" size="sm" />
                  <span className="text-xs">Chispa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewAvatar('buho')}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-2 ${
                    newAvatar === 'buho' ? 'bg-magic-100 border-magic-500 font-black' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Mascot mascotType="buho" size="sm" />
                  <span className="text-xs">Búho</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="flex-1 py-3.5 rounded-2xl bg-magic-600 hover:bg-magic-700 text-white font-black shadow-lg shadow-magic-300"
              >
                Guardar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
