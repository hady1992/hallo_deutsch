import React, { useRef, useState } from 'react';
import { Upload, FileCode, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const KidsFileUploader = ({ onUpload, label = "Upload File", templateData = [] }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateData = (data) => {
    if (!Array.isArray(data)) {
      throw new Error("File content must be a list (Array).");
    }
    if (data.length === 0) {
      throw new Error("The file is empty.");
    }
    // Basic structural check based on template if available
    if (templateData.length > 0) {
      const requiredKeys = Object.keys(templateData[0]);
      const firstItem = data[0];
      const missingKeys = requiredKeys.filter(key => !(key in firstItem));
      
      if (missingKeys.length > 0) {
         console.warn(`Warning: Uploaded data might be missing keys: ${missingKeys.join(', ')}`);
         // We warn but don't block, as optional fields might exist
      }
    }
    return true;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        let data;
        const fileContent = event.target.result;

        if (file.name.endsWith('.json')) {
          try {
             data = JSON.parse(fileContent);
          } catch (e) {
             throw new Error("Invalid JSON format.");
          }
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(fileContent);
        } else {
          throw new Error('Unsupported file format. Please use JSON or CSV.');
        }

        validateData(data);
        await Promise.resolve(onUpload(data));
        
        toast({
          title: "تم النشر للزوار",
          description: `تم استيراد ${data.length} عنصر ونشره بنجاح.`,
          className: "bg-green-50 border-green-200 text-green-800"
        });

      } catch (error) {
        console.error("Upload Error:", error);
        toast({
          variant: "destructive",
          title: "فشل التحميل 😕",
          description: error.message || "تأكد من صحة الملف وحاول مرة أخرى.",
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
        setIsUploading(false);
        toast({
            variant: "destructive",
            title: "خطأ في قراءة الملف",
            description: "حدث خطأ أثناء قراءة الملف."
        });
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return []; // Header only or empty

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      // Simple CSV split handling quotes crudely (for robust CSV, use a library like PapaParse in real apps)
      // This regex handles commas inside quotes
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []; 
      
      const entry = {};
      headers.forEach((header, index) => {
        let val = values[index] ? values[index].trim() : '';
        // Remove quotes if present
        val = val.replace(/^"|"$/g, '');
        entry[header] = val;
      });
      return entry;
    });
  };

  const downloadTemplate = () => {
    if(!templateData.length) return;
    
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => headers.map(fieldName => `"${row[fieldName] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kids_data_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        accept=".json,.csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 rounded-xl font-bold"
      >
        {isUploading ? (
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="mr-2"
            >
                <Upload size={16} />
            </motion.div>
        ) : (
            <Upload size={16} className="mr-2" />
        )}
        {label}
      </Button>
      
      {templateData.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={downloadTemplate}
            className="text-slate-400 hover:text-slate-600 rounded-xl"
            title="تحميل نموذج CSV"
          >
            <FileCode size={16} />
          </Button>
      )}
    </div>
  );
};

export default KidsFileUploader;
