class App {
  public static appId: string
  public static boardId: string

  private constructor() { }

  public static async getAndSetIds() {
    App.appId = miro.getClientId()
    App.boardId = (await miro.board.info.get()).id
  }
}

export default App;