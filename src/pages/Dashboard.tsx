import { useState } from 'react';
import { Calendar, ChevronRight, Flame, Target, TrendingUp } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/custom/StatCard';
import { WorkoutCard } from '@/components/custom/WorkoutCard';
import { WorkoutChecklist } from '@/pages/WorkoutChecklist';
import { ProgressRing } from '@/components/custom/ProgressRing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store/AppContext';
import { useWorkout } from '@/hooks/useWorkout';
import { useBodyMetrics } from '@/hooks/useBodyMetrics';
import { getDayName, getMotivationalQuote } from '@/utils/calculations';
import type { DayOfWeek } from '@/types';

export function Dashboard() {
  const { state } = useApp();
  const { weeklyWorkouts, getWeeklyStats, startWorkout } = useWorkout();
  const { currentWeight, getCurrentIMC, getWeightProgress } = useBodyMetrics();
  const [checklistDay, setChecklistDay] = useState<DayOfWeek | null>(null);

  const stats = getWeeklyStats();
  const imc = getCurrentIMC();
  const weightProgress = getWeightProgress();
  const motivationalQuote = getMotivationalQuote();
  const hasWeightData = state.weightHistory.length > 0;

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
  const dayMapping: Record<string, DayOfWeek> = {
    'segunda-feira': 'segunda',
    'terca-feira': 'terca',
    'terça-feira': 'terca',
    'quarta-feira': 'quarta',
    'quinta-feira': 'quinta',
    'sexta-feira': 'sexta',
    sabado: 'sabado',
    'sábado': 'sabado',
    domingo: 'domingo',
  };
  const todayKey = dayMapping[today];
  const todayWorkout = todayKey ? weeklyWorkouts[todayKey] : null;

  const upcomingWorkouts = Object.entries(weeklyWorkouts)
    .filter(([, workout]) => workout !== null)
    .slice(0, 3);

  const handleStartTodayWorkout = () => {
    if (!todayKey) return;
    startWorkout(todayKey);
    setChecklistDay(todayKey);
  };

  if (checklistDay) {
    return <WorkoutChecklist day={checklistDay} onBack={() => setChecklistDay(null)} />;
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{state.profile.name ? `Ola, ${state.profile.name}!` : 'Ola!'}</h2>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      <Card className="p-4 mb-6 bg-gradient-to-r from-primary/15 to-accent/10 border-primary/30">
        <p className="text-sm font-medium text-primary">{motivationalQuote}</p>
      </Card>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Progresso da Semana</h3>
        <Card className="p-4">
          {stats.totalWorkouts > 0 ? (
            <div className="flex items-center gap-4">
              <ProgressRing progress={stats.completionRate} size={100} strokeWidth={8}>
                <div className="text-center">
                  <span className="text-2xl font-bold">{stats.completedWorkouts}</span>
                  <span className="text-muted-foreground">/{stats.totalWorkouts}</span>
                </div>
              </ProgressRing>

              <div className="flex-1">
                <p className="font-medium">{stats.completionRate}% concluido</p>
                <p className="text-sm text-muted-foreground">
                  {stats.completedWorkouts} de {stats.totalWorkouts} treinos finalizados
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{stats.completedExercises} exercicios</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-medium">Sem treinos na semana</p>
              <p className="text-sm text-muted-foreground mt-1">
                Monte seu plano na aba Treinos para acompanhar progresso real.
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          title="Peso Atual"
          value={hasWeightData ? `${currentWeight} kg` : '--'}
          subtitle={
            hasWeightData && weightProgress
              ? `Faltam ${Math.abs(weightProgress.difference).toFixed(1)}kg`
              : 'Registre seu peso'
          }
          icon={TrendingUp}
          color="lime"
        />
        <StatCard
          title="IMC"
          value={hasWeightData ? imc.value : '--'}
          subtitle={hasWeightData ? imc.classification : 'Sem dados ainda'}
          icon={Target}
          color="blue"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Treino de Hoje</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {todayWorkout ? (
          <WorkoutCard
            workout={todayWorkout}
            onStart={handleStartTodayWorkout}
            onClick={() => todayKey && setChecklistDay(todayKey)}
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

      {upcomingWorkouts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Proximos Treinos</h3>
          <div className="space-y-3">
            {upcomingWorkouts.map(([day, workout]) =>
              workout ? (
                <WorkoutCard
                  key={day}
                  workout={workout}
                  dayName={getDayName(day as DayOfWeek)}
                  showDay
                  onClick={() => setChecklistDay(day as DayOfWeek)}
                />
              ) : null
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Atalhos Rapidos</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="font-medium">Calculadora IMC</p>
            <p className="text-xs text-muted-foreground">Calcule seu indice</p>
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
