export type MainStackParamList = {
  Home: undefined;
  CreatePlace: undefined;
  EditPlace: { placeId: string; justCreated?: boolean };
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends MainStackParamList {}
  }
}