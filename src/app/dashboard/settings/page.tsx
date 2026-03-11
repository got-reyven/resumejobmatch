"use client";

import { useEffect, useReducer, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Shield,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/components/features/ProfileContext";

interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  userType: string;
  tier: string;
  createdAt: string;
}

interface SettingsState {
  profile: Profile | null;
  loadStatus: "loading" | "loaded" | "error";
  nameValue: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  saveError: string | null;
  avatarStatus: "idle" | "uploading" | "uploaded" | "error";
  avatarError: string | null;
}

type SettingsAction =
  | { type: "profile_loaded"; profile: Profile }
  | { type: "profile_error" }
  | { type: "set_name"; value: string }
  | { type: "saving" }
  | { type: "saved"; fullName: string }
  | { type: "save_error"; message: string }
  | { type: "avatar_uploading" }
  | { type: "avatar_uploaded"; url: string }
  | { type: "avatar_error"; message: string }
  | { type: "reset_feedback" };

function reducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case "profile_loaded":
      return {
        ...state,
        profile: action.profile,
        nameValue: action.profile.fullName ?? "",
        loadStatus: "loaded",
      };
    case "profile_error":
      return { ...state, loadStatus: "error" };
    case "set_name":
      return { ...state, nameValue: action.value, saveStatus: "idle" };
    case "saving":
      return { ...state, saveStatus: "saving", saveError: null };
    case "saved":
      return {
        ...state,
        saveStatus: "saved",
        profile: state.profile
          ? { ...state.profile, fullName: action.fullName }
          : state.profile,
      };
    case "save_error":
      return { ...state, saveStatus: "error", saveError: action.message };
    case "avatar_uploading":
      return { ...state, avatarStatus: "uploading", avatarError: null };
    case "avatar_uploaded":
      return {
        ...state,
        avatarStatus: "uploaded",
        profile: state.profile
          ? { ...state.profile, avatarUrl: action.url }
          : state.profile,
      };
    case "avatar_error":
      return {
        ...state,
        avatarStatus: "error",
        avatarError: action.message,
      };
    case "reset_feedback":
      return {
        ...state,
        saveStatus: "idle",
        avatarStatus: "idle",
        avatarError: null,
      };
  }
}

export default function SettingsPage() {
  const { updateName: syncName, updateAvatar: syncAvatar } = useProfile();
  const [state, dispatch] = useReducer(reducer, {
    profile: null,
    loadStatus: "loading",
    nameValue: "",
    saveStatus: "idle",
    saveError: null,
    avatarStatus: "idle",
    avatarError: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/v1/profile");
        if (!res.ok) {
          dispatch({ type: "profile_error" });
          return;
        }
        const json = await res.json();
        dispatch({ type: "profile_loaded", profile: json.data });
      } catch {
        dispatch({ type: "profile_error" });
      }
    }
    loadProfile();
  }, []);

  const handleSaveName = async () => {
    if (!state.nameValue.trim()) return;
    dispatch({ type: "saving" });

    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: state.nameValue.trim() }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        dispatch({
          type: "save_error",
          message: json?.error?.message ?? "Failed to save. Please try again.",
        });
        return;
      }

      const savedName = state.nameValue.trim();
      dispatch({ type: "saved", fullName: savedName });
      syncName(savedName);
      setTimeout(() => dispatch({ type: "reset_feedback" }), 3000);
    } catch {
      dispatch({ type: "save_error", message: "Network error." });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch({ type: "avatar_uploading" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        dispatch({
          type: "avatar_error",
          message: json?.error?.message ?? "Upload failed.",
        });
        return;
      }

      const json = await res.json();
      const newUrl = json.data.avatarUrl;
      dispatch({ type: "avatar_uploaded", url: newUrl });
      syncAvatar(newUrl);
      setTimeout(() => dispatch({ type: "reset_feedback" }), 3000);
    } catch {
      dispatch({ type: "avatar_error", message: "Network error." });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (state.loadStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (state.loadStatus === "error" || !state.profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Failed to load profile. Please refresh the page.
        </p>
      </div>
    );
  }

  const { profile } = state;
  const hasNameChanged = state.nameValue.trim() !== (profile.fullName ?? "");
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="plan" disabled>
            Plan
          </TabsTrigger>
          <TabsTrigger value="account" disabled>
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-muted">
                      {profile.avatarUrl ? (
                        <Image
                          src={profile.avatarUrl}
                          alt="Avatar"
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#6696C9] text-white transition-colors hover:bg-[#5580b0] disabled:opacity-50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={state.avatarStatus === "uploading"}
                      aria-label="Change avatar"
                    >
                      {state.avatarStatus === "uploading" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP. Max 2MB.
                  </p>
                  {state.avatarStatus === "uploaded" && (
                    <p className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" /> Updated
                    </p>
                  )}
                  {state.avatarStatus === "error" && (
                    <p className="text-xs text-destructive">
                      {state.avatarError}
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Display Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fullName"
                        value={state.nameValue}
                        onChange={(e) =>
                          dispatch({
                            type: "set_name",
                            value: e.target.value,
                          })
                        }
                        placeholder="Your name"
                        maxLength={100}
                      />
                      <Button
                        onClick={handleSaveName}
                        disabled={
                          !hasNameChanged ||
                          !state.nameValue.trim() ||
                          state.saveStatus === "saving"
                        }
                        className="shrink-0"
                      >
                        {state.saveStatus === "saving" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                    {state.saveStatus === "saved" && (
                      <p className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" /> Name updated
                      </p>
                    )}
                    {state.saveStatus === "error" && (
                      <p className="text-xs text-destructive">
                        {state.saveError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-muted/30 px-3 py-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {profile.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Account Info
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Account Type
                      </p>
                      <p className="text-sm font-medium capitalize">
                        {profile.userType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="text-sm font-medium capitalize">
                        {profile.tier}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Member Since
                      </p>
                      <p className="text-sm font-medium">{memberSince}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Plan management coming soon.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Account settings coming soon.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
