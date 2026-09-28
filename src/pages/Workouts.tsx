import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, Edit3, MoreVertical, Plus, Sparkles, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PageContainer } from '@/components/layout/PageContainer';
import { DaySelector } from '@/components/custom/DaySelector';
import { WorkoutCard } from '@/components/custom/WorkoutCard';
import { WorkoutChecklist } from '@/pages/WorkoutChecklist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkout } from '@/hooks/useWorkout';
import { predefinedExercises } from '@/utils/mockData';
import { getDayName, getMuscleGroupName, getMuscleGroupEmoji } from '@/utils/calculations';
import { cn } from '@/lib/utils';
import type { DayOfWeek, Exercise, MuscleGroup, Workout } from '@/types';

interface BuilderExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
  restTime: number;
}

export function Workouts() {
  const {
    weeklyWorkouts,
    hasWorkout,
    getWorkoutForDay,
    assignWorkoutToDay,
    removeWorkoutFromDay,
    duplicateWorkout,
    startWorkout,
    updateWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
  } = useWorkout();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('segunda');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [checklistDay, setChecklistDay] = useState<DayOfWeek | null>(null);

  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>('peito');
  const [builderExercises, setBuilderExercises] = useState<BuilderExercise[]>([]);
  const [builderCustomExerciseName, setBuilderCustomExerciseName] = useState('');
  const [customWorkoutName, setCustomWorkoutName] = useState('');
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');

  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [editExerciseGroup, setEditExerciseGroup] = useState<MuscleGroup>('peito');

  const currentWorkout = getWorkoutForDay(selectedDay);

  useEffect(() => {
    if (!showEditDialog || !currentWorkout) return;
    setEditName(currentWorkout.name);
    setEditNotes(currentWorkout.notes || '');
    setEditExerciseGroup(currentWorkout.muscleGroup || 'peito');
  }, [showEditDialog, currentWorkout]);

  useEffect(() => {
    if (showAddDialog) {
      setCustomWorkoutName(`Treino de ${getDayName(selectedDay)}`);
      setExerciseSearchTerm('');
    }
  }, [showAddDialog, selectedDay]);

  const hasWorkoutMap = Object.keys(weeklyWorkouts).reduce((acc, day) => {
    acc[day as DayOfWeek] = hasWorkout(day as DayOfWeek);
    return acc;
  }, {} as Record<DayOfWeek, boolean>);

  const completedDaysMap = Object.keys(weeklyWorkouts).reduce((acc, day) => {
    const workout = weeklyWorkouts[day as DayOfWeek];
    acc[day as DayOfWeek] = workout?.status === 'concluido';
    return acc;
  }, {} as Record<DayOfWeek, boolean>);

  const availableExercises = useMemo(
    () =>
      predefinedExercises.filter((exercise) => {
        const alreadyInWorkout = currentWorkout?.exercises.some((ex) => ex.name === exercise.name);
        const isSelectedGroup = exercise.muscleGroup === editExerciseGroup;
        return !alreadyInWorkout && isSelectedGroup;
      }),
    [currentWorkout, editExerciseGroup]
  );

  const groupExercises = useMemo(
    () => predefinedExercises.filter((exercise) => exercise.muscleGroup === selectedMuscleGroup),
    [selectedMuscleGroup]
  );

  const muscleGroups: MuscleGroup[] = [
    'peito',
    'costas',
    'ombros',
    'biceps',
    'triceps',
    'pernas',
    'gluteos',
    'panturrilha',
    'abdomen',
    'cardio',
  ];

  const handleDuplicateWorkout = (fromDay: DayOfWeek) => {
    duplicateWorkout(fromDay, selectedDay);
  };

  const handleOpenChecklist = (day: DayOfWeek) => {
    setChecklistDay(day);
  };

  const handleStartWorkout = () => {
    startWorkout(selectedDay);
    setChecklistDay(selectedDay);
  };

  const handleSaveWorkoutEdit = () => {
    if (!currentWorkout) return;
    updateWorkout(selectedDay, {
      name: editName.trim() || currentWorkout.name,
      notes: editNotes.trim() || undefined,
    });
    setShowEditDialog(false);
  };

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) return;
    addExerciseToWorkout(selectedDay, {
      name: newExerciseName.trim(),
      muscleGroup: editExerciseGroup || currentWorkout?.muscleGroup || 'outro',
      sets: 3,
      reps: '10-12',
      restTime: 60,
      notes: 'Exercicio personalizado',
      isCustom: true,
    });
    setNewExerciseName('');
  };

  const toggleExerciseInBuilder = (exercise: Omit<Exercise, 'id'>) => {
    setBuilderExercises((prev) => {
      const exists = prev.some((item) => item.name === exercise.name);
      if (exists) {
        return prev.filter((item) => item.name !== exercise.name);
      }
      return [
        ...prev,
        {
          id: uuidv4(),
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          sets: exercise.sets,
          reps: exercise.reps,
          restTime: exercise.restTime || 60,
        },
      ];
    });
  };

  const updateBuilderExercise = (id: string, patch: Partial<BuilderExercise>) => {
    setBuilderExercises((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeBuilderExercise = (id: string) => {
    setBuilderExercises((prev) => prev.filter((item) => item.id !== id));
  };

  const moveBuilderExercise = (index: number, direction: 'up' | 'down') => {
    setBuilderExercises((prev) => {
      const newList = [...prev];
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= newList.length) return prev;
      [newList[index], newList[nextIndex]] = [newList[nextIndex], newList[index]];
      return newList;
    });
  };

  const addCustomExerciseToBuilder = () => {
    const cleanName = builderCustomExerciseName.trim();
    if (!cleanName) return;
    if (builderExercises.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) return;

    setBuilderExercises((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name: cleanName,
        muscleGroup: selectedMuscleGroup,
        sets: 3,
        reps: '10-12',
        restTime: 60,
      },
    ]);
    setBuilderCustomExerciseName('');
  };

  const handleCreateCustomWorkout = () => {
    if (builderExercises.length === 0) {
      alert('Selecione pelo menos um exercício para montar o treino.');
      return;
    }

    const exerciseGroups = new Set(builderExercises.map((exercise) => exercise.muscleGroup));
    const workoutMuscleGroup: MuscleGroup =
      exerciseGroups.size === 1 ? builderExercises[0].muscleGroup : 'full_body';

    const newWorkout: Workout = {
      id: uuidv4(),
      name: customWorkoutName.trim() || `Treino de ${getDayName(selectedDay)}`,
      muscleGroup: workoutMuscleGroup,
      notes: 'Treino personalizado premium',
      status: 'nao_iniciado',
      exercises: builderExercises.map((exercise) => ({
        id: uuidv4(),
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: Math.max(1, exercise.sets),
        reps: exercise.reps,
        restTime: Math.max(0, exercise.restTime),
        completed: false,
      })),
    };

    assignWorkoutToDay(selectedDay, newWorkout);
    setBuilderExercises([]);
    setShowAddDialog(false);
  };

  if (checklistDay) {
    return <WorkoutChecklist day={checklistDay} onBack={() => setChecklistDay(null)} />;
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Treinos da Semana</h2>
        <p className="text-muted-foreground">Organize sua rotina de treinos com controle total.</p>
      </div>

      <div className="mb-6">
        <DaySelector
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          hasWorkout={hasWorkoutMap}
          completedDays={completedDaysMap}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{getDayName(selectedDay)}</h3>
        {currentWorkout?.status === 'em_andamento' && (
          <Button onClick={() => handleOpenChecklist(selectedDay)} className="bg-primary hover:bg-primary/90">
            Continuar treino
          </Button>
        )}
      </div>

      {currentWorkout ? (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-muted-foreground">Treino programado</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar treino
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Substituir por novo treino
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => removeWorkoutFromDay(selectedDay)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover treino
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <WorkoutCard workout={currentWorkout} onClick={() => handleOpenChecklist(selectedDay)} onStart={handleStartWorkout} />

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] p-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border/70 shrink-0 pr-10">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <Edit3 className="w-5 h-5 text-primary shrink-0" />
                    <span>Editar Treino do Dia</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground text-left">
                    {getDayName(selectedDay)}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Nome do treino
                  </Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Observações
                  </Label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Exercícios atuais ({currentWorkout.exercises.length})
                  </Label>
                  <div className="space-y-1.5">
                    {currentWorkout.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between rounded-xl border border-border/70 bg-card/80 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm truncate">{exercise.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {exercise.sets} séries × {exercise.reps} {exercise.restTime ? `• ${exercise.restTime}s desc` : ''}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeExerciseFromWorkout(selectedDay, exercise.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border/70 p-3 sm:p-4 bg-card/60">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Adicionar Exercício ao Treino
                  </Label>

                  {/* Muscle group chips wrapped so all options including Cardio and Abdômen are visible! */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {muscleGroups.map((group) => (
                      <button
                        key={`edit-group-${group}`}
                        type="button"
                        onClick={() => setEditExerciseGroup(group)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95",
                          editExerciseGroup === group
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs ring-2 ring-primary/30"
                            : "bg-card border border-border/70 text-foreground/80 hover:bg-accent/20"
                        )}
                      >
                        <span>{getMuscleGroupEmoji(group)}</span>
                        <span>{getMuscleGroupName(group)}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      placeholder={`Ex: ${getMuscleGroupName(editExerciseGroup)} personalizado`}
                      className="text-xs sm:text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddExercise();
                        }
                      }}
                    />
                    <Button onClick={handleAddExercise} size="sm" className="shrink-0">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {availableExercises.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Biblioteca de {getMuscleGroupName(editExerciseGroup)}:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {availableExercises.map((exercise) => (
                          <button
                            key={exercise.name}
                            type="button"
                            onClick={() =>
                              addExerciseToWorkout(selectedDay, {
                                ...exercise,
                                notes: exercise.notes,
                              })
                            }
                            className="rounded-lg border border-border/70 bg-card/70 px-2.5 py-1.5 text-left text-xs hover:bg-accent/20 hover:border-primary/40 flex items-center justify-between"
                          >
                            <span className="truncate">{exercise.name}</span>
                            <span className="text-[10px] text-primary shrink-0 ml-1">+ Add</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 sm:p-4 border-t border-border/70 bg-background/95 backdrop-blur-xs shrink-0 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveWorkoutEdit}
                  className="flex-1 bg-primary hover:bg-primary/90 font-semibold"
                >
                  Salvar treino
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Card className="p-8 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Nenhum treino programado para {getDayName(selectedDay)}</p>

          <div className="flex flex-col gap-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar treino
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] p-0 flex flex-col overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-border/70 shrink-0 pr-10">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <span>Criar Treino Personalizado</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground text-left">
                      Dia selecionado: <span className="font-semibold text-foreground">{getDayName(selectedDay)}</span>
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Nome do treino */}
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Nome do Treino
                    </Label>
                    <Input
                      value={customWorkoutName}
                      onChange={(e) => setCustomWorkoutName(e.target.value)}
                      placeholder={`Ex: Treino de ${getDayName(selectedDay)}`}
                      className="mt-1"
                    />
                  </div>

                  {/* Grupo Muscular - Wrapped Chips: Peito, Costas, Ombros, Bíceps, Tríceps, Pernas, Glúteos, Panturrilha, Abdômen, Cardio */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Grupo Muscular ({muscleGroups.length})
                      </Label>
                      <span className="text-[11px] text-primary font-medium">
                        {getMuscleGroupName(selectedMuscleGroup)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {muscleGroups.map((group) => {
                        const isSelected = selectedMuscleGroup === group;
                        return (
                          <button
                            key={group}
                            type="button"
                            onClick={() => {
                              setSelectedMuscleGroup(group);
                              setExerciseSearchTerm('');
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95",
                              isSelected
                                ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/30 ring-2 ring-primary/30"
                                : "bg-card border border-border/70 text-foreground/80 hover:bg-accent/20 hover:border-primary/40"
                            )}
                          >
                            <span>{getMuscleGroupEmoji(group)}</span>
                            <span>{getMuscleGroupName(group)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card de seleção de exercícios */}
                  <div className="rounded-xl border border-border/70 p-3 sm:p-4 space-y-3 bg-card/60">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        Exercícios de {getMuscleGroupName(selectedMuscleGroup)}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {groupExercises.length} disponíveis
                      </span>
                    </div>

                    {/* Adicionar exercício manual */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={builderCustomExerciseName}
                        onChange={(e) => setBuilderCustomExerciseName(e.target.value)}
                        placeholder={`Exercício personalizado (${getMuscleGroupName(selectedMuscleGroup)})...`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomExerciseToBuilder();
                          }
                        }}
                        className="text-xs sm:text-sm"
                      />
                      <Button type="button" onClick={addCustomExerciseToBuilder} className="shrink-0" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>

                    {/* Filtro rápido se houver muitos exercícios */}
                    {groupExercises.length > 4 && (
                      <Input
                        value={exerciseSearchTerm}
                        onChange={(e) => setExerciseSearchTerm(e.target.value)}
                        placeholder={`Filtrar exercícios de ${getMuscleGroupName(selectedMuscleGroup)}...`}
                        className="h-8 text-xs bg-background/50"
                      />
                    )}

                    {/* Lista da biblioteca */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {groupExercises
                        .filter((ex) =>
                          !exerciseSearchTerm || ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
                        )
                        .map((exercise) => {
                          const isAdded = builderExercises.some((item) => item.name === exercise.name);
                          return (
                            <button
                              key={exercise.name}
                              type="button"
                              onClick={() => toggleExerciseInBuilder(exercise)}
                              className={cn(
                                "w-full rounded-lg border px-2.5 py-2 text-left text-xs transition-all flex items-center justify-between gap-2 active:scale-98",
                                isAdded
                                  ? "border-primary/50 bg-primary/10 text-primary font-medium"
                                  : "border-border/70 bg-card/80 hover:bg-accent/20 hover:border-primary/30"
                              )}
                            >
                              <span className="truncate">{exercise.name}</span>
                              <span className="text-[10px] shrink-0 text-muted-foreground font-mono flex items-center gap-1">
                                {isAdded ? (
                                  <>
                                    <Check className="w-3 h-3 text-primary" />
                                    Adicionado
                                  </>
                                ) : (
                                  `${exercise.sets}x${exercise.reps}`
                                )}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Exercícios selecionados e configuração */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Exercícios no Treino ({builderExercises.length})
                      </p>
                      {builderExercises.length > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          Ajuste séries, reps e descanso
                        </span>
                      )}
                    </div>

                    {builderExercises.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                        Nenhum exercício selecionado ainda. Toque nos exercícios acima para adicioná-los ao treino.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {builderExercises.map((exercise, index) => (
                          <div
                            key={exercise.id}
                            className="rounded-xl border border-border/70 bg-card/80 p-2.5 space-y-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex items-center gap-1.5">
                                <span className="text-xs">{getMuscleGroupEmoji(exercise.muscleGroup)}</span>
                                <p className="text-xs sm:text-sm font-semibold truncate text-foreground">
                                  {exercise.name}
                                </p>
                              </div>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => moveBuilderExercise(index, 'up')}
                                  disabled={index === 0}
                                  title="Mover para cima"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => moveBuilderExercise(index, 'down')}
                                  disabled={index === builderExercises.length - 1}
                                  title="Mover para baixo"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => removeBuilderExercise(exercise.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  title="Remover"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-[10px] text-muted-foreground block mb-0.5">Séries</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={exercise.sets}
                                  onChange={(e) =>
                                    updateBuilderExercise(exercise.id, { sets: parseInt(e.target.value) || 1 })
                                  }
                                  className="h-8 text-xs text-center"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground block mb-0.5">Reps</Label>
                                <Input
                                  value={exercise.reps}
                                  onChange={(e) =>
                                    updateBuilderExercise(exercise.id, { reps: e.target.value })
                                  }
                                  className="h-8 text-xs text-center"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground block mb-0.5">Desc (s)</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  step={5}
                                  value={exercise.restTime}
                                  onChange={(e) =>
                                    updateBuilderExercise(exercise.id, {
                                      restTime: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="h-8 text-xs text-center"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-4 border-t border-border/70 bg-background/95 backdrop-blur-xs shrink-0 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateCustomWorkout}
                    disabled={builderExercises.length === 0}
                    className="flex-1 bg-primary hover:bg-primary/90 font-semibold"
                  >
                    Salvar treino ({builderExercises.length})
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {Object.entries(weeklyWorkouts).some(([day, w]) => w !== null && day !== selectedDay) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar de outro dia
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(weeklyWorkouts)
                    .filter(([day, w]) => w !== null && day !== selectedDay)
                    .map(([day]) => (
                      <DropdownMenuItem key={day} onClick={() => handleDuplicateWorkout(day as DayOfWeek)}>
                        Copiar de {getDayName(day as DayOfWeek)}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </Card>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Resumo da Semana</h3>
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {Object.values(weeklyWorkouts).filter((w) => w?.status === 'concluido').length}
              </p>
              <p className="text-xs text-muted-foreground">Concluidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">
                {Object.values(weeklyWorkouts).filter((w) => w?.status === 'em_andamento').length}
              </p>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.values(weeklyWorkouts).filter(Boolean).length}</p>
              <p className="text-xs text-muted-foreground">Programados</p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
