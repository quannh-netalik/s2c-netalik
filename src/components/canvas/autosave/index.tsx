import { FC, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { useAppSelector } from '@/redux/store';
import { AutosaveProjectRequest, useAutosaveProjectMutation } from '@/redux/api/project';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const BASE_TIMER = 1000; // 1 sec
const timer = {
  saving: BASE_TIMER,
  saved: BASE_TIMER * 2,
  error: BASE_TIMER * 3,
};

const AutoSave: FC = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const user = useAppSelector((s) => s.profile.user);
  const shapes = useAppSelector((s) => s.shapes);
  const viewport = useAppSelector((s) => s.viewport);

  const [autosaveProject, { isLoading: isSaving }] = useAutosaveProjectMutation();

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const isReady = Boolean(projectId && user?.id);

  useEffect(() => {
    if (!isReady) return;

    const stateString = JSON.stringify({ shapes, viewport });

    if (stateString === lastSavedRef.current) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      lastSavedRef.current = stateString;
      abortRef.current?.abort();
      setSaveStatus('saving');

      abortRef.current = new AbortController();

      const request = autosaveProject({
        projectId: projectId as string,
        userId: user?.id as string,
        shapesData: shapes as unknown as AutosaveProjectRequest['shapesData'],
        viewportData: {
          scale: viewport.scale,
          translate: viewport.translate,
        },
      });

      try {
        await request.unwrap();

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), timer.saved);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), timer.error);
      }
    }, timer.saving);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [autosaveProject, isReady, projectId, shapes, user?.id, viewport]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!isReady) return null;

  if (isSaving) {
    return (
      <div className="flex items-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  switch (saveStatus) {
    case 'saved':
      return (
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4" />
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    default:
      return <></>;
  }
};

export default AutoSave;
