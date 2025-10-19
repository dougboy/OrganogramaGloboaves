import { useEffect, useMemo, useState } from 'react';
import CompanyCard from '../components/CompanyCard';
import CompanyForm from '../components/CompanyForm';
import CollaboratorForm from '../components/CollaboratorForm';
import CollaboratorList from '../components/CollaboratorList';
import OrganogramPreview from '../components/OrganogramPreview';
import {
  createCompany,
  deleteCompany,
  generateOrganogram,
  getCompanies,
  getCompanyWithPeople,
  updateCompany,
} from '../services/companies';
import {
  createCollaborator,
  deleteCollaborator,
  getCollaborators,
  updateCollaborator,
} from '../services/collaborators';

const DashboardPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [message, setMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const publicBase = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:4000', []);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await getCompanies();
        setCompanies(
          data.map((company) => ({
            ...company,
            public_url: `${publicBase.replace(/\/$/, '')}/empresa/${company.slug}`,
          }))
        );
        if (data.length > 0) {
          handleSelectCompany(data[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [publicBase]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const refreshCompanies = async (selectId) => {
    const data = await getCompanies();
    const mapped = data.map((company) => ({
      ...company,
      public_url: `${publicBase.replace(/\/$/, '')}/empresa/${company.slug}`,
    }));
    setCompanies(mapped);
    if (selectId) {
      await handleSelectCompany(selectId);
    }
  };

  const handleSelectCompany = async (id) => {
    try {
      const data = await getCompanyWithPeople(id);
      const normalizedLogo = data.logo_url
        ? data.logo_url
        : data.logo_path
        ? `${publicBase.replace(/\/$/, '')}/${data.logo_path.replace(/^\//, '')}`
        : null;
      setSelectedCompany({ ...data, logo_url: normalizedLogo });
      setCollaborators(
        data.collaborators.map((col) => ({
          ...col,
          photo_url: col.photo_url
            ? col.photo_url
            : col.photo_path
            ? `${publicBase.replace(/\/$/, '')}/${col.photo_path.replace(/^\//, '')}`
            : null,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCompany = async (payload, reset) => {
    try {
      const created = await createCompany(payload);
      setMessage(`Empresa "${created.name}" criada com sucesso.`);
      setCompanyFormOpen(false);
      reset();
      await refreshCompanies(created.id);
    } catch (error) {
      console.error(error);
      setMessage('Não foi possível criar a empresa. Verifique os dados e tente novamente.');
    }
  };

  const handleUpdateCompany = async (payload, reset) => {
    try {
      const updated = await updateCompany(editingCompany.id, payload);
      setMessage(`Empresa "${updated.name}" atualizada.`);
      setEditingCompany(null);
      setCompanyFormOpen(false);
      if (reset) reset();
      await refreshCompanies(updated.id);
    } catch (error) {
      console.error(error);
      setMessage('Não foi possível atualizar a empresa.');
    }
  };

  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Excluir ${company.name}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteCompany(company.id);
      setMessage(`Empresa "${company.name}" removida.`);
      await refreshCompanies();
      setSelectedCompany(null);
      setCollaborators([]);
    } catch (error) {
      console.error(error);
      setMessage('Não foi possível remover a empresa.');
    }
  };

  const handleCreateCollaborator = async (payload, reset) => {
    try {
      const created = await createCollaborator(selectedCompany.id, payload);
      setMessage(`Colaborador "${created.name}" adicionado.`);
      reset();
      const updated = await getCollaborators(selectedCompany.id);
      setCollaborators(
        updated.map((col) => ({
          ...col,
          photo_url: col.photo_url || (col.photo_path ? `${publicBase.replace(/\/$/, '')}/${col.photo_path}` : null),
        }))
      );
    } catch (error) {
      console.error(error);
      setMessage('Não foi possível adicionar o colaborador.');
    }
  };

  const handleUpdateCollaborator = async (payload, reset) => {
    try {
      const updated = await updateCollaborator(selectedCompany.id, editingCollaborator.id, payload);
      setMessage(`Colaborador "${updated.name}" atualizado.`);
      setEditingCollaborator(null);
      if (reset) reset();
      const list = await getCollaborators(selectedCompany.id);
      setCollaborators(
        list.map((col) => ({
          ...col,
          photo_url: col.photo_url || (col.photo_path ? `${publicBase.replace(/\/$/, '')}/${col.photo_path}` : null),
        }))
      );
    } catch (error) {
      console.error(error);
      setMessage('Não foi possível atualizar o colaborador.');
    }
  };

  const handleDeleteCollaborator = async (collaborator) => {
    if (!window.confirm(`Excluir ${collaborator.name}?`)) return;
    try {
      await deleteCollaborator(selectedCompany.id, collaborator.id);
      setMessage(`Colaborador "${collaborator.name}" removido.`);
      const list = await getCollaborators(selectedCompany.id);
      setCollaborators(
        list.map((col) => ({
          ...col,
          photo_url: col.photo_url || (col.photo_path ? `${publicBase.replace(/\/$/, '')}/${col.photo_path}` : null),
        }))
      );
    } catch (error) {
      console.error(error);
      setMessage('Não foi possível remover o colaborador.');
    }
  };

  const handleGenerateOrganogram = async () => {
    if (!selectedCompany) return;
    try {
      setIsGenerating(true);
      const { url } = await generateOrganogram(selectedCompany.id);
      setMessage('Organograma gerado com sucesso!');
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === selectedCompany.id ? { ...company, public_url: url } : company
        )
      );
    } catch (error) {
      console.error(error);
      setMessage('Erro ao gerar organograma.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeCompany = useMemo(() => {
    if (!selectedCompany) return null;
    const match = companies.find((company) => company.id === selectedCompany.id);
    return match ? { ...selectedCompany, public_url: match.public_url } : selectedCompany;
  }, [selectedCompany, companies]);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Empresas cadastradas</h2>
            <p className="text-sm text-slate-500">Gerencie os dados básicos e temas de cada marca.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingCompany(null);
                setCompanyFormOpen((prev) => !prev);
              }}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-soft transition hover:bg-primary-dark"
            >
              {companyFormOpen ? 'Fechar formulário' : 'Nova empresa'}
            </button>
          </div>
        </div>
        {message && (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}
        {companyFormOpen && (
          <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6">
            <CompanyForm
              initialData={editingCompany || undefined}
              onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
              onCancel={() => {
                setEditingCompany(null);
                setCompanyFormOpen(false);
              }}
              submitLabel={editingCompany ? 'Atualizar empresa' : 'Cadastrar empresa'}
            />
          </div>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {loadingCompanies && <p className="text-sm text-slate-500">Carregando empresas...</p>}
          {!loadingCompanies && companies.length === 0 && (
            <p className="text-sm text-slate-500">Cadastre sua primeira empresa para começar.</p>
          )}
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onSelect={(item) => handleSelectCompany(item.id)}
              onEdit={(item) => {
                setEditingCompany(item);
                setCompanyFormOpen(true);
              }}
              onDelete={handleDeleteCompany}
              isActive={selectedCompany?.id === company.id}
            />
          ))}
        </div>
      </section>

      {activeCompany && (
        <section className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Equipe — {activeCompany.name}</h2>
                <p className="text-sm text-slate-500">
                  Cadastre, edite e gerencie os vínculos hierárquicos da equipe.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {activeCompany.public_url && (
                  <a
                    href={activeCompany.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:border-primary hover:text-primary-dark"
                  >
                    Abrir organograma público
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleGenerateOrganogram}
                  disabled={isGenerating}
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-soft transition hover:bg-slate-700 disabled:cursor-progress disabled:opacity-70"
                >
                  {isGenerating ? 'Gerando...' : 'Gerar organograma público'}
                </button>
              </div>
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_0.9fr)]">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6">
                  <h3 className="text-lg font-semibold text-slate-800">Adicionar colaborador</h3>
                  <CollaboratorForm
                    collaborators={collaborators}
                    onSubmit={editingCollaborator ? handleUpdateCollaborator : handleCreateCollaborator}
                    onCancel={() => setEditingCollaborator(null)}
                    initialData={editingCollaborator || undefined}
                    submitLabel={editingCollaborator ? 'Atualizar colaborador' : 'Cadastrar colaborador'}
                  />
                </div>
                <CollaboratorList
                  collaborators={collaborators}
                  onEdit={(collaborator) => setEditingCollaborator(collaborator)}
                  onDelete={handleDeleteCollaborator}
                />
              </div>
              <OrganogramPreview collaborators={collaborators} company={activeCompany} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
