"use client";

import { createContext, useCallback, useContext, useReducer } from "react";

interface ProfileData {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  userType: string;
  tier: string;
}

type ProfileAction =
  | { type: "update_name"; displayName: string }
  | { type: "update_avatar"; avatarUrl: string };

interface ProfileContextValue extends ProfileData {
  updateName: (displayName: string) => void;
  updateAvatar: (avatarUrl: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function reducer(state: ProfileData, action: ProfileAction): ProfileData {
  switch (action.type) {
    case "update_name":
      return { ...state, displayName: action.displayName };
    case "update_avatar":
      return { ...state, avatarUrl: action.avatarUrl };
  }
}

export function ProfileProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: ProfileData;
}) {
  const [state, dispatch] = useReducer(reducer, initial);

  const updateName = useCallback(
    (displayName: string) => dispatch({ type: "update_name", displayName }),
    []
  );
  const updateAvatar = useCallback(
    (avatarUrl: string) => dispatch({ type: "update_avatar", avatarUrl }),
    []
  );

  return (
    <ProfileContext.Provider value={{ ...state, updateName, updateAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
