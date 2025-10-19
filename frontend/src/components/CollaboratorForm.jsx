import { useEffect, useMemo, useState } from 'react';

const defaultValues = {
  name: '',
  role: '',
  email: '',
  department: '',
  phone: '',
  managerId: '',
};

const CollaboratorForm = ({ initialData, collaborators, onSubmit, onCancel, submitLabel = 'Salvar' }) => {
  const [form, setForm] = useState(() => ({ ...defaultValues, ...initialData }));
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    setForm({ ...defaultValues, ...initialData });
  }, [initialData]);

  const managerOptions = useMemo(
    () =>
      collaborators
        .filter((col) => !initialData || col.id !== initialData.id)
        .map((col) => ({ value: col.id, label: `${col.name} — ${col.role}` })),
    [collaborators, initialData]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    setPhoto(file || null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form };
    if (photo) payload.photo = photo;
    onSubmit(payload, () => {
      setPhoto(null);
      if (!initialData) {
        setForm({ ...defaultValues });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="name">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="role">
              Cargo
            </label>
            <input
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="department">
              Departamento
            </label>
            <input
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="phone">
              Telefone
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="managerId">
              Superior imediato
            </label>
            <select
              id="managerId"
              name="managerId"
              value={form.managerId || ''}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Sem superior</option>
              {managerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-600">Foto de perfil</label>
        <div className="mt-2 flex items-center gap-4">
          {(photo || initialData?.photo_url) && (
            <img
              src={photo ? URL.createObjectURL(photo) : initialData.photo_url}
              alt={`Foto de ${form.name}`}
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
          )}
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary">
            <span>Enviar foto</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        </div>
        <p className="mt-1 text-xs text-slate-500">Utilize uma foto quadrada para obter melhor resultado.</p>
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-soft transition hover:bg-primary-dark"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CollaboratorForm;
