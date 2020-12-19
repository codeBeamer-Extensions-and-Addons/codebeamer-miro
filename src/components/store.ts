class Store {
  private static instance: Store;
  public state: any = {
    appId: '',
    LS_KEY: `codebeamer-miro-plugin-widget-private-settings`,
    NEWPOS: 'NEWPOS',
    onReadyCalled: false,
    onReadyFuncs: []
  };

  private constructor() {}

  public static getInstance() {
    if (!Store.instance) Store.instance = new Store();
    return Store.instance;
  }
}

export default Store;