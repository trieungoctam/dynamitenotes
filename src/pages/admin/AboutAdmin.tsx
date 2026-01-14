/**
 * AboutAdmin - Admin page for editing about page content
 */

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AboutEditForm } from "@/components/admin/AboutEditForm";
import { useAdminAbout, useUpdateAbout } from "@/hooks/use-admin-about";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AboutAdmin() {
  const { data: aboutData, isLoading } = useAdminAbout();
  const updateAbout = useUpdateAbout();

  const handleSubmit = async (data: Parameters<typeof updateAbout.mutateAsync>[0]) => {
    try {
      await updateAbout.mutateAsync(data);
      toast.success("About page updated successfully");
    } catch (error) {
      console.error("Failed to update about:", error);
      toast.error("Failed to update about page");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold">About Page</h1>
          <p className="text-muted-foreground">
            Edit your bio, principles, social links, and resume header
          </p>
        </div>

        <AboutEditForm
          data={aboutData}
          onSubmit={handleSubmit}
          isLoading={updateAbout.isPending}
        />
      </div>
    </AdminLayout>
  );
}
