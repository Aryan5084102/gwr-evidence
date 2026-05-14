import { Heart, MessageSquareReply, Send } from "lucide-react";
import type { Comment } from "@/types";
import { formatTime } from "@/lib/utils";

function Avatar({ initials, active }: { initials: string; active?: boolean }) {
  return (
    <div className="relative shrink-0">
      <div className="h-8 w-8 rounded-full bg-royal text-white flex items-center justify-center text-[11px] font-bold">
        {initials}
      </div>
      {active && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />}
    </div>
  );
}

function CommentItem({ c }: { c: Comment }) {
  return (
    <div className="flex gap-3">
      <Avatar initials={c.author.avatar} active={c.author.active} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">{c.author.name}</div>
          <div className="text-[11px] text-muted">{c.author.role}</div>
          <div className="text-[11px] text-muted ml-auto">{formatTime(c.createdAt)}</div>
        </div>
        <div className="mt-1 text-sm text-soft leading-relaxed">{c.body}</div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
          <button className="hover:text-royal inline-flex items-center gap-1"><Heart className="h-3 w-3" /> 4</button>
          <button className="hover:text-soft inline-flex items-center gap-1"><MessageSquareReply className="h-3 w-3" /> Reply</button>
        </div>
        {c.replies?.length ? (
          <div className="mt-3 pl-4 border-l border-line space-y-3">
            {c.replies.map((r) => <CommentItem key={r.id} c={r} />)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ReviewerCommentPanel({ comments }: { comments: Comment[] }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Reviewer Discussion</h3>
        <span className="chip">{comments.length} threads</span>
      </div>
      <div className="space-y-5">
        {comments.map((c) => <CommentItem key={c.id} c={c} />)}
      </div>
      <div className="mt-5 pt-4 border-t border-line">
        <div className="flex gap-2">
          <input placeholder="Write a comment… @mention reviewers" className="input flex-1" />
          <button className="btn-primary !px-3"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
