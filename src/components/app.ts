class App {
  public static id: string

  private constructor() { }

  public static getAndSetId() {
    App.id = miro.getClientId()
  }
}

export default App;