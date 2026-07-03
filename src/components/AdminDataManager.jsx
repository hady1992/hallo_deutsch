import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Save, Plus, Database, RefreshCw, Lock } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/SupabaseAuthContext';

const JsonEditor = ({ initialValue, onSave, onCancel }) => {
  const [value, setValue] = useState(JSON.stringify(initialValue, null, 2));
  const [error, setError] = useState(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(value);
      onSave(parsed);
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>JSON Content</Label>
        <Textarea 
          value={value} 
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          className="font-mono text-xs min-h-[300px]"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
          <Save className="w-4 h-4 mr-2" /> Save Item
        </Button>
      </div>
    </div>
  );
};

const DataTab = ({ type, fetchData, deleteData, saveData, title, isAuthenticated }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const loadData = async () => {
    setLoading(true);
    const data = await fetchData();
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
        alert("You must be logged in as an admin to delete items.");
        return;
    }
    if (!confirm("Are you sure you want to delete this item?")) return;
    const success = await deleteData(id);
    if (success) loadData();
  };

  const handleSaveNew = async (data) => {
    if (!isAuthenticated) {
        alert("You must be logged in as an admin to save items.");
        return;
    }
    await saveData(data);
    setIsCreating(false);
    loadData();
  };

  // Default templates based on type
  const getTemplate = () => {
    if (type === 'exercise') return { type: "multiple_choice", level: "A1", question: "New Question", options: ["A", "B"], correct: 0 };
    if (type === 'vocabulary') return { german: "Wort", arabic: "Word", level: "A1", category: "General" };
    if (type === 'exam') return { title: "New Exam", level: "A1", questions: [] };
    if (type === 'placement') return { question: "New Question", options: [], correctAnswer: 0, level: "A1" };
    return {};
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          {title} <Badge variant="secondary">{items.length}</Badge>
        </h3>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button 
                onClick={() => setIsCreating(true)} 
                disabled={loading || isCreating || !isAuthenticated}
                title={!isAuthenticated ? "Login required" : "Add New"}
            >
                {isAuthenticated ? <Plus className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />} 
                Add New
            </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Add New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonEditor 
              initialValue={getTemplate()} 
              onSave={handleSaveNew} 
              onCancel={() => setIsCreating(false)} 
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
        {items.map((item, idx) => (
          <Card key={item.supabaseId || idx} className="overflow-hidden">
            <CardContent className="p-4 flex justify-between items-start gap-4">
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-2 mb-2">
                  <Badge>{item.level || 'N/A'}</Badge>
                  {item.category && <Badge variant="outline">{item.category}</Badge>}
                  {item.type && <Badge variant="outline">{item.type}</Badge>}
                </div>
                <pre className="text-xs text-slate-600 bg-slate-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(item, (key, value) => (key === 'supabaseId' || key === 'source' ? undefined : value), 2).substring(0, 150)}...
                </pre>
              </div>
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => handleDelete(item.supabaseId)}
                title={isAuthenticated ? "Delete from Database" : "Login required"}
                disabled={!isAuthenticated}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {!loading && items.length === 0 && (
            <div className="text-center py-8 text-slate-400">No items found in database.</div>
        )}
      </div>
    </div>
  );
};

const AdminDataManager = () => {
  // Task 3: Ensure data operations are properly authenticated
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const { 
    fetchExercises, saveExercise, deleteExercise,
    fetchVocabulary, saveVocabulary, deleteVocabulary,
    fetchExams, saveExam, deleteExam,
    fetchPlacementTests, savePlacementTest, deletePlacementTest
  } = useSupabaseData();

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="bg-slate-900 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-400" />
          <div className="flex-1">
            <CardTitle>Supabase Data Management</CardTitle>
            <CardDescription className="text-slate-400">
                Directly manage content stored in the cloud database.
            </CardDescription>
          </div>
          {!isAuthenticated && (
            <Badge variant="destructive" className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="exercises">
          <TabsList className="mb-6 w-full justify-start bg-slate-100 p-1">
            <TabsTrigger value="exercises" className="flex-1">Exercises</TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex-1">Vocabulary</TabsTrigger>
            <TabsTrigger value="exams" className="flex-1">Exams</TabsTrigger>
            <TabsTrigger value="placement" className="flex-1">Placement Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercises">
            <DataTab 
                type="exercise"
                title="Cloud Exercises"
                fetchData={() => fetchExercises()} 
                saveData={saveExercise} 
                deleteData={deleteExercise} 
                isAuthenticated={isAuthenticated}
            />
          </TabsContent>
          
          <TabsContent value="vocabulary">
             <DataTab 
                type="vocabulary"
                title="Cloud Vocabulary"
                fetchData={() => fetchVocabulary()} 
                saveData={saveVocabulary} 
                deleteData={deleteVocabulary} 
                isAuthenticated={isAuthenticated}
            />
          </TabsContent>

          <TabsContent value="exams">
             <DataTab 
                type="exam"
                title="Cloud Exams"
                fetchData={() => fetchExams()} 
                saveData={saveExam} 
                deleteData={deleteExam} 
                isAuthenticated={isAuthenticated}
            />
          </TabsContent>

          <TabsContent value="placement">
             <DataTab 
                type="placement"
                title="Placement Test Questions"
                fetchData={() => fetchPlacementTests()} 
                saveData={savePlacementTest} 
                deleteData={deletePlacementTest} 
                isAuthenticated={isAuthenticated}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminDataManager;