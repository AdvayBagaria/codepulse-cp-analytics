import React, { useState } from 'react';
import { Download, Upload, User, Globe, Shield, HelpCircle, HardDrive, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../lib/storage';

export default function SettingsPage() {
  const { profile, updateProfile } = useApp();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSave = () => {
    updateProfile({ displayName });
  };

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cp_atlas_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importData(content)) {
        setImportSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-500 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Preferences & Data</h1>
        <p className="text-slate-500 text-sm mt-1">
          Control your identity and manage your portable dashboard data.
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
          <User className="w-4 h-4 text-blue-600" />
          <h2 className="text-lg font-bold">User Identity</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name or handle"
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-sm outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Timezone
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-sm outline-none focus:border-blue-500 transition-all font-medium">
                <option>UTC (Coordinated Universal Time)</option>
                <option>IST (India Standard Time)</option>
                <option>EST (Eastern Standard Time)</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-slate-900 text-white px-6 py-2 rounded-md text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wider"
          >
            Update Profile
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <h2 className="text-lg font-bold">Data Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group transition-all hover:border-blue-100">
            <div className="w-12 h-12 bg-slate-50 rounded flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">Export Backup</h3>
            <p className="text-slate-500 text-xs mb-6">
              Download all your local stats, accounts, and goals as a JSON file.
            </p>
            <button
              onClick={handleExport}
              className="mt-auto flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-xs font-bold hover:bg-slate-100 transition-all uppercase tracking-wider"
            >
              Download JSON
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group transition-all hover:border-emerald-100">
            <div className="w-12 h-12 bg-slate-50 rounded flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">Import Data</h3>
            <p className="text-slate-500 text-xs mb-6">
              Restore your dashboard by uploading a previously exported file.
            </p>
            <label className="mt-auto cursor-pointer flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-md text-xs font-bold hover:bg-emerald-100 transition-all uppercase tracking-wider">
              {importSuccess ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {importSuccess ? 'Success' : 'Select File'}
              <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            </label>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-xl p-8 text-white flex flex-col md:flex-row gap-6 items-center leading-relaxed shadow-lg">
        <div className="w-16 h-16 bg-white/10 rounded flex items-center justify-center shrink-0">
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h3 className="text-base font-bold mb-1">Private & Local First</h3>
          <p className="text-slate-400 text-xs">
            CP Atlas does not store your data on any server. Everything is saved locally in your
            browser. Remember to export backups if you plan to switch devices.
          </p>
        </div>
      </section>
    </div>
  );
}
