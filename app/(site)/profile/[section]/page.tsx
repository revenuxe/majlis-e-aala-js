import ProfileSection from "@/routes/profile-section";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <ProfileSection section={section} />;
}
