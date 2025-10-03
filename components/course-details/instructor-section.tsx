import Image from "next/image";
import {
  Star,
  Award,
  Users,
  CheckCircle,
  Linkedin,
  Twitter,
  Globe,
  // --- Import the new icons ---
  Instagram,
  Youtube,
  Facebook,
} from "lucide-react";

// --- Expand the Instructor interface to include the new social platforms ---
interface Instructor {
  name: string;
  title: string;
  bio: string;
  experience: string;
  instructor_rating: number;
  total_students: number;
  image_url: string;
  specialties?: string[];
  certifications?: string[];
  achievements?: string[];
  social_media?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    // --- Add the new optional fields ---
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
}

// Helper component for rendering social media links with icons
const SocialLink = ({ platform, url }: { platform: string; url: string }) => {
  // --- Add the new icons to our icon map ---
  const icons: { [key: string]: React.ReactNode } = {
    linkedin: <Linkedin className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    website: <Globe className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors"
      aria-label={`Link to ${platform}`}
    >
      {icons[platform] || <Globe className="h-5 w-5" />}
    </a>
  );
};

export const InstructorSection = ({
  instructor,
}: {
  instructor: Instructor | null;
}) => {
  if (!instructor) {
    return (
      <div>
        <h3 className="text-2xl font-bold mb-6">Instructor</h3>
        <p className="text-muted-foreground">No instructor assigned yet.</p>
      </div>
    );
  }

  const hasSocials =
    instructor.social_media &&
    Object.values(instructor.social_media).some((link) => link);

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">About the Instructor</h3>
      <div className="flex flex-col sm:flex-row items-start gap-8">
        <Image
          src={instructor.image_url || "/placeholder.svg"}
          alt={instructor.name}
          width={140}
          height={140}
          className="rounded-full flex-shrink-0 shadow-lg border-4 border-white"
        />
        <div className="space-y-6 flex-1">
          <div>
            <h4 className="text-3xl font-bold text-slate-800">
              {instructor.name}
            </h4>
            <p className="text-lg text-custom-copper font-medium">
              {instructor.title}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {/* <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500" />
              <span>{instructor.instructor_rating} Instructor Rating</span>
            </div> */}
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-slate-500" />
              <span>{instructor.experience}</span>
            </div>
            {/* <div className="flex items-center gap-1.5">
              <Users className="h-4 w-5" />
              <span>
                {instructor.total_students?.toLocaleString()} Students
              </span>
            </div> */}
          </div>
          <div className="prose max-w-none text-muted-foreground">
            <p>{instructor.bio}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {instructor.specialties && instructor.specialties.length > 0 && (
          <div className="space-y-4">
            <h5 className="text-xl font-bold text-slate-800 border-b-2 border-primary pb-2">
              Specialties
            </h5>
            <ul className="space-y-2">
              {instructor.specialties.map((spec, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(instructor.achievements?.length || 0) > 0 ||
        (instructor.certifications?.length || 0) > 0 ? (
          <div className="space-y-4">
            <h5 className="text-xl font-bold text-slate-800 border-b-2 border-primary pb-2">
              Achievements & Certifications
            </h5>
            <ul className="space-y-2">
              {instructor.achievements?.map((ach, index) => (
                <li key={`ach-${index}`} className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-custom-copper flex-shrink-0" />
                  <span className="text-muted-foreground">{ach}</span>
                </li>
              ))}
              {instructor.certifications?.map((cert, index) => (
                <li key={`cert-${index}`} className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {hasSocials && (
        <div className="mt-12">
          <h5 className="text-xl font-bold text-slate-800">
            Connect with {instructor.name}
          </h5>
          <div className="flex items-center gap-4 mt-4">
            {/* This code automatically handles the new icons without changes! */}
            {Object.entries(instructor.social_media!).map(([platform, url]) =>
              url ? (
                <SocialLink key={platform} platform={platform} url={url} />
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
};
