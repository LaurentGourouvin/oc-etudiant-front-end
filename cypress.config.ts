import { defineConfig } from 'cypress';
import registerCodeCoverageTasks from '@cypress/code-coverage/task';
import fs from 'fs';

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,

    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);

      on('task', {
        ensureDirectoryExists(dirPath: string) {
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          return null;
        },
      });

      return config;
    },
  },
});
