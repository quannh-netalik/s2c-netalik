"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";

import { initStore, RootState } from "./store";

type ReduxProviderProps = {
  children: ReactNode;
  preloadedState: Partial<RootState>;
};

const ReduxProvider = ({ children, preloadedState }: ReduxProviderProps) => {
  const storeRef = useRef(initStore(preloadedState));

  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default ReduxProvider;
