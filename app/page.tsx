import { CSVComparison } from '@/components/CSVComparison';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">CSV Comparison Tool</h1>
      <CSVComparison />
    </div>
  );
}