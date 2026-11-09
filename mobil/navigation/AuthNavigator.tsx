import React, { useState } from "react";

import LoginScreen from "../screens/LoginScreen";

interface Props {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onAuthenticated: () => void;
  logOut: (userId: String) => void;
}

export default function AuthNavigator({
  onLogin,
  onAuthenticated,
  logOut,
}: Props) {
  // Açılış animasyonu yalnızca bir kez çalışır.
  const [introPlayed, setIntroPlayed] = useState(false);

  return (
    <LoginScreen
      playIntro={!introPlayed}
      onIntroFinished={() => setIntroPlayed(true)}
      onLogin={onLogin}
      onAuthenticated={onAuthenticated}
    />
  );
}
