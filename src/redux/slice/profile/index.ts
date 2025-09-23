import { Profile } from '@/types/user';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ProfileState = {
  user: Profile | null;
};

const initialState: ProfileState = {
  user: {
    id: '',
    email: '',
    createdAtMs: 0,
    image: undefined,
    name: undefined,
    emailVerifiedAtMs: undefined,
  },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.user = action.payload;
    },
    clearProfile: (state) => {
      state.user = initialState.user;
    },
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
