"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { compareCSVFiles, extractDifferences } from '@/lib/csvComparison';

export function CSVComparison() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleCompare = async () => {
    if (file1 && file2) {
      const comparisonResults = await compareCSVFiles(file1, file2);
      setResults(comparisonResults);
    }
  };

  const getRowColor = (status: string) => {
    switch (status) {
      case '削除':
        return 'bg-red-100';
      case '追加':
        return 'bg-blue-100';
      case '変更':
        return 'bg-yellow-100';
      default:
        return '';
    }
  };

  const handleExport = (type: 'before' | 'after') => {
    const { before, after } = extractDifferences(results);
    const content = type === 'before' ? before : after;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `diff_${type}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Input type="file" accept=".csv" onChange={(e) => handleFileChange(e, setFile1)} />
        <Input type="file" accept=".csv" onChange={(e) => handleFileChange(e, setFile2)} />
        <Button onClick={handleCompare}>Compare CSVs</Button>
      </div>
      {results.length > 0 && (
        <>
          <div className="flex gap-4 mb-4">
            <Button onClick={() => handleExport('before')}>Export Before CSV</Button>
            <Button onClick={() => handleExport('after')}>Export After CSV</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row, index) => (
                <TableRow key={index} className={getRowColor(row[0])}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                  <TableCell>{row[3]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}