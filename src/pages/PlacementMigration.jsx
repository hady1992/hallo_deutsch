import React from 'react';
import { Helmet } from 'react-helmet';
import PlacementDataMigration from '@/components/PlacementDataMigration';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminGate from '@/components/AdminGate';

const PlacementMigration = () => {
  const navigate = useNavigate();

  return (
    <AdminGate>
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <Helmet>
        <title>{'Data Migration | Hallo Deutsch'}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin')}
          className="text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> العودة للوحة التحكم
        </Button>
      </div>

      <PlacementDataMigration />
    </div>
    </AdminGate>
  );
};

export default PlacementMigration;