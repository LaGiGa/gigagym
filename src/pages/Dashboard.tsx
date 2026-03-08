// Página Dashboard

import { 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar, 
  ChevronRight
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/custom/StatCard';
import { WorkoutCard } from '@/components/custom/WorkoutCard';
import { ProgressRing } from '@/components/custom/ProgressRing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store/AppContext';
import { useWorkout } from '@/hooks/useWorkout';
import { useBodyMetrics } from '@/hooks/useBodyMetrics';
import { getMotivationalQuote, getDayName } from '@/utils/calculations';
import type { DayOfWeek } from '@/types';

export function Dashboard() {
  const { state } = useApp();
  const { weeklyWorkouts, getWeeklyStats, startWorkout } = useWorkout();
  const { currentWeight, getCurrentIMC, getWeightProgress } = useBodyMetrics();
  
  const stats = getWeeklyStats();
  const imc = getCurrentIMC();
  const weightProgress = getWeightProgress();
  const motivationalQuote = getMotivationalQuote();
  
  // Obtém o treino de hoje
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
  const dayMapping: Record<string, DayOfWeek> = {
    'segunda-feira': 'segunda',
    'terça-feira': 'terca',
    'quarta-feira': 'quarta',
    'quinta-feira': 'quinta',
    'sexta-feira': 'sexta',
    'sábado': 'sabado',
    'domingo': 'domingo'
  };
  const todayKey = dayMapping[today];
  const todayWorkout = todayKey ? weeklyWorkouts[todayKey] : null;

  // Próximos treinos
  const upcomingWorkouts = Object.entries(weeklyWorkouts)
    .filter(([_, workout]) => workout !== null)
    .slice(0, 3);

  return (
    <PageContainer>
      {/* Header com saudação */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Olá, {state.profile.name || 'Atleta'}! 💪
        </h2>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </p>
      </div>

      {/* Frase motivacional */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-lime-500/10 to-lime-600/5 border-lime-500/20">
        <p className="text-sm font-medium text-lime-600 dark:text-lime-400">
          {motivationalQuote}
        </p>
      </Card>

      {/* Progresso semanal */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Progresso da Semana</h3>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <ProgressRing 
              progress={stats.completionRate} 
              size={100} 
              strokeWidth={8}
            >
              <div className="text-center">
                <span className="text-2xl font-bold">{stats.completedWorkouts}</span>
                <span className="text-muted-foreground">/{stats.totalWorkouts}</span>
              </div>
            </ProgressRing>
            
            <div className="flex-1">
              <p className="font-medium">{stats.completionRate}% concluído</p>
              <p className="text-sm text-muted-foreground">
                {stats.completedWorkouts} de {stats.totalWorkouts} treinos finalizados
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-lime-500" />
                  <span>{stats.completedExercises} exercícios</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          title="Peso Atual"
          value={`${currentWeight} kg`}
          subtitle={weightProgress ? `Faltam ${Math.abs(weightProgress.difference).toFixed(1)}kg` : 'Meta definida'}
          icon={TrendingUp}
          color="lime"
        />
        <StatCard
          title="IMC"
          value={imc.value}
          subtitle={imc.classification}
          icon={Target}
          color="blue"
        />
      </div>

      {/* Treino de hoje */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Treino de Hoje</h3>
          <Button variant="ghost" size="sm" className="text-lime-500">
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {todayWorkout ? (
          <WorkoutCard
            workout={todayWorkout}
            onStart={() => todayKey && startWorkout(todayKey)}
          />
        ) : (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhum treino programado para hoje</p>
            <Button variant="outline" className="mt-3">
              Adicionar Treino
            </Button>
          </Card>
        )}
      </div>

      {/* Próximos treinos */}
      {upcomingWorkouts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Próximos Treinos</h3>
          <div className="space-y-3">
            {upcomingWorkouts.map(([day, workout]) => (
              workout && (
                <WorkoutCard
                  key={day}
                  workout={workout}
                  dayName={getDayName(day as DayOfWeek)}
                  showDay
                />
              )
            ))}
          </div>
        </div>
      )}

      {/* Atalhos rápidos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Atalhos Rápidos</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="font-medium">Calculadora IMC</p>
            <p className="text-xs text-muted-foreground">Calcule seu índice</p>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="font-medium">% Gordura</p>
            <p className="text-xs text-muted-foreground">Estime seu percentual</p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
