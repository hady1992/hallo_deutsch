import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const normalizeAdminEmail = (value = '') => value.trim().toLowerCase();

// مهم قبل النشر: استبدل البريد أدناه ببريد حساب إداري موجود فعليًا في
// Supabase Authentication > Users. يجب أن يطابق البريد هنا بريد مستخدم Supabase
// بعد تطبيق trim + lowercase. لا تضع كلمة مرور أو أي سر داخل الكود.
export const ADMIN_EMAILS = [
  'hady19923@gmail.com',
].map(normalizeAdminEmail).filter(Boolean);

export const isAuthorizedAdminEmail = (email) => (
  ADMIN_EMAILS.includes(normalizeAdminEmail(email))
);

/**
 * بوابة حماية لصفحات الإدارة (/admin و /migration).
 * تمنع عرض أي محتوى إداري قبل التحقق من تسجيل دخول حقيقي عبر Supabase
 * وأن بريد المستخدم ضمن القائمة المصرّح لها بالضبط.
 *
 * ملاحظة أمنية: هذا تحقق على مستوى الواجهة (Frontend) فقط، وهو ضروري
 * لكنه غير كافٍ بمفرده. يجب أيضًا تفعيل سياسات Row Level Security (RLS)
 * في لوحة تحكم Supabase على كل الجداول التي تُعدَّل من هذه الصفحة، بحيث
 * تُمنع عمليات الكتابة/الحذف من أي حساب لا يطابق هذه الأذونات على مستوى
 * الخادم أيضًا — لأن أي شخص يفهم الكود يمكنه تجاوز التحقق في المتصفح وحده.
 */
const AdminGate = ({ children }) => {
  const { user, loading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAuthorizedAdmin = !!user && isAuthorizedAdminEmail(user.email);

  useEffect(() => {
    // إبقاء العلَم القديم (isAdmin) متوافقًا مع حالة الدخول الحقيقية، حتى تستمر
    // عناصر الواجهة الأخرى التي تعتمد عليه (مثل تبويبات الإدارة داخل صفحة الأطفال
    // وزر لوحة التحكم في القائمة العلوية) بالعمل، لكن الآن بناءً على دخول حقيقي
    // وليس قيمة يمكن لأي زائر كتابتها يدويًا.
    localStorage.setItem('isAdmin', isAuthorizedAdmin ? 'true' : 'false');
  }, [isAuthorizedAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: signInError } = await signIn(normalizeAdminEmail(email), password);
    setSubmitting(false);
    if (signInError) {
      setError('فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  // مستخدم سجّل دخول لكنه ليس من ضمن قائمة المدراء المصرّح لهم
  if (user && !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-sm w-full text-center bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <ShieldAlert className="mx-auto text-red-500 mb-4" size={40} />
          <h1 className="text-xl font-black text-slate-800 mb-2">ليست لديك صلاحية الوصول</h1>
          <p className="text-slate-500 mb-6">هذا الحساب غير مُصرَّح له بدخول لوحة التحكم.</p>
          <Button variant="outline" onClick={signOut}>تسجيل الخروج</Button>
        </div>
      </div>
    );
  }

  // لا يوجد مستخدم مسجّل دخول إطلاقًا → عرض شاشة تسجيل الدخول
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50" dir="rtl">
        <form
          onSubmit={handleSubmit}
          className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 border border-slate-100 space-y-4"
        >
          <div className="text-center mb-2">
            <ShieldAlert className="mx-auto text-slate-700 mb-3" size={36} />
            <h1 className="text-xl font-black text-slate-800">دخول لوحة التحكم</h1>
            <p className="text-slate-500 text-sm mt-1">هذه الصفحة مخصصة للإدارة فقط</p>
          </div>

          <div className="space-y-2 text-right">
            <Label htmlFor="admin-email">البريد الإلكتروني</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2 text-right">
            <Label htmlFor="admin-password">كلمة المرور</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-red-600 text-sm font-bold text-center">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full font-bold">
            {submitting ? 'جارٍ الدخول...' : 'دخول'}
          </Button>
        </form>
      </div>
    );
  }

  // مستخدم حقيقي ومُصرَّح له → عرض المحتوى الإداري
  return children;
};

export default AdminGate;
