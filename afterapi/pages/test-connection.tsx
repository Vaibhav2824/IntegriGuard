import { TestConnection } from '../supabase-integration/components/TestConnection';

export default function TestConnectionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Supabase Connection Test</h1>
          <p className="mt-2 text-gray-600">
            This page checks if your Supabase connection is working properly.
          </p>
        </div>
        <TestConnection />
      </div>
    </div>
  );
} 