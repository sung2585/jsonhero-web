import { createContext, useContext, ReactNode } from "react";

export type StarCountType = number | undefined;

const StarCountContext = createContext<StarCountType>(undefined);

export function StarCountProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <StarCountContext.Provider value={undefined}>
      {children}
    </StarCountContext.Provider>
  );
}

export function useStarCount(): StarCountType {
  return useContext(StarCountContext);
}
