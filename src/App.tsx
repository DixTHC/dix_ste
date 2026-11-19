import React, { useState, useEffect, useRef } from 'react';
import { Page, Questionnaire, Session, ExportData, MarkdownDoc, Answer } from './types';
import {
  getQuestionnaires, saveQuestionnaires,
  getSessions, saveSessions,
  getExports, saveExports,
  getDocuments, saveDocuments,
  importQuestionnaire, createExport, parseMarkdown,
} from './utils';
import QuestionnaireView from './components/QuestionnaireView';

// --- SVG Icons ---
const Icons = {
  home: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  questionnaire: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  history: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  logo: (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      <path d="M8 10h6c4.4 0 8 3.6 8 8s-3.6 8-8 8H8V10z" fill="white" fillOpacity="0.9" />
      <circle cx="22" cy="10" r="3" fill="#a78bfa" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
    </svg>
  ),
};

// --- Dix AI Banner ---
function DixBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-900/40 via-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-color)] p-6">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0">
          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#banner-gradient)" />
            <text x="12" y="32" fontSize="20" fontWeight="bold" fill="white" fontFamily="system-ui">D</text>
            <circle cx="36" cy="14" r="4" fill="#c4b5fd" />
            <defs>
              <linearGradient id="banner-gradient" x1="0" y1="0" x2="48" y2="48">
                <stop stopColor="#7c3aed" />
                <stop offset="1" stopColor="#4c1d95" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Diix Questionnaire</h1>
          <p className="text-sm text-violet-200/70">Raycast Edition — Workspace local para questionários</p>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(getQuestionnaires());
  const [sessions, setSessions] = useState<Session[]>(getSessions());
  const [exports, setExports] = useState<ExportData[]>(getExports());
  const [documents, setDocuments] = useState<MarkdownDoc[]>(getDocuments());
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<Questionnaire | null>(null);
  const [showPreview, setShowPreview] = useState<ExportData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [settings, setSettings] = useState({ compactMode: false, autoSave: true, language: 'pt-BR' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mdInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Persist state
  useEffect(() => { saveQuestionnaires(questionnaires); }, [questionnaires]);
  useEffect(() => { saveSessions(sessions); }, [sessions]);
  useEffect(() => { saveExports(exports); }, [exports]);
  useEffect(() => { saveDocuments(documents); }, [documents]);

  // Escape to close preview
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showPreview]);

  // Page keyboard shortcuts (1-5 for navigation when not in questionnaire)
  useEffect(() => {
    if (activeQuestionnaire) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const pages: Page[] = ['home', 'questionnaires', 'history', 'downloads', 'settings'];
      const num = parseInt(e.key);
      if (num >= 1 && num <= 5) {
        setPage(pages[num - 1]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeQuestionnaire]);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const q = importQuestionnaire(json);
        setQuestionnaires(prev => [...prev, q]);
        setPage('questionnaires');
      } catch (err) {
        setImportError((err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const parsed = parseMarkdown(content);
      const doc: MarkdownDoc = {
        id: `doc_${Math.random().toString(36).substring(2, 10)}`,
        ...parsed,
        createdAt: new Date().toISOString(),
      };
      setDocuments(prev => [...prev, doc]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleStartQuestionnaire = (q: Questionnaire) => {
    setActiveQuestionnaire(q);
  };

  const handleCompleteQuestionnaire = (answers: Answer[]) => {
    if (!activeQuestionnaire) return;
    const session: Session = {
      id: `sess_${Math.random().toString(36).substring(2, 10)}`,
      questionnaireId: activeQuestionnaire.id,
      questionnaireTitle: activeQuestionnaire.title,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      answers,
      status: 'completed',
    };
    setSessions(prev => [...prev, session]);
    setActiveQuestionnaire(null);
    setPage('history');
  };

  const handleExportSession = (session: Session) => {
    const exportData = createExport(session);
    setExports(prev => [...prev, exportData]);
    setShowPreview(exportData);
  };

  const handleDownloadExport = (exportData: ExportData) => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportData.questionnaireTitle.replace(/\s+/g, '-')}-${exportData.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteQuestionnaire = (id: string) => {
    setQuestionnaires(prev => prev.filter(q => q.id !== id));
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja apagar todos os dados?')) {
      setQuestionnaires([]);
      setSessions([]);
      setExports([]);
      setDocuments([]);
    }
  };

  // If viewing a questionnaire
  if (activeQuestionnaire) {
    return (
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
        <QuestionnaireView
          questionnaire={activeQuestionnaire}
          onComplete={handleCompleteQuestionnaire}
          onBack={() => setActiveQuestionnaire(null)}
        />
      </div>
    );
  }

  const navItems: { page: Page; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { page: 'home', label: 'Início', icon: Icons.home, shortcut: '1' },
    { page: 'questionnaires', label: 'Questionários', icon: Icons.questionnaire, shortcut: '2' },
    { page: 'history', label: 'Histórico', icon: Icons.history, shortcut: '3' },
    { page: 'downloads', label: 'Downloads JSON', icon: Icons.download, shortcut: '4' },
    { page: 'settings', label: 'Configurações', icon: Icons.settings, shortcut: '5' },
  ];

  return (
    <div className="h-screen flex bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-secondary)]">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-[var(--border-color)]">
          {Icons.logo}
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)]">Diix</div>
            <div className="text-[10px] text-[var(--text-muted)]">Questionnaire v1</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.page}
              className={`nav-item ${page === item.page ? 'active' : ''}`}
              onClick={() => setPage(item.page)}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <span className="kbd">{item.shortcut}</span>
            </button>
          ))}
        </nav>

        {/* Quick stats */}
        <div className="p-3 border-t border-[var(--border-color)]">
          <div className="text-[10px] text-[var(--text-muted)] space-y-1">
            <div className="flex justify-between">
              <span>Questionários</span>
              <span className="text-[var(--text-secondary)]">{questionnaires.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Sessões</span>
              <span className="text-[var(--text-secondary)]">{sessions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Exports</span>
              <span className="text-[var(--text-secondary)]">{exports.length}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[var(--bg-primary)]/90 backdrop-blur-sm border-b border-[var(--border-color)] px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {navItems.find(n => n.page === page)?.label}
            </h1>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
              <button
                className="btn-primary text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                + Importar JSON
              </button>
            </div>
          </div>
          {importError && (
            <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              ⚠️ {importError}
            </div>
          )}
        </header>

        {/* Page content */}
        <div className="p-6">
          {page === 'home' && (
            <HomePage
              questionnaires={questionnaires}
              sessions={sessions}
              exports={exports}
              documents={documents}
              onStart={handleStartQuestionnaire}
              onImportJSON={() => fileInputRef.current?.click()}
              onImportMD={() => mdInputRef.current?.click()}
              mdInputRef={mdInputRef}
              handleImportMarkdown={handleImportMarkdown}
            />
          )}
          {page === 'questionnaires' && (
            <QuestionnairesPage
              questionnaires={questionnaires}
              onStart={handleStartQuestionnaire}
              onDelete={handleDeleteQuestionnaire}
              onImport={() => fileInputRef.current?.click()}
            />
          )}
          {page === 'history' && (
            <HistoryPage
              sessions={sessions}
              onExport={handleExportSession}
              onDelete={handleDeleteSession}
            />
          )}
          {page === 'downloads' && (
            <DownloadsPage
              exports={exports}
              onDownload={handleDownloadExport}
              onPreview={setShowPreview}
            />
          )}
          {page === 'settings' && (
            <SettingsPage
              settings={settings}
              setSettings={setSettings}
              onClearAll={handleClearAll}
            />
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Pré-visualização JSON</h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowPreview(null)}>
                <span className="kbd">Esc</span>
              </button>
            </div>
            <pre className="bg-[var(--bg-primary)] rounded-lg p-4 text-xs text-[var(--text-secondary)] overflow-auto max-h-96 font-mono">
              {JSON.stringify(showPreview, null, 2)}
            </pre>
            <div className="flex justify-end mt-4 gap-2">
              <button className="btn-secondary text-sm" onClick={() => setShowPreview(null)}>Fechar</button>
              <button className="btn-primary text-sm" onClick={() => { handleDownloadExport(showPreview); setShowPreview(null); }}>
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Home Page ---
function HomePage({ questionnaires, sessions, exports, documents, onStart, onImportJSON, onImportMD, mdInputRef, handleImportMarkdown }: {
  questionnaires: Questionnaire[];
  sessions: Session[];
  exports: ExportData[];
  documents: MarkdownDoc[];
  onStart: (q: Questionnaire) => void;
  onImportJSON: () => void;
  onImportMD: () => void;
  mdInputRef: React.RefObject<HTMLInputElement>;
  handleImportMarkdown: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <DixBanner />

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Questionários" value={questionnaires.length} color="violet" />
        <StatCard label="Sessões" value={sessions.length} color="green" />
        <StatCard label="Exports" value={exports.length} color="blue" />
        <StatCard label="Documentos" value={documents.length} color="yellow" />
      </div>

      {/* Quick actions */}
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Ações rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="panel-inner p-4 text-left hover:border-violet-500 transition-colors group" onClick={onImportJSON}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-violet-300">Importar questionário</div>
                <div className="text-xs text-[var(--text-muted)]">JSON em português ou inglês</div>
              </div>
            </div>
          </button>
          <button className="panel-inner p-4 text-left hover:border-violet-500 transition-colors group" onClick={onImportMD}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-violet-300">Importar documento</div>
                <div className="text-xs text-[var(--text-muted)]">Markdown com tarefas e datas</div>
              </div>
            </div>
          </button>
          {questionnaires.length > 0 && (
            <button className="panel-inner p-4 text-left hover:border-violet-500 transition-colors group" onClick={() => onStart(questionnaires[0])}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">▶️</span>
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-violet-300">Iniciar questionário</div>
                  <div className="text-xs text-[var(--text-muted)]">{questionnaires[0].title}</div>
                </div>
              </div>
            </button>
          )}
        </div>
        <input ref={mdInputRef} type="file" accept=".md,.markdown,.txt" className="hidden" onChange={handleImportMarkdown} />
      </div>

      {/* Recent questionnaires */}
      {questionnaires.length > 0 && (
        <div className="panel p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Questionários recentes</h3>
          <div className="space-y-2">
            {questionnaires.slice(-3).reverse().map(q => (
              <div key={q.id} className="panel-inner p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{q.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">{q.questions.length} questões • {new Date(q.importedAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <button className="btn-primary text-xs" onClick={() => onStart(q)}>Iniciar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="panel p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Documentos Markdown</h3>
          <div className="space-y-2">
            {documents.slice(-3).reverse().map(doc => (
              <div key={doc.id} className="panel-inner p-3">
                <div className="text-sm font-medium text-[var(--text-primary)]">{doc.title}</div>
                <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
                  {doc.tasks.length > 0 && <span>{doc.tasks.length} tarefas</span>}
                  {doc.milestones.length > 0 && <span>{doc.milestones.length} marcos</span>}
                  {doc.dates.length > 0 && <span>{doc.dates.length} datas</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    violet: 'border-violet-500/30 bg-violet-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
  };
  const textColors: Record<string, string> = {
    violet: 'text-violet-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className={`text-2xl font-bold ${textColors[color]}`}>{value}</div>
      <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
    </div>
  );
}

// --- Questionnaires Page ---
function QuestionnairesPage({ questionnaires, onStart, onDelete, onImport }: {
  questionnaires: Questionnaire[];
  onStart: (q: Questionnaire) => void;
  onDelete: (id: string) => void;
  onImport: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {questionnaires.length} questionário(s) importado(s)
        </p>
        <button className="btn-primary text-sm" onClick={onImport}>+ Importar</button>
      </div>

      {questionnaires.length === 0 ? (
        <div className="panel p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Nenhum questionário</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Importe um arquivo JSON para começar. Suporta português e inglês.
          </p>
          <button className="btn-primary" onClick={onImport}>Importar JSON</button>
        </div>
      ) : (
        <div className="space-y-3">
          {questionnaires.map(q => (
            <div key={q.id} className="panel p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">{q.title}</h3>
                  {q.description && <p className="text-sm text-[var(--text-secondary)] mt-1">{q.description}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="tag tag-violet">{q.questions.length} questões</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Importado em {new Date(q.importedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(new Set(q.questions.map(q => q.type))).map(type => (
                      <span key={type} className="tag tag-green text-[10px]">{type}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="btn-primary text-sm" onClick={() => onStart(q)}>Iniciar</button>
                  <button
                    className="btn-secondary text-sm text-red-400 hover:text-red-300 hover:border-red-500"
                    onClick={() => onDelete(q.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- History Page ---
function HistoryPage({ sessions, onExport, onDelete }: {
  sessions: Session[];
  onExport: (s: Session) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">
        {sessions.length} sessão(ões) registrada(s)
      </p>

      {sessions.length === 0 ? (
        <div className="panel p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Nenhuma sessão</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Complete um questionário para ver o histórico aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...sessions].reverse().map(s => {
            const answered = s.answers.filter(a => a.value !== null && !a.skipped).length;
            const total = s.answers.length;
            const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
            return (
              <div key={s.id} className="panel p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">{s.questionnaireTitle}</h3>
                      <span className={`tag ${s.status === 'completed' ? 'tag-green' : 'tag-yellow'}`}>
                        {s.status === 'completed' ? 'Concluída' : 'Em progresso'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {answered}/{total} respondidas ({pct}%)
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(s.startedAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="btn-primary text-sm" onClick={() => onExport(s)}>Exportar</button>
                    <button
                      className="btn-secondary text-sm text-red-400 hover:text-red-300"
                      onClick={() => onDelete(s.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Downloads Page ---
function DownloadsPage({ exports, onDownload, onPreview }: {
  exports: ExportData[];
  onDownload: (e: ExportData) => void;
  onPreview: (e: ExportData) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">
        {exports.length} exportação(ões) disponível(is)
      </p>

      {exports.length === 0 ? (
        <div className="panel p-12 text-center">
          <div className="text-4xl mb-4">💾</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Nenhum export</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Exporte uma sessão do histórico para gerar JSON estruturado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...exports].reverse().map(exp => (
            <div key={exp.sessionId + exp.exportedAt} className="panel p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">{exp.questionnaireTitle}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="tag tag-green">{exp.summary.answered} respondidas</span>
                    {exp.summary.skipped > 0 && <span className="tag tag-red">{exp.summary.skipped} puladas</span>}
                    {exp.summary.pending > 0 && <span className="tag tag-yellow">{exp.summary.pending} pendentes</span>}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-2">
                    Exportado em {new Date(exp.exportedAt).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="btn-secondary text-sm" onClick={() => onPreview(exp)}>Visualizar</button>
                  <button className="btn-primary text-sm" onClick={() => onDownload(exp)}>Download</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Settings Page ---
function SettingsPage({ settings, setSettings, onClearAll }: {
  settings: { compactMode: boolean; autoSave: boolean; language: string };
  setSettings: (s: typeof settings) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Preferências</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--text-primary)]">Modo compacto</div>
              <div className="text-xs text-[var(--text-muted)]">Reduz espaçamento entre elementos</div>
            </div>
            <button
              className={`w-10 h-6 rounded-full transition-colors ${settings.compactMode ? 'bg-violet-500' : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)]'}`}
              onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${settings.compactMode ? 'translate-x-4' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--text-primary)]">Salvamento automático</div>
              <div className="text-xs text-[var(--text-muted)]">Salva progresso automaticamente</div>
            </div>
            <button
              className={`w-10 h-6 rounded-full transition-colors ${settings.autoSave ? 'bg-violet-500' : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)]'}`}
              onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${settings.autoSave ? 'translate-x-4' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--text-primary)]">Idioma</div>
              <div className="text-xs text-[var(--text-muted)]">Idioma da interface</div>
            </div>
            <select
              className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]"
              value={settings.language}
              onChange={e => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Atalhos de teclado</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="kbd">1</span>-<span className="kbd">5</span>
            <span className="text-[var(--text-secondary)]">Navegar páginas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="kbd">←</span><span className="kbd">→</span>
            <span className="text-[var(--text-secondary)]">Questão anterior/próxima</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="kbd">L</span>
            <span className="text-[var(--text-secondary)]">Marcar para depois</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="kbd">S</span>
            <span className="text-[var(--text-secondary)]">Pular questão</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="kbd">Esc</span>
            <span className="text-[var(--text-secondary)]">Fechar pré-visualização</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="kbd">1</span>-<span className="kbd">9</span>
            <span className="text-[var(--text-secondary)]">Selecionar opção/nota</span>
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Dados</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Todos os dados são armazenados localmente no navegador (localStorage). Nenhum conteúdo é enviado a serviços externos.
        </p>
        <button className="btn-secondary text-sm text-red-400 hover:text-red-300 hover:border-red-500" onClick={onClearAll}>
          Apagar todos os dados
        </button>
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Sobre</h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Diix Questionnaire v1 — Raycast Edition. Interface dark inspirada na linguagem de produtividade do Raycast.
          Suporta questionários JSON em português e inglês, com cinco tipos de pergunta e exportação estruturada.
        </p>
        <div className="flex items-center gap-2 mt-3">
          {Icons.logo}
          <span className="text-xs text-[var(--text-muted)]">Dix AI</span>
        </div>
      </div>
    </div>
  );
}
