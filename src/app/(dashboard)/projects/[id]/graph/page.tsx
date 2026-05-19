import { redirect } from "next/navigation";

export default async function ProjectGraphRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/knowledge-graph");
}
