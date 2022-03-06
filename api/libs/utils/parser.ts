export class Parser {
  static stringToBool(bool: string | undefined): boolean {
    return bool === "true" ? true : false;
  }
}
