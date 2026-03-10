import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Info, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import type { Exercise } from '@/types';
import { getMuscleGroupEmoji } from '@/utils/calculations';
import { getExerciseInstructions } from '@/utils/planGenerator';

interface ExerciseExecutionModalProps {
    exercise: Exercise;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExerciseExecutionModal({ exercise, open, onOpenChange }: ExerciseExecutionModalProps) {
    // Mock instructions if not present
    const instructions = exercise.instructions || getExerciseInstructions(exercise.name);

    const [imageError, setImageError] = useState(false);

    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=como+fazer+${encodeURIComponent(exercise.name)}`;
    const googleSearchUrl = `https://www.google.com/search?q=execução+técnica+${encodeURIComponent(exercise.name)}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[450px] p-0 overflow-hidden border-none bg-background/95 backdrop-blur-lg rounded-3xl max-h-[92vh] flex flex-col">
                <div className="relative aspect-video bg-muted flex shrink-0 items-center justify-center">
                    {exercise.videoUrl && !imageError ? (
                        exercise.videoUrl.endsWith('.mp4') || exercise.videoUrl.includes('youtube') ? (
                            <video
                                src={exercise.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                onError={() => setImageError(true)}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={exercise.videoUrl}
                                alt={exercise.name}
                                onError={() => setImageError(true)}
                                className="w-full h-full object-contain"
                            />
                        )
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground p-6 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-40" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs sm:text-sm font-bold text-foreground">Demonstração indisponível</p>
                                <p className="text-[10px] sm:text-xs opacity-70">A base de dados de GIFs está em manutenção.</p>
                            </div>

                            <div className="flex gap-2 w-full max-w-[280px] mt-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-9 rounded-xl bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] sm:text-xs"
                                    onClick={() => window.open(youtubeSearchUrl, '_blank')}
                                >
                                    <Play className="w-3 h-3 mr-1" />
                                    YouTube
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-9 rounded-xl text-[10px] sm:text-xs"
                                    onClick={() => window.open(googleSearchUrl, '_blank')}
                                >
                                    Google
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md border border-white/10 uppercase tracking-tighter">
                            {getMuscleGroupEmoji(exercise.muscleGroup)} EXECUÇÃO PRO
                        </span>
                    </div>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-lg sm:text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                            {exercise.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary/80">
                            <Info className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Como executar:</span>
                        </div>

                        <ul className="space-y-4">
                            {instructions.map((step, i) => (
                                <li key={i} className="flex gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-lime-500" />
                                    </div>
                                    <span className="flex-1">{step}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-2">
                            <Button onClick={() => onOpenChange(false)} className="w-full bg-primary hover:bg-primary/90 h-11 sm:h-12 rounded-2xl text-base sm:text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                                Entendi, vamos treinar!
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
