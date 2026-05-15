import { useNavigate } from "react-router-dom";
import { PageCanvas } from "../components/PageCanvas";
import { AuthScreen } from "../screens/Auth";

type AuthPageProps = {
  mode: "signin" | "signup";
};

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();

  return (
    <PageCanvas>
      <AuthScreen
        variant="page"
        initialMode={mode}
        onClose={() => navigate("/welcome")}
        onSuccess={() => navigate("/app", { replace: true })}
      />
    </PageCanvas>
  );
}
