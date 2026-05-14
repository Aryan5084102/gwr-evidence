import { Search, Sparkles, Wand2 } from "lucide-react";
import { Button, Card, CardHeader, PageHeader } from "@/components/ui";
import EvidenceCard from "@/components/EvidenceCard";
import { evidence } from "@/mock-data";

const QUERIES = [
  "Show all crowd images after midnight",
  "Find footage with audible cheering above 80 dB",
  "Witness statements mentioning the official timekeeper",
  "Aerial videos with participant count above 12,000",
  "Documents with notarized signatures",
];

const FILTERS = ["Videos", "Images", "Documents", "AI verified", "Flagged", "Last 24h", "Aerial", "Crowd", "Witness"];

export default function SmartSearch() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Smart Search"
        subtitle="Ask anything about your evidence in natural language. Semantic understanding across video, audio, and text."
      />

      <Card className="ring-gold">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-gold" />
          <input
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted"
            placeholder="Ask the AI · e.g. ‘show all crowd images captured after midnight with confidence > 90%’"
            defaultValue="Show all crowd images after midnight"
          />
          <Button variant="gold"><Wand2 className="h-4 w-4" /> Search</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} className="chip hover:border-gold/40 hover:text-soft transition">{f}</button>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader title="AI Suggestions" subtitle="Try these searches" />
          <div className="space-y-2">
            {QUERIES.map((q) => (
              <button key={q} className="w-full text-left text-sm p-3 rounded-xl border border-line hover:border-gold/30 hover:bg-canvas transition flex items-start gap-2">
                <Search className="h-3.5 w-3.5 text-muted mt-0.5" />
                <span className="text-soft">{q}</span>
              </button>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader title="Results" subtitle={`${evidence.length} items · semantic match`} action={<span className="chip">Sorted by relevance</span>} />
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {evidence.slice(0, 9).map((e) => <EvidenceCard key={e.id} e={e} />)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
