import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[AppErrorBoundary] Unhandled render error:', error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-24">
        <section className="mx-auto max-w-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">تعذر عرض هذه الصفحة</h1>
          <p className="mt-3 text-slate-600">
            حدث خطأ غير متوقع في جزء من المحتوى. يمكنك المحاولة مجددًا أو العودة إلى الصفحة الرئيسية.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={this.handleRetry} className="bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">
              المحاولة مجددًا
            </button>
            <button type="button" onClick={() => window.location.assign('/')} className="border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
              الصفحة الرئيسية
            </button>
            <button type="button" onClick={() => window.location.reload()} className="border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
              إعادة تحميل الصفحة
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre dir="ltr" className="mt-6 max-h-48 overflow-auto bg-slate-950 p-4 text-left text-xs text-red-200">
              {error?.stack || error?.message || String(error)}
            </pre>
          )}
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
