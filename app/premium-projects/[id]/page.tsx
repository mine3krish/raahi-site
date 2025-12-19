"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PremiumProjectDetails from "@/components/ui/PremiumProjectDetails";

export default function PremiumProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/premium-projects?id=${id}`);
        const data = await res.json();
        setProject(data.projects?.[0] || null);
      } catch (err) {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-green-600"></div></div>;
  }
  if (!project) {
    return <div className="text-center py-20 text-gray-500">Project not found.</div>;
  }
  return <PremiumProjectDetails project={project} />;
}
