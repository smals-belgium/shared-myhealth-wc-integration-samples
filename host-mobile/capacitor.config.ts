import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'sample-host-mobile',
  webDir: 'www/browser',
  server: {
    androidScheme: 'http',
  },
};

export default config;
