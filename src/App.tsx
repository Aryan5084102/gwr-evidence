import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
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

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/security" element={<SecurityAudit />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
