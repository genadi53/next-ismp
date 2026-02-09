import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/cn";

type ContainerProps = {
  title: string;
  description?: string;
  noMaxWidth?: boolean;
  headerChildren?: React.ReactNode;
  children: React.ReactNode;
};

export const Container = ({
  title,
  description,
  headerChildren,
  noMaxWidth,
  children,
}: ContainerProps) => {
  return (
    <div
      className={cn(
        "mx-auto space-y-6 py-6",
        noMaxWidth ? "w-full" : "container"
      )}
    >
      <div
        className={cn(
          "flex flex-row items-center justify-between",
          noMaxWidth && "px-12 mx-auto"
        )}
      >
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl text-ell-primary font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        {headerChildren}
      </div>

      <Separator orientation="horizontal" className="h-[8px]" />
      {children}
    </div>
  );
};
