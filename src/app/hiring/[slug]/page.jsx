import { notFound } from "next/navigation";
import { getRoleBySlug, getAllRoleSlugs } from "@/data/hiringRoles";
import JobDetailClient from "./JobDetailClient";

export async function generateStaticParams() {
  return getAllRoleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) return { title: "Role Not Found" };

  return {
    title: `${role.title} — Careers`,
    description: role.description.slice(0, 160),
    openGraph: {
      title: `${role.title} at Axile.NG`,
      description: role.description.slice(0, 160),
    },
  };
}

export default async function JobDetailPage({ params }) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);

  if (!role) {
    notFound();
  }

  return <JobDetailClient role={role} />;
}
