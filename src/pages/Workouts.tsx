// Página de Treinos da Semana

import { useState } from 'react';
import { Plus, Copy, Trash2, Edit3, MoreVertical } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { DaySelector } from '@/components/custom/DaySelector';
import { WorkoutCard } from '@/components/custom/WorkoutCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import type { DayOfWeek, Workout } from '@/types';
import { getDayName } from '@/utils/calculations';
import { sampleWorkouts } from '@/utils/mockData';

export function Workouts() {
  const { 
    weeklyWorkouts, 
    hasWorkout, 
    getWorkoutForDay, 
    assignWorkoutToDay,
    removeWorkoutFromDay,
    duplicateWorkout,
    startWorkout
  } = useWorkout();
  
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('segunda');
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const currentWorkout = getWorkoutForDay(selectedDay);
  
  // Verifica quais dias têm treinos
  const hasWorkoutMap = Object.keys(weeklyWorkouts).reduce((acc, day) => {
    acc[day as DayOfWeek] = hasWorkout(day as DayOfWeek);
    return acc;
  }, {} as Record<DayOfWeek, boolean>);
  
  // Verifica quais dias estão concluídos
  const completedDaysMap = Object.keys(weeklyWorkouts).reduce((acc, day) => {
    const workout = weeklyWorkouts[day as DayOfWeek];
    acc[day as DayOfWeek] = workout?.status === 'concluido';
    return acc;
  }, {} as Record<DayOfWeek, boolean>);

  const handleAddWorkout = (workout: Workout) => {
    assignWorkoutToDay(selectedDay, workout);
    setShowAddDialog(false);
  };

  const handleDuplicateWorkout = (fromDay: DayOfWeek) => {
    duplicateWorkout(fromDay, selectedDay);
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Treinos da Semana</h2>
        <p className="text-muted-foreground">
          Organize sua rotina de treinos
        </p>
      </div>

      {/* Seletor de dias */}
      <div className="mb-6">
        <DaySelector
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          hasWorkout={hasWorkoutMap}
          completedDays={completedDaysMap}
        />
      </div>

      {/* Dia selecionado */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{getDayName(selectedDay)}</h3>
      </div>

      {/* Treino do dia selecionado */}
      {currentWorkout ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-muted-foreground">Treino Programado</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => removeWorkoutFromDay(selectedDay)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <WorkoutCard
            workout={currentWorkout}
            onStart={() => startWorkout(selectedDay)}
          />
        </div>
      ) : (
        <Card className="p-8 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Nenhum treino programado para {getDayName(selectedDay)}
          </p>
          
          <div className="flex flex-col gap-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-lime-500 hover:bg-lime-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Treino
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Escolher Treino</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  {sampleWorkouts.map((workout) => (
                    <Card
                      key={workout.id}
                      className="p-4 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleAddWorkout(workout)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {workout.muscleGroup === 'peito' && '🦾'}
                          {workout.muscleGroup === 'costas' && '🔙'}
                          {workout.muscleGroup === 'ombros' && '🤷'}
                          {workout.muscleGroup === 'pernas' && '🦵'}
                          {workout.muscleGroup === 'cardio' && '❤️'}
                          {workout.muscleGroup === 'full_body' && '🏋️'}
                        </span>
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workout.exercises.length} exercícios
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Opção de duplicar de outro dia */}
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
                    .map(([day, _]) => (
                      <DropdownMenuItem 
                        key={day}
                        onClick={() => handleDuplicateWorkout(day as DayOfWeek)}
                      >
                        Copiar de {getDayName(day as DayOfWeek)}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </Card>
      )}

      {/* Resumo da semana */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Resumo da Semana</h3>
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-lime-500">
                {Object.values(weeklyWorkouts).filter(w => w?.status === 'concluido').length}
              </p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">
                {Object.values(weeklyWorkouts).filter(w => w?.status === 'em_andamento').length}
              </p>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Object.values(weeklyWorkouts).filter(Boolean).length}
              </p>
              <p className="text-xs text-muted-foreground">Programados</p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
