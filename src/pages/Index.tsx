import { WorkspaceSidebar } from '@/components/sidebar/WorkspaceSidebar';
import { PageEditor } from '@/components/editor/PageEditor';

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <WorkspaceSidebar />
      <PageEditor />
    </div>
  );
};

export default Index;
