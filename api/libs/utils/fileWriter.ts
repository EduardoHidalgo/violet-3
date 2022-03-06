import fs from "fs";
import appRoot from "app-root-path";

interface WriteArgs {
  data: string;
  path: string;
  fileName: string;
}

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
      console.log({ error });
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
      console.log({ error });
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
      console.log({ error });
    }
  }
}

export { FileWriter };
