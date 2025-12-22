import { SearchX } from "lucide-react";

type NoResultsProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export function NoResults({ title, description, icon }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-12 text-center">
      <div className="flex items-center justify-center mb-4">
        {icon || <SearchX className="size-12 text-ell-primary/50" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
