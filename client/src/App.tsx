import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Claim from "@/pages/Claim";
import Setup from "@/pages/Setup";
import Registered from "@/pages/Registered";
import ProfileEditor from "@/pages/ProfileEditor";
import Public from "@/pages/Public";
import ConversationView from "@/pages/ConversationView";
import NotFound from "@/pages/NotFound";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public receptionist page — always available */}
      <Route path="/a/:name" component={Public} />

      {isLoading ? (
        <Route>
          <div className="min-h-screen grid-bg flex items-center justify-center">
            <span className="mono-label">Loading…</span>
          </div>
        </Route>
      ) : isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/claim" component={Claim} />
          <Route path="/registered/:addressId" component={Registered} />
          <Route path="/setup/:addressId" component={Setup} />
          <Route path="/page/:addressId" component={ProfileEditor} />
          <Route path="/inbox/:id" component={ConversationView} />
        </>
      ) : (
        <Route path="/" component={Landing} />
      )}

      <Route component={NotFound} />
    </Switch>
  );
}
