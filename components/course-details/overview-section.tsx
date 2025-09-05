import { Check } from "lucide-react";

interface OverviewSectionProps {
  whatYouWillLearn: string[];
  requirements: string[];
  whoIsFor: string[];
  description: string;
}

export const OverviewSection = ({
  whatYouWillLearn = [], // Set a default empty array
  requirements = [],
  whoIsFor = [],
  description,
}: OverviewSectionProps) => (
  <div className="space-y-12">
    {/* --- FIX STARTS HERE --- */}
    {/* We now check if the prop is an array and has items before rendering the list */}
    {Array.isArray(whatYouWillLearn) && whatYouWillLearn.length > 0 && (
      <div>
        <h3 className="text-2xl font-bold mb-6">What you'll learn</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {whatYouWillLearn.map((item, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
    {/* --- FIX ENDS HERE --- */}

    {description && (
      <div>
        <h3 className="text-2xl font-bold mb-4">Course Description</h3>
        <div
          className="prose prose-lg max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    )}

    {/* Added the same safety check for requirements */}
    {Array.isArray(requirements) && requirements.length > 0 && (
      <div>
        <h3 className="text-2xl font-bold mb-4">Requirements</h3>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          {requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Added the same safety check for whoIsFor */}
    {Array.isArray(whoIsFor) && whoIsFor.length > 0 && (
      <div>
        <h3 className="text-2xl font-bold mb-4">Who this course is for</h3>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          {whoIsFor.map((who, index) => (
            <li key={index}>{who}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
