"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, PackageCheck, RotateCcw } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IDestination } from "@/lib/types/destinations";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { authClient } from "@/lib/auth-client";

const categories = ["Beach", "Mountain", "City", "Adventure", "Cultural"];

const EditDestinationDialog = ({
  destination,
}: {
  destination: IDestination;
}) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(destination);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      // _id is dropped on purpose: it lives in the URL, not in the request body
      const { _id, ...updatedData } = form;
      void _id;

      const token = await getTokenFromClient();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/destination/${destination._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to update the destination.");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setPending(false);
    }
  };

  if (!session?.user) {
    return (
      <Button render={<Link href="/login" />} nativeButton={false} variant="outline">
        Login to Edit
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Pencil />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:min-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Destination</DialogTitle>
          <DialogDescription>
            Update the details of this travel package.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          {/* Destination Name */}
          <div className="grid gap-2">
            <Label htmlFor="destinationName">Destination Name</Label>
            <Input
              id="destinationName"
              placeholder="Bali Paradise"
              value={form.destinationName}
              onChange={(event) =>
                update("destinationName", event.target.value)
              }
              required
            />
          </div>

          {/* Country + Category */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Indonesia"
                value={form.country}
                onChange={(event) => update("country", event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => update("category", value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Beach" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price + Duration */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 1299"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                required
                min="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 7 Days/6 Nights"
                value={form.duration}
                onChange={(event) => update("duration", event.target.value)}
                required
              />
            </div>
          </div>

          {/* Departure Date */}
          <div className="grid gap-2">
            <Label htmlFor="departureDate">Departure Date</Label>
            <Input
              id="departureDate"
              type="date"
              value={form.departureDate}
              onChange={(event) => update("departureDate", event.target.value)}
              required
            />
          </div>

          {/* Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={(event) => update("imageUrl", event.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the travel experience..."
              className="min-h-36"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(destination);
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
              <PackageCheck />
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDestinationDialog;
