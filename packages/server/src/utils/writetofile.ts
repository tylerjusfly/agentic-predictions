import { promises as fs } from "fs";

async function appendJsonToArrayFile(path: string, newDataArray: any[]) {
  let existingArray: any[] = [];

  try {
    const fileData = await fs.readFile(path, "utf-8");

    if (fileData.trim().length === 0) {
      // The file exists but is empty
      existingArray = [];
    } else {
      existingArray = JSON.parse(fileData);

      if (!Array.isArray(existingArray)) {
        throw new Error("File content is not an array!");
      }
    }
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    // File does not exist yet – start with empty array
  }

  existingArray.push(...newDataArray);

  await fs.writeFile(path, JSON.stringify(existingArray, null, 2), "utf-8");
}


export default appendJsonToArrayFile