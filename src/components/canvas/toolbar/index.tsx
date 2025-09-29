import { FC } from 'react';

import HistoryPill from './history';
import ZoomBar from './zoom';

const Toolbar: FC = () => {
  return (
    <div className="fixed bottom-0 w-full grid grid-cols-3 z-50 p-5">
      <HistoryPill />
      <ZoomBar />
    </div>
  );
};

export default Toolbar;
