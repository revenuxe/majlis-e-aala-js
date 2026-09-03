"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- customer profile tables and metadata are runtime-shaped. */
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button, EmptyState, SectionHeader } from "@/components/ui-kit";

type Props = { section: string };
type Address = {
  id: string;
  label: string;
  address: string;
  area: string;
  city: string;
  pincode: string;
  landmark: string;
};

export default function ProfileSection({ section }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "Venue",
    address: "",
    area: "",
    city: "Bengaluru",
    pincode: "",
    landmark: "",
  });
  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const profile = (user.user_metadata["customer_profile"] ?? {}) as any;
      setName(profile.contact?.name ?? "");
      setPhone(profile.contact?.phone ?? "");
      if (section === "drafts") {
        const { data: row } = await (supabase as any)
          .from("customer_drafts")
          .select("plan, updated_at")
          .eq("user_id", user.id)
          .maybeSingle();
        setDraft(row);
      }
      if (section === "addresses") {
        const { data: rows } = await (supabase as any)
          .from("customer_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setAddresses(rows ?? []);
      }
      setLoading(false);
    })();
  }, [section]);
  if (loading)
    return (
      <main className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </main>
    );
  if (!userId)
    return (
      <main className="mx-auto max-w-[620px] px-5 py-10">
        <EmptyState
          title="Sign in to view this page"
          note="Your account information is available after signing in."
          action={
            <Link href="/profile">
              <Button>Go to Profile</Button>
            </Link>
          }
        />
      </main>
    );
  const saveDetails = async () => {
    const { data: current } = await supabase.auth.getUser();
    const existingProfile = (current.user?.user_metadata["customer_profile"] ?? {}) as Record<
      string,
      unknown
    >;
    const { error } = await supabase.auth.updateUser({
      data: {
        customer_profile: {
          ...existingProfile,
          contact: {
            name,
            phone,
            whatsapp: phone,
            email: current.user?.email ?? "",
          },
        },
      },
    });
    setMessage(error ? error.message : "Personal details saved.");
  };
  const saveAddress = async () => {
    const { error } = await (supabase as any)
      .from("customer_addresses")
      .insert({ user_id: userId, ...form });
    if (error) return setMessage(error.message);
    setAddresses((current) => [{ id: crypto.randomUUID(), ...form }, ...current]);
    setForm({
      label: "Venue",
      address: "",
      area: "",
      city: "Bengaluru",
      pincode: "",
      landmark: "",
    });
    setMessage("Address saved.");
  };
  const content =
    section === "drafts" ? (
      <>
        {draft?.plan ? (
          <div className="rounded-[18px] border border-border bg-card p-5 shadow-card">
            <p className="eyebrow">Saved automatically</p>
            <h2 className="mt-2 font-display text-[26px]">Your catering draft</h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              {draft.plan.guests ?? 0} guests · {draft.plan.date || "Date to be confirmed"}
            </p>
            <Link href="/plan" className="mt-5 inline-block">
              <Button>Continue planning</Button>
            </Link>
          </div>
        ) : (
          <EmptyState
            title="No saved draft yet"
            note="Start a catering plan and we’ll save it here automatically."
            action={
              <Link href="/plan">
                <Button>Plan catering</Button>
              </Link>
            }
          />
        )}
      </>
    ) : section === "addresses" ? (
      <div className="space-y-4">
        <div className="grid gap-3 rounded-[18px] border border-border bg-card p-4">
          {Object.entries(form).map(([key, value]) => (
            <input
              key={key}
              value={value}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={key === "pincode" ? "Pincode" : key[0]!.toUpperCase() + key.slice(1)}
              className="h-11 rounded-[11px] border border-border bg-background px-3 text-[14px] outline-none focus:border-gold"
            />
          ))}
          <Button onClick={() => void saveAddress()}>
            <Plus className="h-4 w-4" /> Save address
          </Button>
        </div>
        {addresses.map((address) => (
          <div key={address.id} className="rounded-[16px] border border-border bg-card p-4">
            <p className="font-semibold">{address.label}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {[address.address, address.area, address.city, address.pincode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        ))}
      </div>
    ) : section === "personal" ? (
      <div className="grid gap-4 rounded-[18px] border border-border bg-card p-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="h-12 rounded-[12px] border border-border px-4 outline-none focus:border-gold"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile number"
          className="h-12 rounded-[12px] border border-border px-4 outline-none focus:border-gold"
        />
        <Button onClick={() => void saveDetails()}>
          <Save className="h-4 w-4" /> Save details
        </Button>
      </div>
    ) : section === "orders" || section === "upcoming" ? (
      <Link href="/orders">
        <Button size="lg">View your orders</Button>
      </Link>
    ) : section === "notifications" ? (
      <EmptyState title="You’re all caught up" note="Booking updates will appear here." />
    ) : section === "support" ? (
      <div className="rounded-[18px] border border-border bg-card p-5">
        <h2 className="font-display text-[25px]">Need a hand?</h2>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Our catering team can help with menus, availability, and changes.
        </p>
        <a className="mt-5 inline-block" href="https://wa.me/919886285028">
          <Button>Chat on WhatsApp</Button>
        </a>
      </div>
    ) : (
      <div className="rounded-[18px] border border-border bg-card p-5 text-[14px] leading-relaxed text-muted-foreground">
        By using Majlise Aala, you agree that every booking is subject to final availability,
        confirmation, and a written quote from our catering team.
      </div>
    );
  const title =
    (
      {
        drafts: "Draft menus",
        addresses: "Saved addresses",
        personal: "Personal details",
        upcoming: "Upcoming events",
        orders: "Past orders",
        notifications: "Notifications",
        support: "Support",
        terms: "Terms",
      } as Record<string, string>
    )[section] ?? "Profile";
  return (
    <main className="mx-auto max-w-[620px] px-5 py-8 pb-32">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold"
      >
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <div className="mt-5">
        <SectionHeader eyebrow="Your account" title={title} />
      </div>
      <div className="mt-6">
        {content}
        {message && <p className="mt-3 text-[13px] text-muted-foreground">{message}</p>}
      </div>
    </main>
  );
}
