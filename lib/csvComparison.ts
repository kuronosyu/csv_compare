export async function compareCSVFiles(file1: File, file2: File): Promise<any[]> {
  const csv1 = await readCSVFile(file1);
  const csv2 = await readCSVFile(file2);
  
  return getDifferenceById(csv1, csv2);
}

async function readCSVFile(file: File): Promise<string[][]> {
  const text = await file.text();
  return text.split('\n').map(row => row.split(','));
}

function getDifferenceById(csv1: string[][], csv2: string[][]): any[] {
  const diff: any[] = [];
  const map1 = new Map<string, string[]>();
  const map2 = new Map<string, string[]>();
  
  csv1.forEach((row) => {
    map1.set(row[0], row);
  });

  csv2.forEach((row) => {
    map2.set(row[0], row);
  });

  map1.forEach((row1, id) => {
    if (!map2.has(id)) {
      diff.push(['削除', row1.join(','), '', '']);
    } else {
      const row2 = map2.get(id)!;
      if (row1.join() !== row2.join()) {
        const changes = compareRows(row1, row2);
        diff.push(['変更', row1.join(','), row2.join(','), changes]);
      }
    }
  });

  map2.forEach((row2, id) => {
    if (!map1.has(id)) {
      diff.push(['追加', '', row2.join(','), '']);
    }
  });

  return diff.sort((a, b) => {
    const idA = extractIdFromRow(a);
    const idB = extractIdFromRow(b);
    return idA - idB;
  });
}

function compareRows(row1: string[], row2: string[]): string {
  const changes: string[] = [];
  for (let i = 0; i < row1.length; i++) {
    if (row1[i] !== row2[i]) {
      changes.push(`列${i + 1}: '${row1[i]}' -> '${row2[i]}'`);
    }
  }
  return changes.join(', ');
}

function extractIdFromRow(row: any[]): number {
  const content = row[1] || row[2];
  const id = content.split(',')[0];
  return parseInt(id, 10);
}

export function extractDifferences(results: any[]): { before: string, after: string } {
  const before: string[] = [];
  const after: string[] = [];

  results.forEach(row => {
    if (row[0] === '削除' || row[0] === '変更') {
      before.push(row[1]);
    }
    if (row[0] === '追加' || row[0] === '変更') {
      after.push(row[2]);
    }
  });

  return {
    before: before.join('\n'),
    after: after.join('\n')
  };
}