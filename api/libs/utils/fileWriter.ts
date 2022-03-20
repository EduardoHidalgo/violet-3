import fs from "fs";
import appRoot from "app-root-path";

interface WriteArgs {
  data: string;
  path: string;
  fileName: string;
}

/** Internal File Writer class to handle file operations on Node.js. Notice
 * errors use console.error instead Logger class to prevent infinite loop call.
 */
class FileWriter {
  private root: string;

  constructor() {
    this.root = appRoot.path;
  }

  logPath(): void {
    console.log({ path: this.root });
  }

  createFolder(path: string): void {
    try {
      const dirPath = `${this.root}/${path}`;

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {
          recursive: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  fileExists(path: string): boolean {
    try {
      let exists = false;

      fs.writeFile(path, "", { flag: "wx" }, (error) => {
        if (error) return;

        exists = true;
      });

      return exists;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  appendFile(args: WriteArgs) {
    try {
      const { data, path, fileName } = args;
      const filePath = `${this.root}/${path}/${fileName}`;

      this.createFolder(path);

      if (!this.fileExists(filePath)) {
        fs.appendFileSync(filePath, data);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export { FileWriter };
