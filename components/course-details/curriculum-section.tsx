import { PlayCircle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // We'll need the Badge component

// Let's update the interface to potentially include a description
// If your database column is named differently, just change it here.
interface Module {
  id: string;
  name: string;
  description?: string; // Add an optional description field
  duration_minutes?: number;
  is_previewable?: boolean;
}

interface CurriculumSectionProps {
  modules: Module[];
}

export const CurriculumSection = ({ modules = [] }: CurriculumSectionProps) => (
  <div>
    <h3 className="text-2xl font-bold mb-6">Training Content</h3>

    {modules && modules.length > 0 ? (
      // We'll use a styled div container for a cleaner look
      <div className="border rounded-lg overflow-hidden">
        {/* We no longer need the <ul>, we'll map directly to divs for more control */}
        {modules.map((module, index) => (
          <div
            key={module.id}
            // Each module is a flex container with a border bottom
            className="flex items-start gap-x-5 p-4 border-b last:border-b-0 bg-slate-50/50"
          >
            {/* Left side: Icon */}
            <div className="flex-shrink-0 mt-1">
              {module.is_previewable ? (
                <PlayCircle className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-slate-500" />
              )}
            </div>

            {/* Middle section: Title and Description (takes up most space) */}
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-slate-800">
                {`Module ${index + 1}: ${module.name}`}
              </h4>
              {/* This description will only show up if the 'description' field exists */}
              {module.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {module.description}
                </p>
              )}
            </div>

            {/* Right side: Duration and Preview Badge */}
            <div className="flex flex-col items-end space-y-1 flex-shrink-0">
              {module.duration_minutes && (
                <span className="text-sm font-medium text-slate-600">
                  {module.duration_minutes} min
                </span>
              )}
              {module.is_previewable && (
                <Badge
                  variant="outline"
                  className="text-primary border-primary"
                >
                  Preview
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground">
        No training content has been added yet.
      </p>
    )}
  </div>
);
