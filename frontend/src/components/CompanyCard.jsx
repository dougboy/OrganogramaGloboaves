const CompanyCard = ({ company, onSelect, onEdit, onDelete, isActive }) => (
  <article
    className={`group rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-soft ${
      isActive ? 'border-primary bg-white shadow-soft' : 'border-slate-200 bg-white/70'
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        {company.logo_url && (
          <img
            src={company.logo_url}
            alt={`Logo ${company.name}`}
            className="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
          {company.cnpj && <p className="text-xs uppercase tracking-wide text-slate-400">CNPJ {company.cnpj}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(company)}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-primary hover:text-primary"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(company)}
          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-500 transition hover:border-red-400 hover:text-red-600"
        >
          Remover
        </button>
      </div>
    </div>
    {company.description && <p className="mt-4 text-sm text-slate-500">{company.description}</p>}
    <div className="mt-6 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onSelect(company)}
        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-soft transition hover:bg-slate-700"
      >
        Ver equipe
      </button>
      {company.public_url && (
        <a
          href={company.public_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-wide text-primary transition hover:text-primary-dark"
        >
          Ver organograma público
        </a>
      )}
    </div>
  </article>
);

export default CompanyCard;
