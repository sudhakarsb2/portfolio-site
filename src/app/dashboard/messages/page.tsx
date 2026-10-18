import { MessagesPanel } from "@/components/dashboard/messages-panel";

export const dynamic = "force-dynamic";

export default function DashboardMessagesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Messages</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          Enquiries from the contact form. Reply by email, archive the ones you are handling, and
          delete the noise.
        </p>
      </header>
      <MessagesPanel />
    </div>
  );
}
