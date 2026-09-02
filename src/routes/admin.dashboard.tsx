import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  Layers,
  ListPlus,
  Loader2,
  LogOut,
  Package as PackageIcon,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button, cx } from "@/components/ui-kit";
import {
  EmptyRow,
  Field,
  ImageField,
  Select,
  Sheet,
  StatCard,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/AdminUI";
import {
  inr,
  isCurrentUserAdmin,
  ORDER_STATUSES,
  slugify,
  type CategoryRow,
  type MenuItemRow,
  type OrderRow,
  type PackageRow,
  type SectionItemRow,
  type SectionRow,
} from "@/lib/admin";
import { BrandMark } from "@/components/Brand";

export const Route = createFileRoute("/admin/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Majlise Aala" },
      {
        name: "description",
        content: "Manage catering packages, menus and enquiries for Majlise Aala.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Dashboard — Majlise Aala" },
      {
        property: "og:description",
        content: "Manage catering packages, menus and enquiries for Majlise Aala.",
      },
    ],
  }),
  component: AdminDashboard,
});

type MainTab = "dashboard" | "orders" | "listings";
type ListTab = "packages" | "categories" | "menu";

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<MainTab>("dashboard");
  const [listTab, setListTab] = useState<ListTab>("packages");

  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [sectionItems, setSectionItems] = useState<SectionItemRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, s, si, c, m, o] = await Promise.all([
      supabase.from("packages").select("*").order("sort_order"),
      supabase.from("package_sections").select("*").order("sort_order"),
      supabase.from("package_section_items").select("*").order("sort_order"),
      supabase.from("menu_categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setPackages((p.data ?? []) as PackageRow[]);
    setSections((s.data ?? []) as SectionRow[]);
    setSectionItems((si.data ?? []) as SectionItemRow[]);
    setCategories((c.data ?? []) as CategoryRow[]);
    setMenuItems((m.data ?? []) as MenuItemRow[]);
    setOrders((o.data ?? []) as OrderRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void (async () => {
      if (!(await isCurrentUserAdmin())) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      setReady(true);
      await load();
    })();
  }, [navigate, load]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const newOrders = orders.filter((o) => o.status === "new").length;
  const pipeline = orders.reduce((sum, o) => sum + Number(o.estimated_total || 0), 0);
  const guests = orders.reduce((sum, o) => sum + (o.guests || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark size={40} />
            <div className="min-w-0">
              <p className="truncate font-display text-[19px] leading-tight">Admin Console</p>
              <p className="truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Majlise Aala
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login", replace: true });
            }}
            className="press inline-flex shrink-0 items-center gap-2 rounded-[12px] border border-border bg-card px-3.5 py-2.5 text-[13px] font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <nav className="mx-auto hidden max-w-[1200px] gap-1 px-6 pb-2 lg:flex">
          {(
            [
              ["dashboard", "Dashboard", <BarChart3 key="a" className="h-4 w-4" />],
              ["orders", "Orders", <ClipboardList key="b" className="h-4 w-4" />],
              ["listings", "Listings", <Layers key="c" className="h-4 w-4" />],
            ] as const
          ).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cx(
                "press inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition-colors",
                tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface",
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : tab === "dashboard" ? (
          <section className="space-y-6">
            <div>
              <p className="eyebrow">Overview</p>
              <h1 className="mt-1 font-display text-[30px] leading-tight sm:text-[38px]">
                Today at a glance
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="New enquiries"
                value={String(newOrders)}
                sub={`${orders.length} total`}
                icon={<ClipboardList className="h-4 w-4" />}
              />
              <StatCard
                label="Pipeline"
                value={inr(pipeline)}
                sub="Estimated value"
                icon={<Wallet className="h-4 w-4" />}
              />
              <StatCard
                label="Guests"
                value={String(guests)}
                sub="Across all enquiries"
                icon={<Users className="h-4 w-4" />}
              />
              <StatCard
                label="Listings"
                value={`${packages.length}/${menuItems.length}`}
                sub="Packages / dishes"
                icon={<PackageIcon className="h-4 w-4" />}
              />
            </div>

            <div className="rounded-[20px] border border-border bg-card p-4 shadow-card sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-[22px]">Latest enquiries</h2>
                <button
                  onClick={() => setTab("orders")}
                  className="press text-[13px] font-semibold text-gold"
                >
                  View all
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {orders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-border bg-surface/60 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold">{o.customer_name}</p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {o.occasion ?? "Event"} • {o.guests} guests
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-champagne px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]">
                      {o.status}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && <EmptyRow text="No enquiries yet." />}
              </div>
            </div>
          </section>
        ) : tab === "orders" ? (
          <OrdersPanel orders={orders} packages={packages} onChanged={load} />
        ) : (
          <section className="space-y-5">
            <div>
              <p className="eyebrow">Listings</p>
              <h1 className="mt-1 font-display text-[30px] leading-tight sm:text-[38px]">
                Packages & menus
              </h1>
            </div>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {(
                [
                  ["packages", "Packages"],
                  ["categories", "Categories"],
                  ["menu", "Menu Items"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setListTab(key)}
                  className={cx(
                    "press shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-colors",
                    listTab === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {listTab === "packages" && (
              <PackagesPanel
                packages={packages}
                sections={sections}
                sectionItems={sectionItems}
                onChanged={load}
              />
            )}
            {listTab === "categories" && (
              <CategoriesPanel categories={categories} onChanged={load} />
            )}
            {listTab === "menu" && (
              <MenuPanel items={menuItems} categories={categories} onChanged={load} />
            )}
          </section>
        )}
      </main>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-3">
          {(
            [
              ["dashboard", "Dashboard", <BarChart3 key="a" className="h-5 w-5" />],
              ["orders", "Orders", <ClipboardList key="b" className="h-5 w-5" />],
              ["listings", "Listings", <Layers key="c" className="h-5 w-5" />],
            ] as const
          ).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cx(
                "flex flex-col items-center gap-1 py-3 text-[11px] font-semibold",
                tab === key ? "text-foreground" : "text-muted-text",
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ------------------------------- Orders ------------------------------- */

function OrdersPanel({
  orders,
  packages,
  onChanged,
}: {
  orders: OrderRow[];
  packages: PackageRow[];
  onChanged: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<string>("all");
  const shown = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    await onChanged();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Enquiry deleted");
    await onChanged();
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="eyebrow">Enquiries</p>
        <h1 className="mt-1 font-display text-[30px] leading-tight sm:text-[38px]">Orders</h1>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {["all", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cx(
              "press shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold capitalize",
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map((o) => (
          <article key={o.id} className="rounded-[18px] border border-border bg-card p-4 shadow-card">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-[21px] leading-tight">
                  {o.customer_name}
                </h3>
                <p className="mt-1 truncate text-[13px] text-muted-foreground">
                  {o.phone}
                  {o.email ? ` • ${o.email}` : ""}
                </p>
              </div>
              <p className="shrink-0 font-display text-[20px]">{inr(Number(o.estimated_total))}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-muted-foreground">
              <span className="rounded-full bg-surface px-3 py-1">{o.occasion ?? "Event"}</span>
              <span className="rounded-full bg-surface px-3 py-1">{o.guests} guests</span>
              {o.event_date && (
                <span className="rounded-full bg-surface px-3 py-1">{o.event_date}</span>
              )}
              {o.package_id && (
                <span className="rounded-full bg-surface px-3 py-1">
                  {packages.find((p) => p.id === o.package_id)?.name ?? "Package"}
                </span>
              )}
            </div>
            {o.notes && <p className="mt-3 text-[13px] text-muted-foreground">{o.notes}</p>}
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Select value={o.status} onChange={(e) => void setStatus(o.id, e.target.value)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <button
                onClick={() => void remove(o.id)}
                className="press grid w-[52px] place-items-center rounded-[12px] border border-border text-destructive"
                aria-label="Delete enquiry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
        {shown.length === 0 && <EmptyRow text="No enquiries in this view." />}
      </div>
    </section>
  );
}

/* ------------------------------ Packages ------------------------------ */

type DraftSection = { id?: string; title: string; items: { id?: string; label: string }[] };

function PackagesPanel({
  packages,
  sections,
  sectionItems,
  onChanged,
}: {
  packages: PackageRow[];
  sections: SectionRow[];
  sectionItems: SectionItemRow[];
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PackageRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState("100000");
  const [guestsPerMann, setGuestsPerMann] = useState("100");
  const [image, setImage] = useState("");
  const [signature, setSignature] = useState(false);
  const [active, setActive] = useState(true);
  const [draft, setDraft] = useState<DraftSection[]>([]);

  function openNew() {
    setEditing(null);
    setName("");
    setTagline("");
    setPrice("100000");
    setGuestsPerMann("100");
    setImage("");
    setSignature(false);
    setActive(true);
    setDraft([{ title: "Welcome Drink", items: [{ label: "" }] }]);
    setOpen(true);
  }

  function openEdit(pkg: PackageRow) {
    setEditing(pkg);
    setName(pkg.name);
    setTagline(pkg.tagline);
    setPrice(String(pkg.price_per_mann));
    setGuestsPerMann(String(pkg.guests_per_mann));
    setImage(pkg.image_url ?? "");
    setSignature(pkg.signature);
    setActive(pkg.is_active);
    setDraft(
      sections
        .filter((s) => s.package_id === pkg.id)
        .map((s) => ({
          id: s.id,
          title: s.title,
          items: sectionItems
            .filter((i) => i.section_id === s.id)
            .map((i) => ({ id: i.id, label: i.label })),
        })),
    );
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return toast.error("Package name is required");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: editing?.slug ?? slugify(name),
        tagline: tagline.trim(),
        price_per_mann: Number(price) || 0,
        guests_per_mann: Number(guestsPerMann) || 100,
        image_url: image || null,
        signature,
        is_active: active,
        sort_order: editing?.sort_order ?? packages.length,
      };

      let packageId = editing?.id;
      if (editing) {
        const { error } = await supabase.from("packages").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("packages").insert(payload).select("id").single();
        if (error) throw error;
        packageId = data.id;
      }
      if (!packageId) throw new Error("Missing package id");

      // Replace sections + items with the current draft (simple and predictable).
      await supabase.from("package_sections").delete().eq("package_id", packageId);
      for (const [index, section] of draft.entries()) {
        if (!section.title.trim()) continue;
        const { data: sec, error: secError } = await supabase
          .from("package_sections")
          .insert({ package_id: packageId, title: section.title.trim(), sort_order: index })
          .select("id")
          .single();
        if (secError) throw secError;
        const rows = section.items
          .map((i, idx) => ({ section_id: sec.id, label: i.label.trim(), sort_order: idx }))
          .filter((r) => r.label);
        if (rows.length) {
          const { error: itemError } = await supabase.from("package_section_items").insert(rows);
          if (itemError) throw itemError;
        }
      }
      toast.success(editing ? "Package updated" : "Package created");
      setOpen(false);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save package");
    } finally {
      setSaving(false);
    }
  }

  async function remove(pkg: PackageRow) {
    const { error } = await supabase.from("packages").delete().eq("id", pkg.id);
    if (error) return toast.error(error.message);
    toast.success("Package deleted");
    await onChanged();
  }

  return (
    <div className="space-y-4">
      <Button onClick={openNew} full className="sm:w-auto">
        <Plus className="h-4 w-4" /> New package
      </Button>

      <div className="grid gap-3 lg:grid-cols-2">
        {packages.map((pkg) => {
          const secs = sections.filter((s) => s.package_id === pkg.id);
          return (
            <article
              key={pkg.id}
              className="overflow-hidden rounded-[20px] border border-border bg-card shadow-card"
            >
              {pkg.image_url && (
                <img
                  src={pkg.image_url}
                  alt={pkg.name}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[22px] leading-tight">{pkg.name}</h3>
                    <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                      {pkg.tagline}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-[20px]">{inr(Number(pkg.price_per_mann))}</p>
                    <p className="text-[11px] text-muted-foreground">
                      per Mann • {pkg.guests_per_mann} guests
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {secs.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full bg-surface px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {s.title}
                    </span>
                  ))}
                  {!pkg.is_active && (
                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] text-destructive">
                      Hidden
                    </span>
                  )}
                  {pkg.signature && (
                    <span className="rounded-full bg-champagne px-2.5 py-1 text-[11px]">
                      Signature
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="press inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-border py-2.5 text-[13px] font-semibold"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => void remove(pkg)}
                    className="press grid w-[52px] place-items-center rounded-[12px] border border-border text-destructive"
                    aria-label="Delete package"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {packages.length === 0 && <EmptyRow text="No packages yet. Create your first one." />}
      </div>

      <Sheet
        open={open}
        title={editing ? "Edit package" : "New package"}
        onClose={() => setOpen(false)}
        footer={
          <Button full size="lg" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Save package"}
          </Button>
        }
      >
        <div className="space-y-4">
          <Field label="Package name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Royal Package" />
          </Field>
          <Field label="Tagline">
            <TextArea
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Our flagship feast — the fullest spread we serve."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price per Mann (₹)">
              <TextInput
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </Field>
            <Field label="Guests per Mann">
              <TextInput
                inputMode="numeric"
                value={guestsPerMann}
                onChange={(e) => setGuestsPerMann(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </Field>
          </div>
          <Field label="Cover image">
            <ImageField value={image} onChange={setImage} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Toggle checked={signature} onChange={setSignature} label="Signature package" />
            <Toggle checked={active} onChange={setActive} label="Visible on website" />
          </div>

          <div className="rounded-[16px] border border-border bg-surface/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Menu sections
              </p>
              <button
                onClick={() => setDraft((d) => [...d, { title: "", items: [{ label: "" }] }])}
                className="press inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-3 py-2 text-[12px] font-semibold text-primary-foreground"
              >
                <ListPlus className="h-3.5 w-3.5" /> Section
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {draft.map((section, si) => (
                <div key={si} className="rounded-[14px] border border-border bg-card p-3">
                  <div className="flex gap-2">
                    <TextInput
                      value={section.title}
                      placeholder="Welcome Drink / Starter / Biryani…"
                      onChange={(e) =>
                        setDraft((d) =>
                          d.map((s, i) => (i === si ? { ...s, title: e.target.value } : s)),
                        )
                      }
                    />
                    <button
                      onClick={() => setDraft((d) => d.filter((_, i) => i !== si))}
                      className="press grid w-[46px] shrink-0 place-items-center rounded-[12px] border border-border text-destructive"
                      aria-label="Remove section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex gap-2">
                        <TextInput
                          value={item.label}
                          placeholder="Mutton Biryani"
                          onChange={(e) =>
                            setDraft((d) =>
                              d.map((s, i) =>
                                i === si
                                  ? {
                                      ...s,
                                      items: s.items.map((it, j) =>
                                        j === ii ? { ...it, label: e.target.value } : it,
                                      ),
                                    }
                                  : s,
                              ),
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            setDraft((d) =>
                              d.map((s, i) =>
                                i === si
                                  ? { ...s, items: s.items.filter((_, j) => j !== ii) }
                                  : s,
                              ),
                            )
                          }
                          className="press grid w-[46px] shrink-0 place-items-center rounded-[12px] border border-border text-muted-foreground"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setDraft((d) =>
                          d.map((s, i) =>
                            i === si ? { ...s, items: [...s.items, { label: "" }] } : s,
                          ),
                        )
                      }
                      className="press inline-flex items-center gap-1.5 rounded-[10px] bg-surface px-3 py-2 text-[12px] font-semibold text-gold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add item
                    </button>
                  </div>
                </div>
              ))}
              {draft.length === 0 && (
                <p className="py-4 text-center text-[13px] text-muted-foreground">
                  Add sections like Welcome Drink, Starter, Main Course, Biryani, Desserts.
                </p>
              )}
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

/* ----------------------------- Categories ----------------------------- */

function CategoriesPanel({
  categories,
  onChanged,
}: {
  categories: CategoryRow[];
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing(null);
    setName("");
    setImage("");
    setActive(true);
    setOpen(true);
  }

  function openEdit(row: CategoryRow) {
    setEditing(row);
    setName(row.name);
    setImage(row.image_url ?? "");
    setActive(row.is_active);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return toast.error("Category name is required");
    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: editing?.slug ?? slugify(name),
      image_url: image || null,
      is_active: active,
      sort_order: editing?.sort_order ?? categories.length,
    };
    const { error } = editing
      ? await supabase.from("menu_categories").update(payload).eq("id", editing.id)
      : await supabase.from("menu_categories").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Category updated" : "Category created");
    setOpen(false);
    await onChanged();
  }

  return (
    <div className="space-y-4">
      <Button onClick={openNew} full className="sm:w-auto">
        <Plus className="h-4 w-4" /> New category
      </Button>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <article
            key={c.id}
            className="overflow-hidden rounded-[18px] border border-border bg-card shadow-card"
          >
            {c.image_url && (
              <img src={c.image_url} alt={c.name} className="h-28 w-full object-cover" loading="lazy" />
            )}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-4">
              <div className="min-w-0">
                <p className="truncate font-display text-[19px]">{c.name}</p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {c.is_active ? "Visible" : "Hidden"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => openEdit(c)}
                  className="press grid h-10 w-10 place-items-center rounded-[10px] border border-border"
                  aria-label="Edit category"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    const { error } = await supabase.from("menu_categories").delete().eq("id", c.id);
                    if (error) return toast.error(error.message);
                    toast.success("Category deleted");
                    await onChanged();
                  }}
                  className="press grid h-10 w-10 place-items-center rounded-[10px] border border-border text-destructive"
                  aria-label="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
        {categories.length === 0 && <EmptyRow text="No categories yet." />}
      </div>

      <Sheet
        open={open}
        title={editing ? "Edit category" : "New category"}
        onClose={() => setOpen(false)}
        footer={
          <Button full size="lg" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save category"}
          </Button>
        }
      >
        <div className="space-y-4">
          <Field label="Category name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Signature Biryani" />
          </Field>
          <Field label="Image">
            <ImageField value={image} onChange={setImage} />
          </Field>
          <Toggle checked={active} onChange={setActive} label="Visible on website" />
        </div>
      </Sheet>
    </div>
  );
}

/* ------------------------------ Menu items ---------------------------- */

function MenuPanel({
  items,
  categories,
  onChanged,
}: {
  items: MenuItemRow[];
  categories: CategoryRow[];
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItemRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    price: "0",
    serves: "",
    diet: "nonveg",
    image: "",
    tags: "",
    active: true,
  });

  function openNew() {
    setEditing(null);
    setForm({
      name: "",
      categoryId: categories[0]?.id ?? "",
      description: "",
      price: "0",
      serves: "",
      diet: "nonveg",
      image: "",
      tags: "",
      active: true,
    });
    setOpen(true);
  }

  function openEdit(row: MenuItemRow) {
    setEditing(row);
    setForm({
      name: row.name,
      categoryId: row.category_id ?? "",
      description: row.description,
      price: String(row.price),
      serves: row.serves,
      diet: row.diet,
      image: row.image_url ?? "",
      tags: (row.tags ?? []).join(", "),
      active: row.is_active,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return toast.error("Dish name is required");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category_id: form.categoryId || null,
      description: form.description.trim(),
      price: Number(form.price) || 0,
      serves: form.serves.trim(),
      diet: form.diet,
      image_url: form.image || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      is_active: form.active,
      sort_order: editing?.sort_order ?? items.length,
    };
    const { error } = editing
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Dish updated" : "Dish created");
    setOpen(false);
    await onChanged();
  }

  return (
    <div className="space-y-4">
      <Button onClick={openNew} full className="sm:w-auto">
        <Plus className="h-4 w-4" /> New dish
      </Button>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-[18px] border border-border bg-card shadow-card"
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-32 w-full object-cover"
                loading="lazy"
              />
            )}
            <div className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <p className="truncate font-display text-[19px]">{item.name}</p>
                <p className="shrink-0 text-[15px] font-semibold">{inr(Number(item.price))}</p>
              </div>
              <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                <span className="rounded-full bg-surface px-2.5 py-1 capitalize">{item.diet}</span>
                {item.serves && (
                  <span className="rounded-full bg-surface px-2.5 py-1">{item.serves}</span>
                )}
                <span className="rounded-full bg-surface px-2.5 py-1">
                  {categories.find((c) => c.id === item.category_id)?.name ?? "Uncategorised"}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="press inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-border py-2.5 text-[13px] font-semibold"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={async () => {
                    const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
                    if (error) return toast.error(error.message);
                    toast.success("Dish deleted");
                    await onChanged();
                  }}
                  className="press grid w-[52px] place-items-center rounded-[12px] border border-border text-destructive"
                  aria-label="Delete dish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 && <EmptyRow text="No dishes yet." />}
      </div>

      <Sheet
        open={open}
        title={editing ? "Edit dish" : "New dish"}
        onClose={() => setOpen(false)}
        footer={
          <Button full size="lg" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save dish"}
          </Button>
        }
      >
        <div className="space-y-4">
          <Field label="Dish name">
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Mutton Dum Biryani"
            />
          </Field>
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <TextInput
                inputMode="numeric"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </Field>
            <Field label="Serve amount">
              <TextInput
                value={form.serves}
                onChange={(e) => setForm({ ...form, serves: e.target.value })}
                placeholder="Serves 5–6 / 20 pieces"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Diet">
              <Select value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })}>
                <option value="nonveg">Non-veg</option>
                <option value="veg">Veg</option>
              </Select>
            </Field>
          </div>
          <Field label="Tags" hint="Comma separated, e.g. bestseller, premium">
            <TextInput
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="bestseller, most-loved"
            />
          </Field>
          <Field label="Image">
            <ImageField value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
          </Field>
          <Toggle
            checked={form.active}
            onChange={(v) => setForm({ ...form, active: v })}
            label="Visible on website"
          />
          <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <UtensilsCrossed className="h-3.5 w-3.5" /> Dishes appear on the public menu when visible.
          </p>
        </div>
      </Sheet>
    </div>
  );
}
