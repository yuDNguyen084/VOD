"use client";

type Props = {
  progress: number;
};

export default function ProgressBar({ progress }: Props) {
  return (
    <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-red-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
