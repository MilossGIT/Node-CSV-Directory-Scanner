import fs from 'fs/promises';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// Replace 'user_name' with the actual user directory
const rootDirectory = '/Users/user_name/Downloads/extract-properties';
const csvFilePath = 'output.csv';

const csvWriter = createObjectCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'Name', title: 'Name' },
    { id: 'Customer Email', title: 'Customer Email' },
  ],
});

async function findOptionsFiles(directory) {
  try {
    const items = await fs.readdir(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        if (item === 'customer_folder1' || item === 'customer_folder2') {
          await findOptionsInDirectory(itemPath);
        } else {
          await findOptionsFiles(itemPath);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function findOptionsInDirectory(directory) {
  try {
    const items = await fs.readdir(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        await findOptionsInDirectory(itemPath);
      } else if (item === 'customer_properties.js') {
        try {
          const fileContent = await fs.readFile(itemPath, 'utf8');
          const nameMatch = /name:\s*'([^']+)'/i.exec(fileContent);
          const CustomerEmailMatch = /CustomerEmail:\s*(['"])(?:(?=(\\?))\2.)*?\1/i.exec(fileContent);

          if (nameMatch) {
            const row = {
              File: path.relative(rootDirectory, itemPath),
              Name: nameMatch[1],
              'Customer Email': CustomerEmailMatch ? CustomerEmailMatch[0] : 'Not found',
            };
            await csvWriter.writeRecords([row]);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

(async () => {
  try {
    await findOptionsFiles(rootDirectory);
  } catch (error) {
    console.error('Error:', error);
  }
})();
