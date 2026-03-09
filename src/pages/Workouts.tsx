import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Edit3, MoreVertical, Plus, Sparkles, Trash2 } from 'lucide-react';
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
import { predefinedExercises, sampleWorkouts } from '@/utils/mockData';
import { getDayName, getMuscleGroupName } from '@/utils/calculations';
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
  const [customWorkoutName, setCustomWorkoutName] = useState('');
  const [builderExercises, setBuilderExercises] = useState<BuilderExercise[]>([]);

  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');

  const currentWorkout = getWorkoutForDay(selectedDay);

  useEffect(() => {
    if (!showEditDialog || !currentWorkout) return;
    setEditName(currentWorkout.name);
    setEditNotes(currentWorkout.notes || '');
  }, [showEditDialog, currentWorkout]);

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
    () => predefinedExercises.filter((exercise) => !currentWorkout?.exercises.some((ex) => ex.name === exercise.name)),
    [currentWorkout]
  );

  const groupedTemplateWorkouts = useMemo(
    () => sampleWorkouts.filter((workout) => workout.muscleGroup === selectedMuscleGroup),
    [selectedMuscleGroup]
  );

  const groupExercises = useMemo(
    () => predefinedExercises.filter((exercise) => exercise.muscleGroup === selectedMuscleGroup),
    [selectedMuscleGroup]
  );

  const muscleGroups: MuscleGroup[] = ['peito', 'costas', 'ombros', 'biceps', 'triceps', 'pernas', 'abdomen', 'cardio', 'full_body'];

  const handleAddWorkout = (workout: Workout) => {
    assignWorkoutToDay(selectedDay, workout);
    setShowAddDialog(false);
  };

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
      muscleGroup: currentWorkout?.muscleGroup || 'outro',
      sets: 3,
      reps: '10-12',
      restTime: 60,
      notes: 'Exercicio personalizado',
      isCustom: true,
    });
    setNewExerciseName('');
  };

  const addExerciseToBuilder = (exercise: Omit<Exercise, 'id'>) => {
    setBuilderExercises((prev) => {
      if (prev.some((item) => item.name === exercise.name)) return prev;
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

  const handleCreateCustomWorkout = () => {
    if (builderExercises.length === 0) {
      alert('Selecione pelo menos um exercicio para montar o treino.');
      return;
    }

    const newWorkout: Workout = {
      id: uuidv4(),
      name: customWorkoutName.trim() || `Treino ${getMuscleGroupName(selectedMuscleGroup)}`,
      muscleGroup: selectedMuscleGroup,
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
    setCustomWorkoutName('');
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
                <DropdownMenuItem onClick={() => removeWorkoutFromDay(selectedDay)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover treino
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <WorkoutCard workout={currentWorkout} onClick={() => handleOpenChecklist(selectedDay)} onStart={handleStartWorkout} />

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar treino do dia</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <Label>Nome do treino</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>

                <div>
                  <Label>Observacoes</Label>
                  <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Exercicios atuais</Label>
                  <div className="space-y-2">
                    {currentWorkout.exercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-card/80 px-3 py-2">
                        <div>
                          <p className="font-medium text-sm">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.sets}x{exercise.reps}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={() => removeExerciseFromWorkout(selectedDay, exercise.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Adicionar exercicio rapido</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      placeholder="Ex: Supino inclinado halter"
                    />
                    <Button onClick={handleAddExercise}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {availableExercises.length > 0 && (
                  <div className="space-y-2">
                    <Label>Biblioteca</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {availableExercises.slice(0, 8).map((exercise) => (
                        <button
                          key={exercise.name}
                          onClick={() =>
                            addExerciseToWorkout(selectedDay, {
                              ...exercise,
                              notes: exercise.notes,
                            })
                          }
                          className="rounded-xl border border-border/70 bg-card/70 px-3 py-2 text-left text-sm hover:bg-accent/20"
                        >
                          {exercise.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleSaveWorkoutEdit} className="w-full bg-primary hover:bg-primary/90">
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
              <DialogContent className="max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Builder Premium por grupo muscular
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {muscleGroups.map((group) => (
                      <button
                        key={group}
                        onClick={() => {
                          setSelectedMuscleGroup(group);
                          setBuilderExercises([]);
                        }}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedMuscleGroup === group
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border/70 hover:bg-accent/20'
                        }`}
                      >
                        {getMuscleGroupName(group)}
                      </button>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Treinos prontos</p>
                    <div className="space-y-2">
                      {groupedTemplateWorkouts.length > 0 ? (
                        groupedTemplateWorkouts.map((workout) => (
                          <Card
                            key={workout.id}
                            className="p-3 cursor-pointer hover:bg-accent transition-colors text-left"
                            onClick={() => handleAddWorkout(workout)}
                          >
                            <p className="font-medium">{workout.name}</p>
                            <p className="text-xs text-muted-foreground">{workout.exercises.length} exercicios</p>
                          </Card>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhum treino pronto para esse grupo.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 p-3 space-y-3 bg-card/80 text-left">
                    <p className="text-sm font-semibold">Montar treino personalizado</p>
                    <Input
                      value={customWorkoutName}
                      onChange={(e) => setCustomWorkoutName(e.target.value)}
                      placeholder={`Nome do treino (${getMuscleGroupName(selectedMuscleGroup)})`}
                    />

                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {groupExercises.map((exercise) => (
                        <button
                          key={exercise.name}
                          onClick={() => addExerciseToBuilder(exercise)}
                          className="w-full rounded-lg border border-border/70 px-3 py-2 text-left text-sm hover:bg-accent/20"
                        >
                          {exercise.name}
                        </button>
                      ))}
                    </div>

                    {builderExercises.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Exercicios selecionados ({builderExercises.length})</p>
                        {builderExercises.map((exercise, index) => (
                          <div key={exercise.id} className="rounded-lg border border-border/70 p-2">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <p className="text-sm font-medium truncate">{exercise.name}</p>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon-sm" onClick={() => moveBuilderExercise(index, 'up')}>
                                  <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => moveBuilderExercise(index, 'down')}>
                                  <ArrowDown className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => removeBuilderExercise(exercise.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Series</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={exercise.sets}
                                  onChange={(e) => updateBuilderExercise(exercise.id, { sets: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Reps</Label>
                                <Input
                                  value={exercise.reps}
                                  onChange={(e) => updateBuilderExercise(exercise.id, { reps: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Desc (s)</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={exercise.restTime}
                                  onChange={(e) => updateBuilderExercise(exercise.id, { restTime: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button onClick={handleCreateCustomWorkout} className="w-full bg-primary hover:bg-primary/90">
                      Criar treino de {getMuscleGroupName(selectedMuscleGroup)}
                    </Button>
                  </div>
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
