import { useMemo } from 'react';

const buildHierarchy = (nodes) => {
  const map = new Map();
  nodes.forEach((node) => {
    map.set(node.id, { ...node, children: [] });
  });
  const roots = [];
  map.forEach((node) => {
    if (node.manager_id && map.has(node.manager_id)) {
      map.get(node.manager_id).children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
};

const renderNode = (node) => (
  <li key={node.id} className="flex flex-col items-center px-4 pt-8">
    <div className="w-60 rounded-2xl border border-slate-200/70 bg-white/95 px-6 py-5 text-center shadow-soft">
      {node.photo_url && (
        <img
          src={node.photo_url}
          alt={`Foto de ${node.name}`}
          className="mx-auto mb-3 h-20 w-20 rounded-full border-4 border-primary/20 object-cover shadow"
        />
      )}
      <p className="text-base font-semibold text-slate-900">{node.name}</p>
      <p className="mt-1 text-sm text-slate-500">{node.role}</p>
      {(node.department || node.email) && (
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500">
          {node.department && <p>{node.department}</p>}
          {node.email && <p>{node.email}</p>}
        </div>
      )}
    </div>
    {node.children && node.children.length > 0 && (
      <ul className="mt-6 flex flex-wrap justify-center gap-6 border-t-2 border-slate-200 pt-6">
        {node.children.map((child) => renderNode(child))}
      </ul>
    )}
  </li>
);

const themeStyle = (themeType, themeValue) => {
  if (themeType === 'gradient') {
    return { backgroundImage: `linear-gradient(${themeValue})` };
  }
  if (themeType === 'image') {
    return {
      backgroundImage: `url(${themeValue})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { backgroundColor: themeValue || '#f8fafc' };
};

const OrganogramPreview = ({ collaborators = [], company }) => {
  const nodes = useMemo(() => buildHierarchy(collaborators), [collaborators]);

  if (collaborators.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-500">
        Adicione colaboradores para visualizar a prévia do organograma.
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white/60 p-10 shadow-inner"
      style={themeStyle(company?.theme_type, company?.theme_value)}
    >
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-soft">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Pré-visualização</h2>
          <p className="text-sm text-slate-500">Organograma público de {company?.name}</p>
        </div>
        <div className="overflow-x-auto">
          <div className="flex justify-center">
            <ul className="flex flex-wrap justify-center gap-6">
              {nodes.map((node) => renderNode(node))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganogramPreview;
