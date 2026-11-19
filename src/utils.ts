import { Questionnaire, Question, QuestionType, Session, ExportData, MarkdownDoc } from './types';

const STORAGE_KEYS = {
  questionnaires: 'diix_questionnaires',
  sessions: 'diix_sessions',
  exports: 'diix_exports',
  documents: 'diix_documents',
  settings: 'diix_settings',
};

// --- Storage ---
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getQuestionnaires(): Questionnaire[] {
  return loadFromStorage(STORAGE_KEYS.questionnaires, []);
}

export function saveQuestionnaires(data: Questionnaire[]): void {
  saveToStorage(STORAGE_KEYS.questionnaires, data);
}

export function getSessions(): Session[] {
  return loadFromStorage(STORAGE_KEYS.sessions, []);
}

export function saveSessions(data: Session[]): void {
  saveToStorage(STORAGE_KEYS.sessions, data);
}

export function getExports(): ExportData[] {
  return loadFromStorage(STORAGE_KEYS.exports, []);
}

export function saveExports(data: ExportData[]): void {
  saveToStorage(STORAGE_KEYS.exports, data);
}

export function getDocuments(): MarkdownDoc[] {
  return loadFromStorage(STORAGE_KEYS.documents, []);
}

export function saveDocuments(data: MarkdownDoc[]): void {
  saveToStorage(STORAGE_KEYS.documents, data);
}

// --- Type Aliases ---
const TYPE_ALIASES: Record<string, QuestionType> = {
  unica: 'single',
  radio: 'single',
  single: 'single',
  multipla: 'multiple',
  checkbox: 'multiple',
  multiple: 'multiple',
  texto: 'text',
  open: 'text',
  text: 'text',
  escala: 'scale',
  rating: 'scale',
  scale: 'scale',
  sim_nao: 'boolean',
  yes_no: 'boolean',
  boolean: 'boolean',
};

function resolveType(raw: string): QuestionType | null {
  return TYPE_ALIASES[raw.toLowerCase().trim()] || null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// --- Import ---
export function importQuestionnaire(json: unknown): Questionnaire {
  const obj = json as Record<string, unknown>;

  if (!obj || typeof obj !== 'object') {
    throw new Error('JSON inválido: esperado um objeto.');
  }

  const rawQuestions = (obj.questions || obj.perguntas) as unknown[];
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new Error('O arquivo precisa conter uma lista "questions" ou "perguntas" com pelo menos uma questão.');
  }

  const questions: Question[] = [];
  const questionIds = new Set<string>();

  for (let i = 0; i < rawQuestions.length; i++) {
    const raw = rawQuestions[i] as Record<string, unknown>;
    if (!raw || typeof raw !== 'object') {
      throw new Error(`Questão ${i + 1}: formato inválido.`);
    }

    const type = resolveType(raw.type as string);
    if (!type) {
      throw new Error(`Questão ${i + 1}: tipo desconhecido "${raw.type}". Tipos aceitos: single, multiple, scale, boolean, text (e aliases).`);
    }

    const id = (raw.id as string) || `q_${generateId()}`;
    if (questionIds.has(id)) {
      throw new Error(`Questão "${id}": ID duplicado. Cada questão deve ter um ID único.`);
    }
    questionIds.add(id);

    const question: Question = {
      id,
      type,
      title: (raw.title as string) || (raw.titulo as string) || `Questão ${i + 1}`,
      description: (raw.description as string) || (raw.descricao as string),
      required: raw.required !== undefined ? Boolean(raw.required) : false,
    };

    if (type === 'single' || type === 'multiple') {
      const rawOptions = raw.options as unknown[];
      if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
        throw new Error(`Questão "${id}": opções vazias. É necessário pelo menos uma opção.`);
      }
      const optionIds = new Set<string>();
      question.options = rawOptions.map((opt, oi) => {
        const o = opt as Record<string, unknown>;
        const optId = (o.id as string) || `opt_${generateId()}`;
        if (optionIds.has(optId)) {
          throw new Error(`Questão "${id}": opção "${optId}" duplicada.`);
        }
        optionIds.add(optId);
        return { id: optId, label: (o.label as string) || (o.rotulo as string) || `Opção ${oi + 1}` };
      });
    }

    if (type === 'scale') {
      const min = Number(raw.min);
      const max = Number(raw.max);
      if (isNaN(min) || isNaN(max) || !Number.isInteger(min) || !Number.isInteger(max)) {
        throw new Error(`Questão "${id}": escala inválida. "min" e "max" devem ser inteiros.`);
      }
      if (max - min + 1 > 101) {
        throw new Error(`Questão "${id}": escala com mais de 101 valores não é suportada.`);
      }
      if (min >= max) {
        throw new Error(`Questão "${id}": "min" deve ser menor que "max".`);
      }
      question.min = min;
      question.max = max;
      question.minLabel = raw.minLabel as string;
      question.maxLabel = raw.maxLabel as string;
    }

    if (type === 'boolean') {
      question.yesLabel = (raw.yesLabel as string) || (raw.simLabel as string);
      question.noLabel = (raw.noLabel as string) || (raw.naoLabel as string);
    }

    if (type === 'text') {
      question.placeholder = raw.placeholder as string;
    }

    questions.push(question);
  }

  return {
    id: (obj.id as string) || `qn_${generateId()}`,
    title: (obj.title as string) || (obj.titulo as string) || 'Questionário importado',
    description: (obj.description as string) || (obj.descricao as string),
    questions,
    importedAt: new Date().toISOString(),
  };
}

// --- Export ---
export function createExport(session: Session): ExportData {
  const answered = session.answers.filter(a => a.value !== null && !a.skipped).length;
  const skipped = session.answers.filter(a => a.skipped).length;
  const pending = session.answers.filter(a => a.value === null && !a.skipped && !a.markedForLater).length;

  return {
    sessionId: session.id,
    questionnaireId: session.questionnaireId,
    questionnaireTitle: session.questionnaireTitle,
    exportedAt: new Date().toISOString(),
    status: session.status,
    summary: {
      total: session.answers.length,
      answered,
      skipped,
      pending,
    },
    answers: session.answers,
  };
}

// --- Markdown Parsing ---
export function parseMarkdown(content: string): Omit<MarkdownDoc, 'id' | 'createdAt'> {
  const lines = content.split('\n');
  let title = 'Documento sem título';

  // Extract title from first heading
  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) {
      title = headingMatch[1].trim();
      break;
    }
  }

  // Extract tasks (checkboxes)
  const tasks: string[] = [];
  const taskRegex = /^[\s]*[-*]\s+\[([ xX])\]\s+(.+)/;
  for (const line of lines) {
    const match = line.match(taskRegex);
    if (match) {
      tasks.push(`${match[1].toLowerCase() === 'x' ? '✓' : '○'} ${match[2]}`);
    }
  }

  // Extract milestones (headings with specific keywords)
  const milestones: string[] = [];
  const milestoneKeywords = ['milestone', 'marco', 'entrega', 'fase', 'etapa', 'phase'];
  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) {
      const text = headingMatch[1].trim().toLowerCase();
      if (milestoneKeywords.some(kw => text.includes(kw))) {
        milestones.push(headingMatch[1].trim());
      }
    }
  }

  // Extract ISO and Brazilian dates
  const dates: string[] = [];
  const isoDateRegex = /\d{4}-\d{2}-\d{2}/g;
  const brDateRegex = /\d{2}\/\d{2}\/\d{4}/g;
  const isoMatches = content.match(isoDateRegex);
  const brMatches = content.match(brDateRegex);
  if (isoMatches) dates.push(...isoMatches);
  if (brMatches) dates.push(...brMatches);

  return { title, content, tasks, milestones, dates };
}
