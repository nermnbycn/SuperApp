import React, { createContext, useContext, useState } from "react";

interface HeaderScrollContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  isHomeTab: boolean;
  setIsHomeTab: (value: boolean) => void;
}

const HeaderScrollContext = createContext<HeaderScrollContextType>({
  collapsed: false,
  setCollapsed: () => {},
  isHomeTab: true,
  setIsHomeTab: () => {},
});

export function HeaderScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHomeTab, setIsHomeTab] = useState(true);

  return (
    <HeaderScrollContext.Provider
      value={{ collapsed, setCollapsed, isHomeTab, setIsHomeTab }}
    >
      {children}
    </HeaderScrollContext.Provider>
  );
}

export const useHeaderScroll = () => useContext(HeaderScrollContext);