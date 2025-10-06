export const events = {
  autosave: {
    id: 'autosave-project-workflow',
    name: 'project/autosave.requested',
  },
  polar: {
    id: 'polar-webhook-handler',
    name: 'polar/webhook.received',
  },
} as const;
