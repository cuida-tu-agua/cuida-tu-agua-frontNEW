import { useCallback, useEffect, useState } from 'react';
import i18n from '../../i18n';
import { messageTemplateRepository } from '../../core/di/container';
import { AppError } from '../../domain/common/AppError';
import { MessageTemplate, MessageTemplateKey, ShortMessageProviders, TestMessageResult } from '../../domain/messages/MessageTemplate';
import { MessageTemplateRepository } from '../../domain/messages/MessageTemplateRepository';
import { toAppError } from '../../infrastructure/http/httpError';

/**
 * The WhatsApp / SMS texts for the administrator. A saved text replaces its row with what the server answers (saving
 * exactly the default text is the same as restoring it).
 */
export const useAdminMessages = (repository: MessageTemplateRepository = messageTemplateRepository) => {
  const [templates, setTemplates] = useState<MessageTemplate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [busyKey, setBusyKey] = useState<MessageTemplateKey | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [providers, setProviders] = useState<ShortMessageProviders | null>(null);
  const [tests, setTests] = useState<Partial<Record<MessageTemplateKey, TestMessageResult>>>({});
  const [testingKey, setTestingKey] = useState<MessageTemplateKey | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTemplates(await repository.list());
      setError(null);
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void load();
    // Only informative: without it the screen still works
    repository.providers().then(setProviders).catch(() => setProviders(null));
  }, [load, repository]);

  /** Sends the text to the administrator's own phone; the result (sent or the reason of the provider) stays on its card. */
  const sendTest = async (key: MessageTemplateKey) => {
    setTestingKey(key);
    setError(null);
    try {
      const result = await repository.test(key);
      setTests((current) => ({ ...current, [key]: result }));
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setTestingKey(null);
    }
  };

  const run = async (key: MessageTemplateKey, action: () => Promise<MessageTemplate>, done: string): Promise<boolean> => {
    setBusyKey(key);
    setError(null);
    setNotice(null);
    try {
      const updated = await action();
      setTemplates((current) => (current ?? []).map((t) => (t.key === updated.key ? updated : t)));
      setNotice(done);
      return true;
    } catch (e) {
      setError(toAppError(e));
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  return {
    templates,
    loading,
    error,
    busyKey,
    notice,
    providers,
    tests,
    testingKey,
    sendTest,
    reload: load,
    save: (key: MessageTemplateKey, body: string) => run(key, () => repository.save(key, body), i18n.t('messages.saved')),
    reset: (key: MessageTemplateKey) => run(key, () => repository.reset(key), i18n.t('messages.restored')),
    dismissNotice: () => setNotice(null),
    dismissError: () => setError(null),
  };
};
