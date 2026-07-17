import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const QuestionList = ({ questions, onEdit, onDelete }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <HelpCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-lg font-medium text-slate-700">No questions added yet</h3>
        <p className="text-slate-500">Use the form above to add your first question.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
          {questions.length} Questions
        </span>
      </h2>

      {questions.map((q, index) => (
        <Card key={q.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <span className="bg-slate-100 text-slate-600 font-bold h-8 w-8 flex items-center justify-center rounded-full text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-lg text-slate-800" dir="auto">{q.question}</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(q)} className="text-red-600 hover:bg-red-50">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(q.id)} className="text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
              {q.options.map((opt, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-lg border text-sm flex items-center gap-2",
                    i === q.correctAnswer
                      ? "bg-green-50 border-green-200 text-green-800 font-medium"
                      : "bg-white border-slate-100 text-slate-600"
                  )}
                  dir="auto"
                >
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded",
                    i === q.correctAnswer ? "bg-green-200 text-green-900" : "bg-slate-100 text-slate-500"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {i === q.correctAnswer && <Badge variant="outline" className="ml-auto bg-green-100 text-green-800 border-green-200 text-[10px]">Correct</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuestionList;