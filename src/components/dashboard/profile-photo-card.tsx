"use client";

import { useState } from "react";
import { ProfilePhoto } from "@/components/site/profile-photo";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useToast } from "@/components/ui/kit";

export function ProfilePhotoCard({ initialUrl, name }: { initialUrl: string; name: string }) {
  const { push } = useToast();
  const [url, setUrl] = useState(initialUrl);

  async function save(next: string) {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profilePhoto: next }),
    });
    if (!response.ok) {
      push("We could not save your photo", "error");
      return;
    }
    setUrl(next);
    push("Profile photo updated — it is live on the portfolio");
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-line bg-paper p-6 sm:flex-row sm:items-center">
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-line bg-bone-2">
        <ProfilePhoto src={url} name={name} className="h-full w-full" />
      </div>
      <div>
        <h3 className="font-display text-xl text-ink">Profile photo</h3>
        <p className="mt-1 text-sm text-ink/55">
          Shown in the hero and the about page. A square or portrait photo works best.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ImageUploader label={url ? "Replace photo" : "Upload photo"} maxSize={1200} onUploaded={(next) => void save(next)} />
        </div>
      </div>
    </div>
  );
}
