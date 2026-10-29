"use client";

import { useState } from "react";
import { PackageCheck, Trash2 } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const categories = ["Beach", "Mountain", "City", "Adventure", "Cultural"];

const initialForm = {
  destinationName: "",
  country: "",
  category: "",
  price: "",
  duration: "",
  departureDate: "",
  imageUrl: "",
  description: "",
};

export default function AddDestinationPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [form, setForm] = useState(initialForm);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const token = await getTokenFromClient();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/add-destination`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message ?? "Failed to add the destination.");
      }

      setForm(initialForm);
      router.push("/destinations");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setPending(false);
    }
  };

  if (!session) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <h1 className="text-3xl font-light tracking-tight">
          Login to add a destination
        </h1>
        <p className="text-sm text-muted-foreground">
          You need an account to publish a travel package.
        </p>
        <Link href="/login">
          <Button className="bg-[#00A8E8] text-white hover:bg-[#0095d1]">
            Go to Login
          </Button>
        </Link>
      </main>
    );
  }



  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-light tracking-tight text-foreground md:text-5xl">
          Add New Travel Package
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-sm border border-border bg-white p-8 shadow-sm"
        >
          <div className="grid gap-5">
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
                onChange={(event) =>
                  update("departureDate", event.target.value)
                }
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
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4">
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
                  setForm(initialForm);
                  setError(null);
                }}
                className="border-destructive/30 bg-background text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                <Trash2 />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="bg-[#00A8E8] text-white hover:bg-[#0095d1]"
              >
                <PackageCheck />
                {pending ? "Adding..." : "Add Travel Package"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
