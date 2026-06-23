"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MediaLibraryField } from "@/components/dashboard/media/MediaLibraryField";
import type { Author, Reviewer } from "@/lib/database/types";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ExpertProfile = Author | Reviewer;
type ExpertKind = "author" | "reviewer";

type ExpertProfilesClientProps = {
  kind: ExpertKind;
};

type ExpertFormState = {
  name: string;
  slug: string;
  photo_url: string;
  designation: string;
  qualification: string;
  experience_years: string;
  bio: string;
  linkedin_url: string;
  website_url: string;
  email: string;
  is_active: boolean;
};

type ExpertResponse = {
  author?: Author;
  authors?: Author[];
  reviewer?: Reviewer;
  reviewers?: Reviewer[];
  error?: string;
};

const emptyForm: ExpertFormState = {
  name: "",
  slug: "",
  photo_url: "",
  designation: "",
  qualification: "",
  experience_years: "",
  bio: "",
  linkedin_url: "",
  website_url: "",
  email: "",
  is_active: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function expertToForm(profile: ExpertProfile): ExpertFormState {
  return {
    name: profile.name,
    slug: profile.slug,
    photo_url: profile.photo_url ?? "",
    designation: profile.designation ?? "",
    qualification: profile.qualification ?? "",
    experience_years: profile.experience_years?.toString() ?? "",
    bio: profile.bio ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    website_url: profile.website_url ?? "",
    email: profile.email ?? "",
    is_active: profile.is_active,
  };
}

function formToPayload(form: ExpertFormState) {
  return {
    name: form.name,
    slug: form.slug || undefined,
    photo_url: form.photo_url || null,
    designation: form.designation || null,
    qualification: form.qualification || null,
    experience_years: form.experience_years ? Number(form.experience_years) : null,
    bio: form.bio || null,
    linkedin_url: form.linkedin_url || null,
    website_url: form.website_url || null,
    email: form.email || null,
    is_active: form.is_active,
  };
}

export function ExpertProfilesClient({ kind }: ExpertProfilesClientProps) {
  const labels = kind === "author"
    ? {
        singular: "Author",
        plural: "Authors",
        endpoint: "/api/authors",
      }
    : {
        singular: "Reviewer",
        plural: "Reviewers",
        endpoint: "/api/reviewers",
      };

  const [profiles, setProfiles] = useState<ExpertProfile[]>([]);
  const [form, setForm] = useState<ExpertFormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingProfile, setEditingProfile] = useState<ExpertProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(labels.endpoint, { cache: "no-store" });
      const payload = (await response.json()) as ExpertResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? `Unable to load ${labels.plural.toLowerCase()}.`);
      }

      setProfiles((payload.authors ?? payload.reviewers ?? []) as ExpertProfile[]);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : `Unable to load ${labels.plural.toLowerCase()}.`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [labels.endpoint, labels.plural]);

  useEffect(() => {
    void fetchProfiles();
  }, [fetchProfiles]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? profile.is_active
            : !profile.is_active;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        profile.name,
        profile.slug,
        profile.designation ?? "",
        profile.qualification ?? "",
        profile.email ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [profiles, search, statusFilter]);

  function updateForm<K extends keyof ExpertFormState>(key: K, value: ExpertFormState[K]) {
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [key]: value };

      if (key === "name" && !currentForm.slug.trim()) {
        nextForm.slug = slugify(String(value));
      }

      return nextForm;
    });
  }

  function openCreateForm() {
    setEditingProfile(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(profile: ExpertProfile) {
    setEditingProfile(profile);
    setForm(expertToForm(profile));
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editingProfile ? `${labels.endpoint}/${editingProfile.id}` : labels.endpoint,
        {
          method: editingProfile ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToPayload(form)),
        },
      );
      const payload = (await response.json()) as ExpertResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? `Unable to save ${labels.singular.toLowerCase()}.`);
      }

      setSuccess(
        editingProfile
          ? `${labels.singular} updated successfully.`
          : `${labels.singular} created successfully.`,
      );
      setIsFormOpen(false);
      setEditingProfile(null);
      setForm(emptyForm);
      await fetchProfiles();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : `Unable to save ${labels.singular.toLowerCase()}.`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProfile(profile: ExpertProfile) {
    const shouldDelete = window.confirm(`Delete ${profile.name}?`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${labels.endpoint}/${profile.id}`, { method: "DELETE" });
      const payload = (await response.json()) as ExpertResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? `Unable to delete ${labels.singular.toLowerCase()}.`);
      }

      setSuccess(`${labels.singular} deleted successfully.`);
      await fetchProfiles();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : `Unable to delete ${labels.singular.toLowerCase()}.`,
      );
    }
  }

  return (
    <div className="space-y-6">
      <DashboardCard title={`${labels.plural} Directory`}>
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="flex min-h-12 flex-1 items-center gap-3 rounded-pill border border-border-light bg-white px-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:max-w-sm">
              <Search className="size-4 text-primary" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${labels.plural.toLowerCase()}...`}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
            <label className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 text-sm font-medium text-text-dark shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <span className="text-muted">Status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | "active" | "inactive")
                }
                className="bg-transparent font-semibold outline-none"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void fetchProfiles()}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-border-light bg-white px-4 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-5 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover"
            >
              <Plus className="size-4" />
              Add {labels.singular}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-[20px] border border-primary/15 bg-soft-green px-4 py-3 text-sm font-medium text-primary">
            {success}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-[24px] border border-border-light">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-soft-green font-heading text-text-dark">
              <tr>
                <th className="px-5 py-4">{labels.singular}</th>
                <th className="px-5 py-4">Designation</th>
                <th className="px-5 py-4">Qualification</th>
                <th className="px-5 py-4">Experience</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      Loading {labels.plural.toLowerCase()}...
                    </span>
                  </td>
                </tr>
              ) : filteredProfiles.length ? (
                filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="border-t border-border-light">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-12 rounded-full border border-border-light bg-cover bg-center bg-no-repeat shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                          style={profile.photo_url ? { backgroundImage: `url("${profile.photo_url}")` } : undefined}
                        />
                        <div>
                          <p className="font-heading font-semibold text-text-dark">{profile.name}</p>
                          <p className="text-xs text-muted">{profile.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">{profile.designation || "Not added"}</td>
                    <td className="px-5 py-4 text-muted">{profile.qualification || "Not added"}</td>
                    <td className="px-5 py-4 text-muted">
                      {profile.experience_years !== null ? `${profile.experience_years} years` : "Not added"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-pill px-3 py-1.5 text-xs font-semibold ${
                          profile.is_active
                            ? "bg-soft-green text-primary"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {profile.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(profile)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-border-light px-4 py-2 font-heading text-xs font-semibold text-primary transition hover:border-gold/70"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteProfile(profile)}
                          className="inline-flex items-center gap-1.5 rounded-pill border border-red-200 px-4 py-2 font-heading text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">
                    No {labels.plural.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {isFormOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[30px] border border-border-light bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-text-dark">
                {editingProfile ? `Edit ${labels.singular}` : `Create ${labels.singular}`}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Manage public EEAT profiles used across products, ingredients, and editorial pages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full border border-border-light p-2 text-muted transition hover:border-gold/60 hover:text-primary"
              aria-label={`Close ${labels.singular.toLowerCase()} form`}
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={submitProfile} className="grid gap-4 lg:grid-cols-2">
            <InputField
              label="Name"
              value={form.name}
              onChange={(value) => updateForm("name", value)}
              required
            />
            <InputField
              label="Slug"
              value={form.slug}
              onChange={(value) => updateForm("slug", slugify(value))}
              placeholder="auto-generated if empty"
            />
            <MediaLibraryField
              label="Photo"
              value={form.photo_url}
              onChange={(value) => updateForm("photo_url", value)}
              className="lg:col-span-2"
              helperText="Choose a professional profile photo from the Media Library."
            />
            <InputField
              label="Designation"
              value={form.designation}
              onChange={(value) => updateForm("designation", value)}
            />
            <InputField
              label="Qualification"
              value={form.qualification}
              onChange={(value) => updateForm("qualification", value)}
            />
            <InputField
              label="Experience (years)"
              value={form.experience_years}
              onChange={(value) => updateForm("experience_years", value)}
              placeholder="12"
            />
            <InputField
              label="Email"
              value={form.email}
              onChange={(value) => updateForm("email", value)}
              placeholder="Optional public contact email"
            />
            <InputField
              label="LinkedIn URL"
              value={form.linkedin_url}
              onChange={(value) => updateForm("linkedin_url", value)}
              placeholder="https://linkedin.com/in/profile"
            />
            <InputField
              label="Website URL"
              value={form.website_url}
              onChange={(value) => updateForm("website_url", value)}
              placeholder="https://example.com"
            />
            <ToggleField
              label="Active Profile"
              checked={form.is_active}
              onChange={(checked) => updateForm("is_active", checked)}
            />
            <TextAreaField
              label="Bio"
              value={form.bio}
              onChange={(value) => updateForm("bio", value)}
              className="lg:col-span-2"
              rows={5}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 font-heading text-sm font-semibold text-white shadow-[0_14px_34px_rgba(11,93,59,0.18)] transition hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingProfile ? `Update ${labels.singular}` : `Create ${labels.singular}`}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-pill border border-border-light px-6 font-heading text-sm font-semibold text-primary transition hover:border-gold/70"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="min-h-12 rounded-[18px] border border-border-light bg-white px-4 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="rounded-[18px] border border-border-light bg-white px-4 py-3 text-sm text-text-dark outline-none transition placeholder:text-muted/70 focus:border-gold/80 focus:ring-4 focus:ring-gold/10"
      />
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between rounded-[18px] border border-border-light bg-white px-4">
      <span className="font-heading text-sm font-semibold text-text-dark">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-primary"
      />
    </label>
  );
}
