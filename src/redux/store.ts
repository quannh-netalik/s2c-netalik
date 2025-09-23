import {
  combineReducers,
  configureStore,
  Middleware,
  ReducersMapObject,
} from "@reduxjs/toolkit";
import { slices } from "./slice";
import { apis } from "./api";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const rootReducer = combineReducers({
  ...slices,
  ...apis.reduce((acc, api) => {
    acc[api.reducerPath] = api.reducer;
    return acc;
  }, {} as ReducersMapObject),
});

export type RootState = ReturnType<typeof rootReducer>;

export const initStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        ...apis.map((api) => <Middleware>api.middleware)
      ),
    preloadedState,
    devTools: process.env.NODE_ENV !== "production",
  });

export const store = initStore();

export type AppStore = ReturnType<typeof initStore>;
export type AppDispatch = AppStore["dispatch"];

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
