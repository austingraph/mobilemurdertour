export type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  /** `arrived` styles the screen as an on-site unlock vs. a preview. */
  Stop: { stopId: string; arrived?: boolean };
  AR: { stopId: string };
  About: undefined;
};
