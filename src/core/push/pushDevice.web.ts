import { PushDevice } from './PushDeviceTypes';

/** The browser does not receive Expo push: the inbox and the e-mail are the channels on the web. */
export const pushDevice: PushDevice = {
  getRegistration: async () => null,
  onTap: () => () => undefined,
  initialTap: () => null,
  onReceived: () => () => undefined,
};
