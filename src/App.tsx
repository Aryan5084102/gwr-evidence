import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import WitnessLayout from "@/layouts/WitnessLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";

/* ---------- Witness portal (single guided page) ---------- */
import WitnessPortal from "@/pages/witness/WitnessPortal";

import AdjudicatorDashboard from "@/pages/adjudicator/AdjudicatorDashboard";
import WitnessReviews from "@/pages/adjudicator/WitnessReviews";
import AttemptReviews from "@/pages/adjudicator/AttemptReviews";
import AdjAIValidation from "@/pages/adjudicator/AIValidation";
import AdjClarifications from "@/pages/adjudicator/Clarifications";
import AuditLogs from "@/pages/adjudicator/AuditLogs";

/* ---------- Existing full Evidence Submission Platform (organizer) ---------- */
import Dashboard from "@/pages/Dashboard";
import CreateSubmission from "@/pages/CreateSubmission";
import EvidenceUpload from "@/pages/EvidenceUpload";
import AIProcessing from "@/pages/AIProcessing";
import EvidenceReview from "@/pages/EvidenceReview";
import SmartSearch from "@/pages/SmartSearch";
import SmartTimeline from "@/pages/SmartTimeline";
import Collaboration from "@/pages/Collaboration";
import AIValidation from "@/pages/AIValidation";
import Clarifications from "@/pages/Clarifications";
import ReportGeneration from "@/pages/ReportGeneration";
import SubmissionPackage from "@/pages/SubmissionPackage";
import Analytics from "@/pages/Analytics";
import SecurityAudit from "@/pages/SecurityAudit";
import CoverLetterBuilder from "@/pages/CoverLetterBuilder";
import WitnessSystem from "@/pages/WitnessSystem";
import WitnessSign from "@/pages/WitnessSign";
import ActivityLogbook from "@/pages/ActivityLogbook";
import StewardStatement from "@/pages/StewardStatement";
import TimekeeperStatement from "@/pages/TimekeeperStatement";
import WitnessStatement from "@/pages/WitnessStatement";

/* ---------- New organizer-prefixed helper pages ---------- */
import OrganizerDashboard from "@/pages/organizer/OrganizerDashboard";
import Submissions from "@/pages/organizer/Submissions";
import InviteWitnesses from "@/pages/organizer/InviteWitnesses";
import OrgEvidenceUpload from "@/pages/organizer/EvidenceUpload";
import ActivityLogs from "@/pages/organizer/ActivityLogs";
import OrgAIValidation from "@/pages/organizer/OrganizerAIValidation";
import Reports from "@/pages/organizer/Reports";

import GenericSettings from "@/pages/Settings";
import { useAppSelector } from "@/redux/store";

function HomeRedirect() {
  const auth = useAppSelector((s) => s.auth);
  if (!auth.isAuthenticated || !auth.user) return <Navigate to="/login" replace />;
  if (auth.user.role === "organizer") return <Navigate to="/dashboard" replace />;
  if (auth.user.role === "witness") return <Navigate to="/witness" replace />;
  return <Navigate to={`/${auth.user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Witness — single guided page, minimal layout. Magic link is public. */}
      <Route element={<WitnessLayout />}>
        <Route path="/witness" element={<WitnessPortal />} />
        <Route path="/witness/invite/:token" element={<WitnessPortal />} />
        {/* Back-compat: redirect every old witness sub-path to the single page */}
        <Route path="/witness/dashboard" element={<Navigate to="/witness" replace />} />
        <Route path="/witness/attempts" element={<Navigate to="/witness" replace />} />
        <Route path="/witness/attempts/:id" element={<Navigate to="/witness" replace />} />
        <Route path="/witness/statements" element={<Navigate to="/witness" replace />} />
        <Route path="/witness/timeline" element={<Navigate to="/witness" replace />} />
        <Route path="/witness/evidence" element={<Navigate to="/witness" replace />} />
        <Route path="/witness/notifications" element={<Navigate to="/witness" replace />} />
        <Route path="/witness/settings" element={<Navigate to="/witness" replace />} />
      </Route>

      {/* Adjudicator portal */}
      <Route element={<DashboardLayout requireRole="adjudicator" />}>
        <Route path="/adjudicator/dashboard" element={<AdjudicatorDashboard />} />
        <Route path="/adjudicator/witnesses" element={<WitnessReviews />} />
        <Route path="/adjudicator/attempts" element={<AttemptReviews />} />
        <Route path="/adjudicator/ai-validation" element={<AdjAIValidation />} />
        <Route path="/adjudicator/clarifications" element={<AdjClarifications />} />
        <Route path="/adjudicator/audit" element={<AuditLogs />} />
        <Route path="/adjudicator/settings" element={<GenericSettings />} />
      </Route>

      {/* Organizer — full Evidence Submission Platform */}
      <Route element={<DashboardLayout requireRole="organizer" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/submissions/new" element={<CreateSubmission />} />
        <Route path="/cover-letter" element={<CoverLetterBuilder />} />
        <Route path="/witnesses" element={<WitnessSystem />} />
        <Route path="/witness/sign/:token" element={<WitnessSign />} />
        <Route path="/logbook" element={<ActivityLogbook />} />
        <Route path="/steward-statement" element={<StewardStatement />} />
        <Route path="/timekeeper-statement" element={<TimekeeperStatement />} />
        <Route path="/witness-statement" element={<WitnessStatement />} />
        <Route path="/evidence/upload" element={<EvidenceUpload />} />
        <Route path="/ai/processing" element={<AIProcessing />} />
        <Route path="/review" element={<EvidenceReview />} />
        <Route path="/search" element={<SmartSearch />} />
        <Route path="/timeline" element={<SmartTimeline />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/validation" element={<AIValidation />} />
        <Route path="/clarifications" element={<Clarifications />} />
        <Route path="/report" element={<ReportGeneration />} />
        <Route path="/package" element={<SubmissionPackage />} />
        <Route path="/security" element={<SecurityAudit />} />

        {/* Newer organizer-prefixed pages */}
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/submissions" element={<Submissions />} />
        <Route path="/organizer/invite" element={<InviteWitnesses />} />
        <Route path="/organizer/evidence" element={<OrgEvidenceUpload />} />
        <Route path="/organizer/activity" element={<ActivityLogs />} />
        <Route path="/organizer/ai-validation" element={<OrgAIValidation />} />
        <Route path="/organizer/reports" element={<Reports />} />
        <Route path="/organizer/settings" element={<GenericSettings />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
