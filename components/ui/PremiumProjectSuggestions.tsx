import PremiumProjectCard from "./PremiumProjectCard";

export default function PremiumProjectSuggestions({ suggestions }: { suggestions: any[] }) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="max-w-4xl mx-auto mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4">You may also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((project) => (
          <PremiumProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  );
}
