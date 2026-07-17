import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Save, X, Edit2 } from 'lucide-react';

const QuestionForm = ({ onSubmit, onCancel, initialData }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '0'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        question: initialData.question || '',
        optionA: initialData.options?.[0] || '',
        optionB: initialData.options?.[1] || '',
        optionC: initialData.options?.[2] || '',
        optionD: initialData.options?.[3] || '',
        correctAnswer: String(initialData.correctAnswer || '0')
      });
    } else {
      setFormData({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '0'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim() || !formData.optionA.trim() || !formData.optionB.trim() || !formData.optionC.trim() || !formData.optionD.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const submissionData = {
      id: initialData?.id || Date.now().toString(),
      question: formData.question,
      options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
      correctAnswer: parseInt(formData.correctAnswer, 10)
    };

    onSubmit(submissionData);

    if (!initialData) {
      setFormData({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '0'
      });
    }

    toast({
      title: initialData ? "Question Updated" : "Question Added",
      description: initialData ? "Changes saved successfully." : "New question added to the list.",
      className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  return (
    <Card className="mb-8 border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <CardTitle className="text-lg flex items-center gap-2">
          {initialData ? <Edit2 className="w-5 h-5 text-red-600" /> : <Save className="w-5 h-5 text-green-600" />}
          {initialData ? 'Edit Question' : 'Add New Question'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question Text</Label>
            <Input
              id="question"
              name="question"
              placeholder="e.g., Was bedeutet 'Haus'?"
              value={formData.question}
              onChange={handleChange}
              dir="auto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="optionA">Option A</Label>
              <Input
                id="optionA"
                name="optionA"
                placeholder="Option A"
                value={formData.optionA}
                onChange={handleChange}
                dir="auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="optionB">Option B</Label>
              <Input
                id="optionB"
                name="optionB"
                placeholder="Option B"
                value={formData.optionB}
                onChange={handleChange}
                dir="auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="optionC">Option C</Label>
              <Input
                id="optionC"
                name="optionC"
                placeholder="Option C"
                value={formData.optionC}
                onChange={handleChange}
                dir="auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="optionD">Option D</Label>
              <Input
                id="optionD"
                name="optionD"
                placeholder="Option D"
                value={formData.optionD}
                onChange={handleChange}
                dir="auto"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            <select
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="0">Option A</option>
              <option value="1">Option B</option>
              <option value="2">Option C</option>
              <option value="3">Option D</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {initialData && (
              <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
                <X className="w-4 h-4" /> Cancel
              </Button>
            )}
            <Button type="submit" className="gap-2 bg-red-600 hover:bg-red-700">
              <Save className="w-4 h-4" /> {initialData ? 'Update Question' : 'Save Question'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionForm;