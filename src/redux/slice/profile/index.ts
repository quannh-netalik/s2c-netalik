// src/redux/slice/user.ts
import { Profile } from "@/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ProfileState = {
  user: Profile | null;
};

const initialState: ProfileState = {
  user: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.user = action.payload;
    },
    clearProfile: (state) => {
      state.user = null;
    },
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
