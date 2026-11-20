import React, { useEffect, useState } from 'react';
import { PlaygroundApp } from './playground/PlaygroundApp';
import { isModeId } from './playground/content/modes';
import type { Activity, ModeId } from './playground/types';

interface Route {
  /** Mode to open, or null for the hub. */
  modeId: ModeId | null;
  activity: Activity;
}

/** The hub is the default page. #/playground/... is accepted so older links keep working. */
function parseHashRoute(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  const match = hash.match(/^\/(?:playground\/)?([^/]+)(?:\/(quiz))?\/?$/);
  const modeId = match && isModeId(match[1]) ? match[1] : null;
  return { modeId, activity: modeId && match?.[2] === 'quiz' ? 'quiz' : 'practice' };
}

const hashFor = (modeId: ModeId | null, activity?: Activity) =>
  modeId ? `#/${modeId}${activity === 'quiz' ? '/quiz' : ''}` : '#/';

export const App: React.FC = () => {
  const [route, setRoute] = useState<Route>(() => parseHashRoute());

  useEffect(() => {
    const onHash = () => setRoute(parseHashRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (modeId: ModeId | null, activity: Activity = 'practice') => {
    window.location.hash = hashFor(modeId, activity);
    setRoute({ modeId, activity });
  };

  return <PlaygroundApp modeId={route.modeId} activity={route.activity} onNavigate={navigate} />;
};
