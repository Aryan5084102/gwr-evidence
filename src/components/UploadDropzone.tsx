import { useState } from "react";
import { UploadCloud, FolderUp, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadDropzone({ onFiles }: { onFiles?: (count: number) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        onFiles?.(e.dataTransfer.files.length);
      }}
      className={cn(
        "relative rounded-2xl border-2 border-dashed p-10 text-center transition-all overflow-hidden bg-white",
        hover
          ? "border-royal bg-royal/[0.04]"
          : "border-line hover:border-royal/40"
      )}
    >
      <div className="relative flex flex-col items-center">
        <div className="h-16 w-16 rounded-2xl bg-royal/10 flex items-center justify-center mb-4">
          <UploadCloud className="h-7 w-7 text-royal" />
        </div>
        <h3 className="text-lg font-semibold text-soft">Drop evidence here, or browse</h3>
        <p className="text-sm text-muted mt-1 max-w-md">
          Videos, images, PDFs, audio recordings, and public links. Bulk upload and folder upload supported.
          Uploads are resumable and verified for integrity.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          <button className="btn-primary"><UploadCloud className="h-4 w-4" /> Select Files</button>
          <button className="btn-ghost border border-royal/30 text-royal hover:bg-royal/[0.04]"><FolderUp className="h-4 w-4" /> Upload Folder</button>
          <button className="btn-ghost"><Link2 className="h-4 w-4" /> Attach Link</button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 justify-center text-[11px] text-muted">
          {["MP4", "MOV", "JPG", "PNG", "PDF", "DOCX", "WAV", "URL"].map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
