import { lazy, Suspense, memo } from "react";
import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Award } from "lucide-react";

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

const iconCache = new Map<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>>();

const getIconComponent = (name: string) => {
  const lowerName = name.toLowerCase().replace(/([A-Z])/g, (match, p1, offset) => 
    offset > 0 ? `-${p1.toLowerCase()}` : p1.toLowerCase()
  );
  
  if (iconCache.has(lowerName)) {
    return iconCache.get(lowerName)!;
  }
  
  if (lowerName in dynamicIconImports) {
    const component = lazy(dynamicIconImports[lowerName as keyof typeof dynamicIconImports]);
    iconCache.set(lowerName, component);
    return component;
  }
  
  return null;
};

export const DynamicIcon = memo(({ name, ...props }: DynamicIconProps) => {
  const IconComponent = getIconComponent(name);
  
  if (!IconComponent) {
    return <Award {...props} />;
  }
  
  return (
    <Suspense fallback={<Award {...props} />}>
      <IconComponent {...props} />
    </Suspense>
  );
});

DynamicIcon.displayName = "DynamicIcon";
