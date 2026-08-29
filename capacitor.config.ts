import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brightcell.novanotes',
  appName: 'NovaNotes',
  webDir: 'www',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#ffffff'
  }
};

export default config;
