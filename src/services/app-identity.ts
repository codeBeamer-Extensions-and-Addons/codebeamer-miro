/**
 * I don't know ..
 * just saves appId & boardId, making for the app's unique id..
 */
export default class AppIdentity {
  private static _appId: string
  private static _boardId: string

  public static get AppId(): string {
    return AppIdentity._appId;
  }

  public static get BoardId(): string {
    return AppIdentity._boardId;
  }

  private constructor() { }

  public static async setIds() {
    AppIdentity._appId = miro.getClientId()
    AppIdentity._boardId = (await miro.board.info.get()).id
  }
}