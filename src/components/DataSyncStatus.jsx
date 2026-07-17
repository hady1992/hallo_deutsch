import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertTriangle, Cloud, Wifi, WifiOff } from "lucide-react";
import { syncLocalStorageToSupabase } from '@/utils/storageManager';
import { supabase } from '@/lib/customSupabaseClient';

const DataSyncStatus = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(localStorage.getItem('lastSupabaseSync'));
  const [status, setStatus] = useState(lastSync ? 'synced' : 'pending');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Check connection periodically
    const checkConnection = async () => {
        try {
            const { error } = await supabase.from('content_items').select('id').limit(1);
            setIsConnected(!error);
        } catch {
            setIsConnected(false);
        }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setStatus('syncing');
    try {
      const result = await syncLocalStorageToSupabase();
      if (result.success) {
        setStatus('synced');
        const time = new Date().toLocaleString();
        setLastSync(time);
        localStorage.setItem('lastSupabaseSync', time);
      } else {
        setStatus('error');
        console.error("Sync errors:", result.log);
      }
    } catch (e) {
        console.error(e);
        setStatus('error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="bg-white border-red-100 shadow-sm mb-6">
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-full relative">
            <Cloud className="w-5 h-5 text-red-600" />
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                Cloud Sync
                {!isConnected && <span className="text-xs text-red-500 flex items-center gap-1"><WifiOff size={10} /> Disconnected</span>}
            </h4>
            <p className="text-xs text-slate-500">
                {lastSync ? `Last synced: ${lastSync}` : 'No sync recorded'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
             {status === 'synced' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Synced</Badge>}
             {status === 'error' && <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Error</Badge>}
             {status === 'syncing' && <Badge className="bg-red-100 text-red-700"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Syncing...</Badge>}

             <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing || !isConnected}>
                {syncing ? 'Syncing...' : 'Sync Now'}
             </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSyncStatus;
