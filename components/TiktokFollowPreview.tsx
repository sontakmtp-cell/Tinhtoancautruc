import React from 'react';
import { Heart, Music2, UserPlus, X } from 'lucide-react';

type TiktokFollowPreviewProps = {
  onClose?: () => void;
};

type TiktokFollowCardProps = {
  onClose?: () => void;
  compact?: boolean;
};

const TiktokFollowInnerCard: React.FC = () => (
      <div className="tiktok-follow-card relative z-10 w-[330px] rounded-[24px] border border-white/14 bg-white/[0.08] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="tiktok-follow-sheen" />
        <div className="mb-4 flex items-center gap-4">
          <div className="relative h-[82px] w-[82px] shrink-0">
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_120deg,#25f4ee,#ffffff,#fe2c55,#25f4ee)] p-[3px]">
              <div className="grid h-full w-full place-items-center rounded-full bg-[#111827]">
                <span className="text-2xl font-black tracking-normal text-white">NS</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-[#fe2c55] shadow-lg shadow-[#fe2c55]/35">
              <Music2 className="h-4 w-4" />
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-xl font-black leading-tight tracking-normal">Ngọc Sơn</p>
            <p className="mt-1 text-sm font-semibold tracking-normal text-white/68">@sontakmvp</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-1 text-xs font-bold text-white/78">
              <Heart className="h-3.5 w-3.5 fill-[#fe2c55] text-[#fe2c55]" />
              21,100 follower
            </div>
          </div>
        </div>

        <a
          href="https://www.tiktok.com/@sontakmvp"
          target="_blank"
          rel="noreferrer"
          className="tiktok-follow-button"
        >
          <span className="tiktok-button-glow" />
          <UserPlus className="h-5 w-5" />
          <span>Theo dõi</span>
        </a>
      </div>
);

const TiktokFollowCard: React.FC<TiktokFollowCardProps> = ({ onClose, compact = false }) => {
  if (compact) {
    return <TiktokFollowInnerCard />;
  }

  return (
    <div className="relative flex h-[720px] w-full max-w-[405px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#080a12] shadow-2xl shadow-black/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(37,244,238,0.26),transparent_28%),radial-gradient(circle_at_75%_30%,rgba(254,44,85,0.24),transparent_30%),linear-gradient(180deg,#111827_0%,#05060b_58%,#020308_100%)]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng preview"
        className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/35 text-white/75 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <TiktokFollowInnerCard />

      {!compact && (
        <div className="absolute bottom-8 left-7 right-7 z-10 flex items-end justify-between text-white/72">
          <div>
            <p className="text-sm font-bold tracking-normal">@sontakmvp</p>
            <p className="mt-1 max-w-56 text-xs leading-5 text-white/52">Kỹ thuật kết cấu, cầu trục và công cụ tính toán.</p>
          </div>
          <div className="space-y-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-black">21K</div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
              <Music2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TiktokFollowOverlay: React.FC<TiktokFollowPreviewProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] flex justify-center px-4 pb-5 pointer-events-none">
      <div className="pointer-events-auto">
      <TiktokFollowCard onClose={onClose} compact />
      </div>
    </div>
  );
};

export const TiktokFollowPreview: React.FC<TiktokFollowPreviewProps> = ({ onClose }) => {
  return (
    <section className="min-h-screen bg-[#070911] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
        <TiktokFollowCard onClose={onClose} />
      </div>
    </section>
  );
};
