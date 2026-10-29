"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, RotateCcw, Save, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type ProfileUser = {
  name?: string | null;
  image?: string | null;
  location?: string | null;
  nationality?: string | null;
};

// Max edge (px) for an uploaded avatar. Keeps the stored base64 small so the
// MongoDB user document stays light while the photo stays sharp on screens.
const MAX_EDGE = 512;

/** Read a picked file, downscale it on a canvas, and return a JPEG data URL. */
const readAndResize = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load that image."));
      img.onload = () => {
        const scale = Math.min(
          1,
          MAX_EDGE / Math.max(img.width, img.height),
        );
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Image processing is not supported here."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

const EditProfileDialog = ({
  user,
  trigger,
  triggerClassName,
}: {
  user: ProfileUser;
  trigger: React.ReactNode;
  triggerClassName?: string;
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: user.name ?? "",
    image: user.image ?? "",
    location: user.location ?? "",
    nationality: user.nationality ?? "",
  });

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Allow picking the same file again later.
    event.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await readAndResize(file);
      update("image", dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use that image.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error } = await authClient.updateUser({
      name: form.name,
      image: form.image || null,
      // The client type can't see the server's `user.additionalFields`
      // (location/nationality) — they're validated server-side in auth.ts.
      ...( {
        location: form.location,
        nationality: form.nationality,
      } as Record<string, string> ),
    });

    setPending(false);

    if (error) {
      setError(error.message ?? "Could not update your profile.");
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className={
              triggerClassName ?? "w-full bg-[#00A8E8] text-white hover:bg-[#0095d1]"
            }
          />
        }
      >
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal details and travel preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              required
            />
          </div>

          {/* Avatar: upload from device or paste a URL */}
          <div className="grid gap-2">
            <Label htmlFor="image">Profile Photo</Label>
            <div className="flex items-center gap-4">
              {/* Live preview */}
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt="Profile preview"
                  className="size-16 shrink-0 rounded-full border border-border object-cover"
                />
              ) : (
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Camera className="size-6" aria-hidden="true" />
                </span>
              )}

              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="size-4" aria-hidden="true" />
                  Upload from Device
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG or PNG — resized automatically.
                </p>
              </div>
            </div>

            <div className="mt-2 grid gap-2">
              <Label htmlFor="image" className="text-muted-foreground">
                or paste an image URL
              </Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={
                  form.image.startsWith("data:") ? "" : form.image
                }
                onChange={(event) => update("image", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="San Francisco, CA"
                value={form.location}
                onChange={(event) => update("location", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                placeholder="United States"
                value={form.nationality}
                onChange={(event) =>
                  update("nationality", event.target.value)
                }
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm({
                  name: user.name ?? "",
                  image: user.image ?? "",
                  location: user.location ?? "",
                  nationality: user.nationality ?? "",
                });
                setError(null);
                setOpen(false);
              }}
              className="border-destructive/30 bg-background text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              <RotateCcw />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-[#00A8E8] text-white hover:bg-[#0095d1]"
            >
              <Save />
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
