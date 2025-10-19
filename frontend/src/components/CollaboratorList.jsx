const CollaboratorCard = ({ collaborator, onEdit, onDelete }) => (
  <div className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
    <div className="flex items-center gap-4">
      {collaborator.photo_url ? (
        <img
          src={collaborator.photo_url}
          alt={`Foto de ${collaborator.name}`}
          className="h-14 w-14 rounded-full border-4 border-primary/10 object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-600">
          {collaborator.name
            .split(' ')
            .map((part) => part.charAt(0))
            .join('')
            .slice(0, 2)}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-slate-900">{collaborator.name}</p>
        <p className="text-xs uppercase tracking-wide text-slate-400">{collaborator.role}</p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
          {collaborator.department && <span>{collaborator.department}</span>}
          {collaborator.email && <span>{collaborator.email}</span>}
          {collaborator.phone && <span>{collaborator.phone}</span>}
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onEdit(collaborator)}
        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-primary hover:text-primary"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => onDelete(collaborator)}
        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-500 transition hover:border-red-400 hover:text-red-600"
      >
        Remover
      </button>
    </div>
  </div>
);

const CollaboratorList = ({ collaborators, onEdit, onDelete }) => (
  <div className="space-y-3">
    {collaborators.map((collaborator) => (
      <CollaboratorCard
        key={collaborator.id}
        collaborator={collaborator}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
    {collaborators.length === 0 && (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-10 text-center text-sm text-slate-500">
        Ainda não há colaboradores cadastrados.
      </div>
    )}
  </div>
);

export default CollaboratorList;
