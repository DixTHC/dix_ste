import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, Answer, Questionnaire } from '../types';
import { FilterMode } from '../types';

interface Props {
  questionnaire: Questionnaire;
  onComplete: (answers: Answer[]) => void;
  onBack: () => void;
}

export default function QuestionnaireView({ questionnaire, onComplete, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() =>
    questionnaire.questions.map(q => ({
      questionId: q.id,
      value: null,
      skipped: false,
      markedForLater: false,
    }))
  );
  const [filter, setFilter] = useState<FilterMode>('all');
  const [showMap, setShowMap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const question = questionnaire.questions[currentIndex];
  const answer = answers[currentIndex];

  const answeredCount = answers.filter(a => a.value !== null && !a.skipped).length;
  const totalQuestions = questionnaire.questions.length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const filteredIndices = React.useMemo(() => {
    const indices = questionnaire.questions.map((_, i) => i);
    if (filter === 'pending') {
      return indices.filter(i => answers[i].value === null && !answers[i].skipped && !answers[i].markedForLater);
    }
    if (filter === 'marked') {
      return indices.filter(i => answers[i].markedForLater);
    }
    return indices;
  }, [filter, answers, questionnaire.questions]);

  const setAnswer = useCallback((value: Answer['value']) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], value, skipped: false };
      return next;
    });
  }, [currentIndex]);

  const skipQuestion = useCallback(() => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], skipped: true, value: null };
      return next;
    });
    goToNext();
  }, [currentIndex]);

  const toggleMarked = useCallback(() => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], markedForLater: !next[currentIndex].markedForLater };
      return next;
    });
  }, [currentIndex]);

  const goToPrev = useCallback(() => {
    const posInFiltered = filteredIndices.indexOf(currentIndex);
    if (posInFiltered > 0) {
      setCurrentIndex(filteredIndices[posInFiltered - 1]);
    }
  }, [currentIndex, filteredIndices]);

  const goToNext = useCallback(() => {
    const posInFiltered = filteredIndices.indexOf(currentIndex);
    if (posInFiltered < filteredIndices.length - 1) {
      setCurrentIndex(filteredIndices[posInFiltered + 1]);
    }
  }, [currentIndex, filteredIndices]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          toggleMarked();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          skipQuestion();
          break;
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          if (question.type === 'single' && question.options) {
            const idx = parseInt(e.key) - 1;
            if (idx < question.options.length) {
              setAnswer(question.options[idx].id);
            }
          } else if (question.type === 'scale' && question.min !== undefined && question.max !== undefined) {
            const num = parseInt(e.key);
            if (num >= question.min && num <= question.max) {
              setAnswer(num);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [question, goToPrev, goToNext, toggleMarked, skipQuestion, setAnswer]);

  const handleFinish = () => {
    onComplete(answers);
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'single':
        return renderSingle(question, answer);
      case 'multiple':
        return renderMultiple(question, answer);
      case 'scale':
        return renderScale(question, answer);
      case 'boolean':
        return renderBoolean(question, answer);
      case 'text':
        return renderText(question, answer);
      default:
        return <p>Tipo desconhecido</p>;
    }
  };

  const renderSingle = (q: Question, a: Answer) => (
    <div className="space-y-3">
      {q.options?.map((opt, i) => (
        <button
          key={opt.id}
          className={`option-btn ${a.value === opt.id ? 'selected' : ''}`}
          onClick={() => setAnswer(opt.id)}
        >
          <span className="kbd">{i + 1}</span>
          <span>{opt.label}</span>
          {a.value === opt.id && (
            <svg className="ml-auto w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );

  const renderMultiple = (q: Question, a: Answer) => {
    const selected = Array.isArray(a.value) ? a.value : [];
    return (
      <div className="space-y-3">
        {q.options?.map(opt => (
          <button
            key={opt.id}
            className={`option-btn ${selected.includes(opt.id) ? 'selected' : ''}`}
            onClick={() => {
              const next = selected.includes(opt.id)
                ? selected.filter((id: string) => id !== opt.id)
                : [...selected, opt.id];
              setAnswer(next);
            }}
          >
            <span className={`w-4 h-4 rounded border ${selected.includes(opt.id) ? 'bg-violet-500 border-violet-500' : 'border-gray-500'}`}>
              {selected.includes(opt.id) && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderScale = (q: Question, a: Answer) => {
    if (q.min === undefined || q.max === undefined) return null;
    const values: number[] = [];
    for (let i = q.min; i <= q.max; i++) values.push(i);
    const displayValues = values.length > 11 ? values.filter((_, i) => i % Math.ceil(values.length / 11) === 0 || i === values.length - 1) : values;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {displayValues.map(v => (
            <button
              key={v}
              className={`scale-btn ${a.value === v ? 'selected' : ''}`}
              onClick={() => setAnswer(v)}
            >
              {v}
            </button>
          ))}
        </div>
        {(q.minLabel || q.maxLabel) && (
          <div className="flex justify-between text-xs text-gray-400 px-2">
            <span>{q.minLabel || ''}</span>
            <span>{q.maxLabel || ''}</span>
          </div>
        )}
      </div>
    );
  };

  const renderBoolean = (q: Question, a: Answer) => (
    <div className="flex gap-3">
      <button
        className={`option-btn flex-1 justify-center ${a.value === 'true' ? 'selected' : ''}`}
        onClick={() => setAnswer('true')}
      >
        <span className="text-green-400">✓</span>
        <span>{q.yesLabel || 'Sim'}</span>
      </button>
      <button
        className={`option-btn flex-1 justify-center ${a.value === 'false' ? 'selected' : ''}`}
        onClick={() => setAnswer('false')}
      >
        <span className="text-red-400">✕</span>
        <span>{q.noLabel || 'Não'}</span>
      </button>
    </div>
  );

  const renderText = (q: Question, a: Answer) => (
    <textarea
      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 text-[var(--text-primary)] placeholder-gray-500 resize-none focus:border-violet-500 focus:outline-none transition-colors"
      rows={4}
      placeholder={q.placeholder || 'Digite sua resposta...'}
      value={(a.value as string) || ''}
      onChange={e => setAnswer(e.target.value)}
    />
  );

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm" onClick={onBack}>
            ← Voltar
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{questionnaire.title}</h2>
            {questionnaire.description && (
              <p className="text-xs text-[var(--text-secondary)]">{questionnaire.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`btn-secondary text-sm ${showMap ? 'border-violet-500' : ''}`}
            onClick={() => setShowMap(!showMap)}
          >
            🗺️ Mapa
          </button>
          <button className="btn-primary text-sm" onClick={handleFinish}>
            Finalizar
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
          <span>{answeredCount}/{totalQuestions} respondidas</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-color)]">
        <span className="text-xs text-[var(--text-muted)]">Filtrar:</span>
        {(['all', 'pending', 'marked'] as FilterMode[]).map(f => (
          <button
            key={f}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              filter === f
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Marcadas'}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="tag tag-violet">{currentIndex + 1}/{totalQuestions}</span>
              <span className="tag tag-violet">{question.type}</span>
              {question.required && <span className="tag tag-red">obrigatória</span>}
              {answer.markedForLater && <span className="tag tag-yellow">⏳ para depois</span>}
              {answer.skipped && <span className="tag tag-red">pulada</span>}
              {answer.value !== null && !answer.skipped && <span className="tag tag-green">respondida</span>}
            </div>

            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{question.title}</h3>
            {question.description && (
              <p className="text-sm text-[var(--text-secondary)] mb-6">{question.description}</p>
            )}

            <div className="mb-6">
              {renderQuestion()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <button
                className="btn-secondary text-sm"
                onClick={goToPrev}
                disabled={filteredIndices.indexOf(currentIndex) === 0}
              >
                ← Anterior
              </button>
              <div className="flex items-center gap-2">
                <button className="btn-secondary text-sm" onClick={toggleMarked} title="Marcar para depois (L)">
                  {answer.markedForLater ? '⏳ Marcada' : '⏰ Marcar'}
                </button>
                <button className="btn-secondary text-sm" onClick={skipQuestion} title="Pular (S)">
                  Pular →
                </button>
              </div>
              <button
                className="btn-primary text-sm"
                onClick={goToNext}
                disabled={filteredIndices.indexOf(currentIndex) === filteredIndices.length - 1}
              >
                Próxima →
              </button>
            </div>

            {/* Keyboard hints */}
            <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-muted)]">
              <span><span className="kbd">←</span> <span className="kbd">→</span> navegar</span>
              <span><span className="kbd">L</span> marcar</span>
              <span><span className="kbd">S</span> pular</span>
            </div>
          </div>
        </div>

        {/* Question map sidebar */}
        {showMap && (
          <div className="w-64 border-l border-[var(--border-color)] p-4 overflow-y-auto bg-[var(--bg-secondary)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Mapa de questões</h4>
            <div className="space-y-1">
              {questionnaire.questions.map((q, i) => {
                const a = answers[i];
                const status = a.skipped ? 'skipped' : a.value !== null ? 'answered' : a.markedForLater ? 'marked' : 'pending';
                return (
                  <button
                    key={q.id}
                    className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors ${
                      i === currentIndex
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                    onClick={() => setCurrentIndex(i)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        status === 'answered' ? 'bg-green-400' :
                        status === 'skipped' ? 'bg-red-400' :
                        status === 'marked' ? 'bg-yellow-400' :
                        'bg-gray-500'
                      }`} />
                      <span className="truncate">{q.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
