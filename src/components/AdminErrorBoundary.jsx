import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin panel component failed:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto my-8 max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm" dir="rtl">
        <AlertTriangle className="mx-auto mb-3 text-red-500" size={36} />
        <h2 className="text-xl font-black text-slate-900">تعذر عرض هذا الجزء من لوحة التحكم</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
          حدث خطأ أثناء قراءة بيانات محفوظة قديمة. بقيت بقية بياناتك محفوظة ويمكنك المحاولة مجددًا.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Button type="button" onClick={this.handleRetry} className="gap-2">
            <RefreshCw size={16} />
            إعادة المحاولة
          </Button>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            إعادة تحميل الصفحة
          </Button>
        </div>
      </div>
    );
  }
}

export default AdminErrorBoundary;
