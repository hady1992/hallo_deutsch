import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useSupabaseData = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // رسائل عربية واضحة للمستخدم عند فشل إجراء إداري صريح (حفظ/حذف).
  // هذه الرسائل تظهر فقط لأدمن قام بإجراء يدوي، وليس عند تحميل الصفحة تلقائيًا.
  const FRIENDLY_MUTATION_MESSAGES = {
    'save exercise': 'تعذر حفظ التمرين. يرجى التحقق من الاتصال بالإنترنت والمحاولة لاحقًا.',
    'delete exercise': 'تعذر حذف التمرين. يرجى التحقق من الاتصال بالإنترنت والمحاولة لاحقًا.',
    'save vocabulary': 'تعذر حفظ الكلمة. يرجى التحقق من الاتصال بالإنترنت والمحاولة لاحقًا.',
    'delete vocabulary': 'تعذر حذف الكلمة. يرجى التحقق من الاتصال بالإنترنت والمحاولة لاحقًا.',
    'save exam': 'تعذر حفظ الامتحان. يرجى التحقق من الاتصال بالإنترنت والمحاولة لاحقًا.',
    'delete exam': 'تعذر حذف الامتحان. يرجى التحقق من الاتصال بالإنترنت والمحاولة لاحقًا.',
    'save placement test': 'تعذر حفظ سؤال تحديد المستوى. يرجى التحقق من الاتصال بالإنترنت والمحاولة لاحقًا.',
    'delete placement test': 'تعذر حذف سؤال تحديد المستوى. يرجى التحقق من الاتصال بالإنترنت والمحاولة لاحقًا.',
  };

  // معالج صامت لعمليات الجلب التلقائية (fetch) التي تحدث عند تحميل الصفحة.
  // لا يعرض إشعارًا مزعجًا للزائر العادي (الصفحات أصلًا ترجع للبيانات المحلية/الافتراضية
  // عند فشل الجلب)، لكنه يسجّل التفاصيل التقنية الكاملة بالـ Console للمطوّر.
  const handleFetchError = (error, action) => {
    console.error(`[Supabase] فشل تحميل بيانات (${action}):`, error);
    return null;
  };

  // معالج لإجراءات إدارية صريحة (حفظ/حذف) يقوم بها الأدمن يدويًا — هذه يجب أن
  // تظهر إشعارًا واضحًا لأن المستخدم بانتظار نتيجة إجراء قام به بنفسه.
  const handleMutationError = (error, action) => {
    console.error(`[Supabase] فشل تنفيذ إجراء (${action}):`, error);
    toast({
      variant: "destructive",
      title: "خطأ",
      description: FRIENDLY_MUTATION_MESSAGES[action] || `تعذر تنفيذ العملية. يرجى المحاولة لاحقًا.`
    });
    return null;
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Authentication required. Please log in as an admin to perform this action.");
    }
    return session;
  };

  // --- Exercises ---
  const fetchExercises = useCallback(async (level = null) => {
    setLoading(true);
    try {
      let query = supabase.from('exercises').select('*');
      if (level) query = query.eq('level', level);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Map content and attach supabase ID
      return data.map(item => ({ 
        ...item.content, 
        supabaseId: item.id, 
        source: 'supabase',
        level: item.level // Ensure level is preserved
      }));
    } catch (error) {
      return handleFetchError(error, 'fetch exercises');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveExercise = useCallback(async (exerciseData) => {
    setLoading(true);
    try {
      await checkAuth();
      const { supabaseId, source, ...content } = exerciseData;
      
      // Ensure we have a valid level
      const level = content.level || 'A1';
      
      const payload = {
        level,
        content: content,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([payload])
        .select();
        
      if (error) throw error;
      
      toast({ title: "تم النشر للزوار", description: "تم حفظ التمرين في السحابة." });
      return { ...data[0].content, supabaseId: data[0].id, source: 'supabase' };
    } catch (error) {
      return handleMutationError(error, 'save exercise');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteExercise = useCallback(async (id) => {
    setLoading(true);
    try {
      await checkAuth();
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Exercise removed from cloud." });
      return true;
    } catch (error) {
      return handleMutationError(error, 'delete exercise');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // --- Vocabulary ---
  const fetchVocabulary = useCallback(async (level = null) => {
    setLoading(true);
    try {
      let query = supabase.from('vocabulary').select('*');
      if (level && level !== 'All') query = query.eq('level', level);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(item => ({ 
        ...item.content, 
        supabaseId: item.id, 
        source: 'supabase',
        level: item.level 
      }));
    } catch (error) {
      return handleFetchError(error, 'fetch vocabulary');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveVocabulary = useCallback(async (vocabData) => {
    setLoading(true);
    try {
      await checkAuth();
      const { supabaseId, source, ...content } = vocabData;
      
      const payload = {
        level: content.level || 'A1',
        content: content,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('vocabulary').insert([payload]).select();
      if (error) throw error;
      
      toast({ title: "تم النشر للزوار", description: "تم حفظ الكلمة في السحابة." });
      return { ...data[0].content, supabaseId: data[0].id, source: 'supabase' };
    } catch (error) {
      return handleMutationError(error, 'save vocabulary');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteVocabulary = useCallback(async (id) => {
    setLoading(true);
    try {
      await checkAuth();
      const { error } = await supabase.from('vocabulary').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Vocabulary removed from cloud." });
      return true;
    } catch (error) {
      return handleMutationError(error, 'delete vocabulary');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // --- Exams ---
  const fetchExams = useCallback(async (level = null) => {
    setLoading(true);
    try {
      let query = supabase.from('exams').select('*');
      if (level) query = query.eq('level', level);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(item => ({ 
        ...item.content, 
        supabaseId: item.id, 
        source: 'supabase',
        level: item.level 
      }));
    } catch (error) {
      return handleFetchError(error, 'fetch exams');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveExam = useCallback(async (examData) => {
    setLoading(true);
    try {
      await checkAuth();
      const { supabaseId, source, ...content } = examData;

      const payload = {
        level: content.level || 'A1',
        content: content,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('exams').insert([payload]).select();
      if (error) throw error;
      
      toast({ title: "تم النشر للزوار", description: "تم حفظ الامتحان في السحابة." });
      return { ...data[0].content, supabaseId: data[0].id, source: 'supabase' };
    } catch (error) {
      return handleMutationError(error, 'save exam');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteExam = useCallback(async (id) => {
    setLoading(true);
    try {
      await checkAuth();
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Exam removed from cloud." });
      return true;
    } catch (error) {
      return handleMutationError(error, 'delete exam');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // --- Placement Tests ---
  const fetchPlacementTests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('placement_tests').select('*');
      if (error) throw error;
      return data.map(item => ({ 
        ...item.content, 
        supabaseId: item.id, 
        source: 'supabase' 
      }));
    } catch (error) {
      return handleFetchError(error, 'fetch placement tests');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const savePlacementTest = useCallback(async (testData) => {
    setLoading(true);
    try {
      await checkAuth();
      const { supabaseId, source, ...content } = testData;

      const payload = {
        level: content.level || 'mixed',
        content: content,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('placement_tests').insert([payload]).select();
      if (error) throw error;
      
      toast({ title: "تم النشر للزوار", description: "تم حفظ سؤال تحديد المستوى في السحابة." });
      return { ...data[0].content, supabaseId: data[0].id, source: 'supabase' };
    } catch (error) {
      return handleMutationError(error, 'save placement test');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deletePlacementTest = useCallback(async (id) => {
    setLoading(true);
    try {
      await checkAuth();
      const { error } = await supabase.from('placement_tests').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Placement test question removed." });
      return true;
    } catch (error) {
      return handleMutationError(error, 'delete placement test');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchExercises,
    fetchVocabulary,
    fetchExams,
    fetchPlacementTests,
    saveExercise,
    saveVocabulary,
    saveExam,
    savePlacementTest,
    deleteExercise,
    deleteVocabulary,
    deleteExam,
    deletePlacementTest
  };
};
