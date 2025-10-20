import { useEffect, useState } from 'react';
import ThemeSelector from './ThemeSelector';
import { API_BASE_URL } from '../services/api';

const defaultValues = {
  name: '',
  cnpj: '',
  description: '',
  themeType: 'solid',
  themeValue: '#0ea5e9',
};

const CompanyForm = ({ initialData, onSubmit, onCancel, submitLabel = 'Salvar' }) => {
  const [form, setForm] = useState(() => ({
    ...defaultValues,
    ...initialData,
  }));
  const [logo, setLogo] = useState(null);

  const normalizedBase = (API_BASE_URL || '').replace(/\/$/, '');

  const buildAssetUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/^\/+/, '');
    if (!normalizedBase) {
      return `/${cleanPath}`;
    }
    return `${normalizedBase}/${cleanPath}`;
  };

  useEffect(() => {
    setForm({ ...defaultValues, ...initialData });
    setLogo(null);
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (theme) => {
    setForm((prev) => ({ ...prev, ...theme }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    setLogo(file || null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form };
    if (logo) payload.logo = logo;
    onSubmit(payload, () => {
      setLogo(null);
      if (!initialData) {
        setForm({ ...defaultValues });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="name">
              Nome da empresa
            </label>
            <input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="cnpj">
              CNPJ
            </label>
            <input
              id="cnpj"
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="description">
              Descrição breve
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Logotipo</label>
            <div className="mt-2 flex items-center gap-4">
              {(logo || form.logo_url || form.logo_path) && (
                <img
                  src={
                    logo
                      ? URL.createObjectURL(logo)
                      : form.logo_url || buildAssetUrl(form.logo_path)
                  }
                  alt="Pré-visualização do logotipo"
                  className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm"
                />
              )}
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary">
                <span>Selecionar arquivo</span>
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
            </div>
            <p className="mt-1 text-xs text-slate-500">Formatos sugeridos: PNG ou JPG quadrado.</p>
          </div>
          <ThemeSelector value={{ themeType: form.themeType, themeValue: form.themeValue }} onChange={handleThemeChange} />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
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

export default CompanyForm;
