'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X, ArrowRight } from 'lucide-react';

interface ImportResults {
  teachersCreated: number;
  teachersUpdated: number;
  assignmentsCreated: number;
  assignmentsUpdated: number;
  errors: string[];
  totalRows: number;
}

export default function ImportDataPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<ImportResults | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.imp-animate', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
    } else {
      setErrorMsg('Please upload an .xlsx or .csv file');
      setStatus('error');
      setTimeout(() => { setStatus('idle'); setErrorMsg(''); }, 3000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setErrorMsg('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/import', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        setResults(data.results);
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Import failed');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  const resetForm = () => {
    setFile(null);
    setStatus('idle');
    setResults(null);
    setErrorMsg('');
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 imp-animate">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Import Data</h1>
        <p className="text-gray-500 mt-1 text-sm">Bulk import teachers and subject assignments from Excel or CSV.</p>
      </div>

      {/* File Format Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-6 imp-animate">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Expected File Format</h3>
        <p className="text-sm text-blue-800 mb-3">Your Excel/CSV file must have exactly <strong>5 columns</strong> in this order:</p>
        <div className="overflow-x-auto">
          <table className="text-xs text-blue-900 border-collapse w-full">
            <thead>
              <tr className="bg-blue-100/60">
                <th className="px-3 py-2 text-left border border-blue-200 font-semibold">Column</th>
                <th className="px-3 py-2 text-left border border-blue-200 font-semibold">Example</th>
                <th className="px-3 py-2 text-left border border-blue-200 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-3 py-1.5 border border-blue-200">1. Class</td><td className="px-3 py-1.5 border border-blue-200">XII, X S, 5</td><td className="px-3 py-1.5 border border-blue-200">Required</td></tr>
              <tr><td className="px-3 py-1.5 border border-blue-200">2. Main Subject</td><td className="px-3 py-1.5 border border-blue-200">English Literature</td><td className="px-3 py-1.5 border border-blue-200">Required</td></tr>
              <tr><td className="px-3 py-1.5 border border-blue-200">3. Sub-Subject</td><td className="px-3 py-1.5 border border-blue-200">Reading, Free Writing</td><td className="px-3 py-1.5 border border-blue-200">Optional (empty for higher classes)</td></tr>
              <tr><td className="px-3 py-1.5 border border-blue-200">4. Teacher Name</td><td className="px-3 py-1.5 border border-blue-200">Jane Doe</td><td className="px-3 py-1.5 border border-blue-200">Required</td></tr>
              <tr><td className="px-3 py-1.5 border border-blue-200">5. School Mail ID</td><td className="px-3 py-1.5 border border-blue-200">jane@pallikoodam.org</td><td className="px-3 py-1.5 border border-blue-200">&quot;N/A&quot; if not available</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="imp-animate">
        {!file && status !== 'success' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center transition-all cursor-pointer ${
              dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input id="file-input" type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={handleFileSelect} />
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-blue-500' : 'text-gray-300'}`} />
            <p className="text-gray-700 font-medium mb-1">Drag & drop your file here</p>
            <p className="text-gray-400 text-sm">or click to browse — .xlsx or .csv</p>
          </div>
        )}

        {/* File Selected — Preview */}
        {file && status !== 'success' && (
          <div className="bg-white rounded-2xl shadow-soft border border-soft p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center mr-3">
                  <FileSpreadsheet className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === 'error' && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center mb-4 border border-red-200">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />{errorMsg}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={status === 'uploading'}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
            >
              {status === 'uploading' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <><ArrowRight className="w-4 h-4 mr-2" /> Import Data</>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {status === 'success' && results && (
          <div className="bg-white rounded-2xl shadow-soft border border-soft p-5 sm:p-6 space-y-5">
            <div className="flex items-center text-green-700 mb-2">
              <CheckCircle2 className="w-6 h-6 mr-2" />
              <h3 className="font-semibold text-lg">Import Complete!</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
                <p className="text-2xl font-bold text-green-700">{results.teachersCreated}</p>
                <p className="text-[10px] text-green-600 uppercase tracking-wider font-semibold">Teachers Created</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{results.teachersUpdated}</p>
                <p className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold">Teachers Updated</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
                <p className="text-2xl font-bold text-green-700">{results.assignmentsCreated}</p>
                <p className="text-[10px] text-green-600 uppercase tracking-wider font-semibold">Assignments New</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{results.assignmentsUpdated}</p>
                <p className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold">Assignments Updated</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="text-sm font-semibold text-red-800 mb-2">Errors ({results.errors.length})</h4>
                <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto">
                  {results.errors.map((err, i) => (
                    <li key={i} className="flex items-start"><AlertCircle className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={resetForm} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors">
              Import Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
