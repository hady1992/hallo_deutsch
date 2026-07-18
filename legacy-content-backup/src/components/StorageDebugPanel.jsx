import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Trash, RefreshCw } from 'lucide-react';
import { getStorageStats, clearPersistentData, getPersistentPlacementTestQuestions, getPersistentExercises } from '@/utils/persistentDataStorage';
import { useToast } from '@/components/ui/use-toast';

const StorageDebugPanel = () => {
    const { toast } = useToast();
    const [stats, setStats] = useState(null);
    const [placementData, setPlacementData] = useState([]);
    const [exerciseData, setExerciseData] = useState([]);
    const [loading, setLoading] = useState(false);

    const refreshStats = async () => {
        setLoading(true);
        const s = getStorageStats();
        setStats(s);

        // Fetch detailed lists
        const p = await getPersistentPlacementTestQuestions();
        const e = await getPersistentExercises();
        setPlacementData(p);
        setExerciseData(e);
        setLoading(false);
    };

    useEffect(() => {
        refreshStats();
    }, []);

    const handleClear = async (type) => {
        if(window.confirm(`Are you sure you want to clear ${type} from LOCAL STORAGE? This does not delete from Supabase, but will unsync local state.`)) {
            await clearPersistentData(type);
            toast({ title: "Cleared local data", description: `${type} cleared.` });
            refreshStats();
            window.location.reload(); // Hard reload to reset components
        }
    };

    if (!stats) return null;

    return (
        <Card className="mt-8 border-red-200 bg-red-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                    <Database className="w-5 h-5" /> Storage Debugger (Admin Only)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-sm text-slate-500">Placement Tests (Total)</div>
                        <div className="text-2xl font-bold">{placementData.length}</div>
                        <div className="text-xs text-slate-400 mt-1">
                            Defaults: {placementData.filter(i=>i.source==='default').length} | 
                            Local: {placementData.filter(i=>i.source==='local').length} | 
                            Cloud: {placementData.filter(i=>i.source==='cloud').length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-sm text-slate-500">Exercises (Total)</div>
                        <div className="text-2xl font-bold">{exerciseData.length}</div>
                        <div className="text-xs text-slate-400 mt-1">
                            Defaults: {exerciseData.filter(i=>i.source==='default').length} | 
                            Local: {exerciseData.filter(i=>i.source==='local').length} | 
                            Cloud: {exerciseData.filter(i=>i.source==='cloud').length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-sm text-slate-500">Local Storage Size</div>
                        <div className="text-2xl font-bold">{stats.totalLocalStorageSize}</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={refreshStats} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleClear('placement')}>
                        <Trash className="w-4 h-4 mr-2" /> Clear Placement (Local)
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleClear('exercises')}>
                        <Trash className="w-4 h-4 mr-2" /> Clear Exercises (Local)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default StorageDebugPanel;