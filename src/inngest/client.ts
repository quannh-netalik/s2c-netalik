import { Inngest } from 'inngest';
import { realtimeMiddleware } from '@inngest/realtime';
import packageJson from '../../package.json';

export const inngest = new Inngest({
  id: packageJson.name,
  middleware: [realtimeMiddleware()],
  isDev: process.env.NODE_ENV === 'development',
  ...(process.env.NODE_ENV === 'production' && {
    eventKey: process.env.INNGEST_EVENT_KEY,
    signingKey: process.env.INNGEST_SIGNING_KEY,
  }),
});
