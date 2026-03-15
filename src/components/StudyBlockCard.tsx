import { getCourseColorClass } from '@/lib/data';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StudyBlock as StudyBlockType } from '@/lib/types';

interface StudyBlockProps {
  block: StudyBlockType;
}

export function StudyBlockCard({ block }: StudyBlockProps) {
  const colorClass = getCourseColorClass(block.courseColor);
  const heightPx = block.duration * 56;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`relative rounded-lg border px-3 py-2 ${colorClass} cursor-pointer group`}
      style={{ minHeight: `${heightPx}px` }}
      title={block.adaptivelyMoved ? block.reason : undefined}
    >
      {block.adaptivelyMoved && (
        <span className="absolute top-1.5 right-1.5">
          <Sparkles className="h-3 w-3 animate-pulse-dot opacity-70" />
        </span>
      )}
      <p className="text-xs font-semibold leading-tight">{block.courseName}</p>
      <p className="text-xs opacity-75 mt-0.5">{block.task}</p>
      <p className="font-mono-nums text-[10px] opacity-60 mt-1">
        {block.startHour}:00 – {block.startHour + block.duration}:
        {block.duration % 1 === 0.5 ? '30' : '00'}
      </p>
      {block.adaptivelyMoved && (
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-foreground/80 flex items-center justify-center p-2">
          <p className="text-[10px] text-primary-foreground text-center leading-tight font-medium">
            {block.reason}
          </p>
        </div>
      )}
    </motion.div>
  );
}
