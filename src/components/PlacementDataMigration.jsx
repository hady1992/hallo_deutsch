import React, { useState, useEffect } from 'react';
import { generatePlacementTestFileContent } from '@/utils/migrationUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Copy, CheckCircle, AlertTriangle, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PlacementDataMigration = () => {
  const [fileContent, setFileContent] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const result = generatePlacementTestFileContent();
    if (result.success) {
      setFileContent(result.content);
      setQuestionCount(result.count);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fileContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placementTestData.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-red-100 shadow-md">
        <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-red-900 flex items-center gap-2">
                <FileCode className="w-6 h-6" />
                أداة استخراج البيانات
              </CardTitle>
              <CardDescription className="text-red-700 mt-1 text-base">
                استخراج أسئلة تحديد المستوى من المتصفح لدمجها في الكود المصدري.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-white text-red-700 px-4 py-1 text-sm border-red-200">
              {questionCount} سؤال مكتشف
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 font-bold">تعليمات هامة</AlertTitle>
            <AlertDescription className="text-amber-700 mt-1 leading-relaxed">
              بما أن النظام لا يمكنه الوصول المباشر لمتصفحك، يرجى اتباع الخطوات التالية:
              <ol className="list-decimal list-inside mt-2 space-y-1 font-medium">
                <li>اضغط على زر <strong>"تحميل الملف"</strong> أدناه.</li>
                <li>سيتم تحميل ملف باسم <code>placementTestData.js</code>.</li>
                <li>استبدل الملف الموجود في مجلد مشروعك: <code>src/data/placementTestData.js</code> بهذا الملف الجديد.</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 mb-4">
            <Button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg">
              <Download className="w-5 h-5 mr-2" /> تحميل الملف (.js)
            </Button>
            <Button onClick={handleCopy} variant="outline" className="flex-1 h-12 text-lg border-slate-300">
              {copied ? <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? 'تم النسخ!' : 'نسخ الكود'}
            </Button>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-50 p-6 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed border border-slate-700 h-96 custom-scrollbar" dir="ltr">
              {fileContent || "// Loading..."}
            </pre>
            <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-slate-900/10 to-transparent h-4 pointer-events-none rounded-t-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacementDataMigration;