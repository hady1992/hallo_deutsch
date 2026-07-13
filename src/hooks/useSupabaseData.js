import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  deletePublishedContentItem,
  getPublishedContent,
  publishContentItem,
} from '@/services/contentRepository';

const FRIENDLY_MUTATION_MESSAGES = {
  'save exercise': 'تعذر حفظ التمرين في التخزين السحابي.',
  'delete exercise': 'تعذر حذف التمرين من التخزين السحابي.',
  'save vocabulary': 'تعذر حفظ الكلمة في التخزين السحابي.',
  'delete vocabulary': 'تعذر حذف الكلمة من التخزين السحابي.',
  'save exam': 'تعذر حفظ الامتحان في التخزين السحابي.',
  'delete exam': 'تعذر حذف الامتحان من التخزين السحابي.',
  'save placement test': 'تعذر حفظ سؤال تحديد المستوى في التخزين السحابي.',
  'delete placement test': 'تعذر حذف سؤال تحديد المستوى من التخزين السحابي.',
};

export const useSupabaseData = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchContent = useCallback(async (contentType, level = null) => {
    setLoading(true);
    try {
      return await getPublishedContent(contentType, level);
    } catch (error) {
      console.error(`[ContentRepository] Failed to fetch ${contentType}:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveContent = useCallback(async (contentType, item, action, successDescription) => {
    setLoading(true);
    try {
      const { supabaseId, source, storageTable, ...content } = item;
      const result = await publishContentItem(contentType, content);
      if (!result.success) throw new Error(result.error || 'Cloud save failed.');

      toast({
        title: 'تم النشر للزوار',
        description: successDescription,
      });
      return result.items[0] || null;
    } catch (error) {
      console.error(`[ContentRepository] ${action} failed:`, error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: FRIENDLY_MUTATION_MESSAGES[action] || 'تعذر تنفيذ العملية. يرجى المحاولة لاحقًا.',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteContent = useCallback(async (contentType, item, action) => {
    setLoading(true);
    try {
      const result = await deletePublishedContentItem(contentType, item);
      if (!result.success) throw new Error(result.error || 'Cloud delete failed.');
      toast({ title: 'تم الحذف', description: 'تم حذف العنصر من التخزين السحابي.' });
      return true;
    } catch (error) {
      console.error(`[ContentRepository] ${action} failed:`, error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: FRIENDLY_MUTATION_MESSAGES[action] || 'تعذر تنفيذ العملية. يرجى المحاولة لاحقًا.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchExercises = useCallback((level = null) => fetchContent('exercises', level), [fetchContent]);
  const fetchVocabulary = useCallback((level = null) => fetchContent('vocabulary', level === 'All' ? null : level), [fetchContent]);
  const fetchExams = useCallback((level = null) => fetchContent('exams', level), [fetchContent]);
  const fetchPlacementTests = useCallback(() => fetchContent('placement_tests'), [fetchContent]);

  const saveExercise = useCallback((item) => saveContent('exercises', item, 'save exercise', 'تم حفظ التمرين في السحابة.'), [saveContent]);
  const saveVocabulary = useCallback((item) => saveContent('vocabulary', item, 'save vocabulary', 'تم حفظ الكلمة في السحابة.'), [saveContent]);
  const saveExam = useCallback((item) => saveContent('exams', item, 'save exam', 'تم حفظ الامتحان في السحابة.'), [saveContent]);
  const savePlacementTest = useCallback((item) => saveContent('placement_tests', item, 'save placement test', 'تم حفظ سؤال تحديد المستوى في السحابة.'), [saveContent]);

  const deleteExercise = useCallback((item) => deleteContent('exercises', item, 'delete exercise'), [deleteContent]);
  const deleteVocabulary = useCallback((item) => deleteContent('vocabulary', item, 'delete vocabulary'), [deleteContent]);
  const deleteExam = useCallback((item) => deleteContent('exams', item, 'delete exam'), [deleteContent]);
  const deletePlacementTest = useCallback((item) => deleteContent('placement_tests', item, 'delete placement test'), [deleteContent]);

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
    deletePlacementTest,
  };
};
