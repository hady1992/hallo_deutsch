import React, { useRef, useState } from 'react';
import { FileUp, FileDown, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { saveManualQuestion } from '@/utils/storageManager';

const QuestionImporter = ({ levelId, onImportComplete }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);

  const downloadTemplate = () => {
    const csvContent = `question,type,difficulty,correctAnswer,option1,option2,option3,option4,explanation,hint
"Was ist das?",multipleChoice,easy,0,Das Auto,Der Baum,Die Katze,Der Hund,Das Auto ist richtig,Schau auf das Bild
"Der Himmel ist ____.",fillBlank,easy,blau,,,,,Farbe des Himmels,
"Ich ____ nach Hause.",multipleChoice,medium,0,gehe,geht,gehen,gehst,Konjugation von gehen,
"Wie alt ____ du?",multipleChoice,medium,2,bin,ist,bist,seid,Verb sein,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `questions_template_${levelId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStats(null);
    let successCount = 0;
    let errorCount = 0;

    try {
        const text = await file.text();
        const lines = text.split(/\r\n|\n/).filter(line => line.trim());
        
        if (lines.length < 2) throw new Error("الملف فارغ");

        // Parse CSV
        for (let i = 1; i < lines.length; i++) {
            try {
                // Quick CSV regex parser
                const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                // Fallback basic split if simple
                const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                
                // Assuming simple CSV structure: question, type, difficulty, correctAnswer, opt1, opt2, opt3, opt4, explanation, hint
                // Note: a robust parser is better, but simple split works for template adherence
                const [question, type, difficulty, correctAnswer, opt1, opt2, opt3, opt4, explanation, hint] = cols;

                if (!question) { errorCount++; continue; }

                const newQ = {
                    question,
                    type: type || 'multipleChoice',
                    difficulty: difficulty || 'medium',
                    correctAnswer: correctAnswer || '0',
                    options: [opt1, opt2, opt3, opt4].filter(o => o && o.length > 0),
                    explanation: explanation || '',
                    hint: hint || ''
                };
                
                // Basic type validation correction
                if (newQ.type === 'multipleChoice' && newQ.options.length < 2) {
                    // Try to fix options if empty
                    newQ.options = ['Ja', 'Nein']; 
                }

                saveManualQuestion(levelId, newQ);
                successCount++;

            } catch (err) {
                console.error("Row parse error", err);
                errorCount++;
            }
        }

        setImportStats({ success: successCount, errors: errorCount });
        
        toast({
            title: "تم الاستيراد",
            description: `تم استيراد ${successCount} سؤال بنجاح.`,
            className: "bg-green-50 border-green-200 text-green-800"
        });

        if (onImportComplete) onImportComplete();

    } catch (error) {
        toast({
            title: "فشل الاستيراد",
            description: "تأكد من صيغة الملف (CSV UTF-8).",
            variant: "destructive"
        });
    } finally {
        setIsImporting(false);
        e.target.value = ''; // Reset
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
      <h3 className="font-bold text-slate-800 mb-4">استيراد أسئلة (Excel/CSV)</h3>
      
      <div className="flex gap-4">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".csv" 
            className="hidden" 
        />
        
        <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isImporting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
        >
            {isImporting ? <Loader2 className="animate-spin mr-2" /> : <FileUp className="mr-2" size={18} />}
            رفع ملف CSV
        </Button>

        <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="border-slate-300 text-slate-700 hover:bg-white"
        >
            <FileDown className="mr-2" size={18} />
            تحميل القالب
        </Button>
      </div>

      {importStats && (
        <div className="mt-4 flex gap-4 text-sm">
            <span className="flex items-center text-green-600 gap-1"><Check size={14} /> نجاح: {importStats.success}</span>
            {importStats.errors > 0 && <span className="flex items-center text-red-500 gap-1"><AlertTriangle size={14} /> أخطاء: {importStats.errors}</span>}
        </div>
      )}
    </div>
  );
};

export default QuestionImporter;