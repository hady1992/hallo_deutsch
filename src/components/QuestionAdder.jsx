import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { saveManualQuestion, updateManualQuestion } from '@/utils/storageManager';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const QuestionAdder = ({ levelId, onSave, editingQuestion = null, onCancelEdit }) => {
  const { toast } = useToast();

  const initialFormState = {
    question: '',
    type: 'multipleChoice', // multipleChoice, fillBlank
    difficulty: 'medium',
    options: ['', '', '', ''],
    correctAnswer: '0', // Index for multipleChoice, text for fillBlank
    explanation: '',
    hint: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Load editing data if provided
  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        ...editingQuestion,
        // Ensure options has at least 2 for UI if it was somehow saved with less
        options: editingQuestion.options && editingQuestion.options.length > 0 ? editingQuestion.options : ['', '']
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingQuestion]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast({
        title: "غير مسموح",
        description: "يجب أن يكون هناك خياران على الأقل.",
        variant: "destructive"
      });
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);

    // Adjust correct answer index if needed
    let newCorrect = parseInt(formData.correctAnswer);
    if (index < newCorrect) newCorrect -= 1;
    else if (index === newCorrect) newCorrect = 0; // Reset to first if selected was removed

    setFormData(prev => ({
      ...prev,
      options: newOptions,
      correctAnswer: newCorrect.toString()
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.question.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال نص السؤال.", variant: "destructive" });
      return;
    }

    if (formData.type === 'multipleChoice') {
      const validOptions = formData.options.filter(opt => opt.trim().length > 0);
      if (validOptions.length < 2) {
        toast({ title: "خطأ", description: "يرجى إضافة خيارين على الأقل.", variant: "destructive" });
        return;
      }
    } else if (formData.type === 'fillBlank') {
      if (!formData.correctAnswer.trim()) {
        toast({ title: "خطأ", description: "يرجى إدخال الإجابة الصحيحة.", variant: "destructive" });
        return;
      }
    }

    // Save
    const success = editingQuestion
      ? updateManualQuestion(levelId, editingQuestion.id, formData)
      : saveManualQuestion(levelId, formData);

    if (success) {
      toast({
        title: editingQuestion ? "تم التحديث" : "تم الحفظ",
        description: editingQuestion ? "تم تحديث السؤال بنجاح." : "تمت إضافة السؤال بنجاح.",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      if (!editingQuestion) {
        setFormData(initialFormState); // Reset if adding new
      }

      if (onSave) onSave();
    } else {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحفظ.", variant: "destructive" });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
      </h3>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <Label className="mb-2 block text-sm font-medium text-slate-700">نص السؤال</Label>
          <Input
            value={formData.question}
            onChange={(e) => handleChange('question', e.target.value)}
            placeholder="اكتب السؤال هنا..."
            className="w-full text-lg"
            dir="auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">نوع السؤال</Label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full p-2 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="multipleChoice">اختيار من متعدد</option>
              <option value="fillBlank">ملء الفراغ</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">مستوى الصعوبة</Label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full p-2 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </select>
          </div>
        </div>

        {/* Options (Multiple Choice) */}
        {formData.type === 'multipleChoice' && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <Label className="mb-3 block text-sm font-medium text-slate-700">الخيارات</Label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={parseInt(formData.correctAnswer) === index}
                    onChange={() => handleChange('correctAnswer', index.toString())}
                    className="w-4 h-4 text-red-600 cursor-pointer"
                  />
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`خيار ${index + 1}`}
                    className="flex-1 bg-white"
                    dir="auto"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Plus size={16} className="mr-1" /> إضافة خيار
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <CheckCircle size={12} className="text-green-500" />
              حدد الدائرة بجانب الإجابة الصحيحة.
            </p>
          </div>
        )}

        {/* Correct Answer (Fill Blank) */}
        {formData.type === 'fillBlank' && (
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">الإجابة الصحيحة (النصية)</Label>
            <Input
              value={formData.correctAnswer}
              onChange={(e) => handleChange('correctAnswer', e.target.value)}
              placeholder="اكتب الكلمة أو الجملة الصحيحة..."
              className="w-full border-green-200 focus:border-green-500"
              dir="auto"
            />
          </div>
        )}

        {/* Hints & Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">شرح الإجابة (يظهر بعد الحل)</Label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleChange('explanation', e.target.value)}
              className="w-full p-2 rounded-md border border-slate-200 bg-white min-h-[80px] text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="لماذا هذه هي الإجابة الصحيحة؟"
              dir="auto"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">تلميح (اختياري)</Label>
            <div className="relative">
                <textarea
                value={formData.hint}
                onChange={(e) => handleChange('hint', e.target.value)}
                className="w-full p-2 rounded-md border border-slate-200 bg-white min-h-[80px] text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="مساعدة للطالب..."
                dir="auto"
                />
                <HelpCircle size={16} className="absolute top-2 left-2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          {editingQuestion && (
            <Button
              variant="outline"
              onClick={onCancelEdit}
              className="text-slate-600"
            >
              إلغاء
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
          >
            <Save size={18} className="mr-2" />
            {editingQuestion ? 'حفظ التعديلات' : 'حفظ السؤال'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionAdder;