import BackButton from "@/components/BackButton";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  rightContent?: React.ReactNode;
}

const PageHeader = ({ title, backTo = "/", rightContent }: PageHeaderProps) => {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton to={backTo} />
          <h1 className="text-2xl md:text-3xl font-baloo text-foreground">
            {title}
          </h1>
        </div>
        {rightContent && (
          <div className="flex items-center gap-4">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
