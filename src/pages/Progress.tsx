import { useCallback, useMemo, useState, type ElementType } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Target,
  Activity,
  ChevronRight,
  UserRound,
  Dumbbell,
  ClipboardList,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/custom/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBodyMetrics } from '@/hooks/useBodyMetrics';
import { useApp } from '@/store/AppContext';
import { cn } from '@/lib/utils';

interface ProgressProps {
  onNavigate?: (tab: string) => void;
}

interface NextStep {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  action: () => void;
  icon: ElementType;
}

export function Progress({ onNavigate }: ProgressProps) {
  const { state } = useApp();
  const { currentWeight, weightHistory, getCurrentIMC, getWeightProgress, getWeightStats, getChartData, addWeight } =
    useBodyMetrics();

  const [newWeight, setNewWeight] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const imc = getCurrentIMC();
  const weightProgress = getWeightProgress();
  const weightStats = getWeightStats();
  const chartData = getChartData();

  const hasHistory = weightHistory.length > 0;
  const hasGoal =
    hasHistory && typeof state.profile.targetWeight === 'number' && state.profile.targetWeight > 0;
  const hasUserName = state.profile.name.trim().length > 0;
  const hasWeeklyWorkout = Object.values(state.weeklyWorkouts).some((workout) => workout !== null);
  const userName = hasUserName ? state.profile.name.trim() : 'atleta';

  const historyToDisplay = useMemo(() => {
    if (showAllHistory) return weightHistory;
    return weightHistory.slice(0, 5);
  }, [showAllHistory, weightHistory]);

  const handleAddWeight = useCallback(() => {
    const weight = parseFloat(newWeight);
    if (weight > 0) {
      addWeight(weight);
      setNewWeight('');
      setShowAddDialog(false);
    }
  }, [newWeight, addWeight]);

  const nextSteps = useMemo<NextStep[]>(() => {
    const items: NextStep[] = [];

    if (!hasHistory) {
      items.push({
        id: 'first-weight',
        title: 'Registrar primeiro peso',
        description: 'Crie seu primeiro ponto de progresso para liberar graficos e historico real.',
        actionLabel: 'Registrar agora',
        action: () => setShowAddDialog(true),
        icon: ClipboardList,
      });
    }

    if (!hasUserName || !hasGoal) {
      items.push({
        id: 'profile',
        title: 'Completar perfil',
        description: 'Defina nome, meta de peso e dados pessoais para resultados personalizados.',
        actionLabel: 'Ir para perfil',
        action: () => onNavigate?.('profile'),
        icon: UserRound,
      });
    }

    if (!hasWeeklyWorkout) {
      items.push({
        id: 'workout',
        title: 'Montar treino',
        description: 'Escolha grupos musculares e crie seu plano para comecar os treinos da semana.',
        actionLabel: 'Ir para treinos',
        action: () => onNavigate?.('workouts'),
        icon: Dumbbell,
      });
    }

    if (items.length === 0) {
      items.push({
        id: 'keep-going',
        title: `Tudo pronto, ${userName}`,
        description: 'Continue registrando peso e conclua seus treinos para manter a evolucao em alta.',
        actionLabel: 'Abrir treinos',
        action: () => onNavigate?.('workouts'),
        icon: Target,
      });
    }

    return items.slice(0, 3);
  }, [hasGoal, hasHistory, hasUserName, hasWeeklyWorkout, onNavigate, userName]);

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Seu Progresso</h2>
        <p className="text-muted-foreground">Acompanhe sua evolucao com dados reais</p>
      </div>

      <Card className="p-6 mb-6 bg-gradient-to-br from-lime-500/10 to-lime-600/5 border-lime-500/20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Peso Atual</p>
            <p className="text-4xl font-bold">
              {hasHistory ? currentWeight : '--'} <span className="text-lg text-muted-foreground">kg</span>
            </p>

            {hasHistory && weightProgress && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    weightProgress.difference > 0 ? 'text-red-500' : 'text-green-500'
                  )}
                >
                  {weightProgress.difference > 0 ? '+' : ''}
                  {weightProgress.difference}kg
                </span>
                <span className="text-sm text-muted-foreground">da meta ({state.profile.targetWeight}kg)</span>
              </div>
            )}

            {!hasHistory && <p className="text-sm text-muted-foreground mt-2">Sem registros de peso ainda.</p>}
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <Button onClick={() => setShowAddDialog(true)} className="bg-lime-500 hover:bg-lime-600">
              <Plus className="w-4 h-4 mr-2" />
              Registrar
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar novo peso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 72.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddWeight} className="w-full bg-lime-500 hover:bg-lime-600" disabled={!newWeight}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Proximos passos</h3>
        <div className="space-y-3">
          {nextSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="shrink-0" onClick={step.action}>
                    {step.actionLabel}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          title="IMC"
          value={hasHistory ? imc.value : '--'}
          subtitle={hasHistory ? imc.classification : 'Registre seu peso'}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Meta"
          value={hasGoal ? `${state.profile.targetWeight} kg` : '--'}
          subtitle={hasGoal ? (weightProgress?.isGoalReached ? 'Meta alcancada!' : 'Em progresso') : 'Defina no perfil'}
          icon={Target}
          color={weightProgress?.isGoalReached ? 'green' : 'orange'}
        />
      </div>

      {chartData.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Evolucao do Peso</h3>
          <Card className="p-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#84cc16"
                    strokeWidth={2}
                    dot={{ fill: '#84cc16', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#84cc16' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Historico</h3>
        {!hasHistory && (
          <Card className="p-4">
            <p className="font-medium">Nenhum registro ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione seu primeiro peso para iniciar seu historico pessoal.
            </p>
          </Card>
        )}

        {hasHistory && (
          <div className="space-y-2">
            {historyToDisplay.map((entry, index) => {
              const nextEntry = historyToDisplay[index + 1];
              const change = nextEntry ? entry.weight - nextEntry.weight : 0;

              return (
                <Card key={entry.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          change < 0
                            ? 'bg-green-500/10 text-green-500'
                            : change > 0
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {change < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : change > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{entry.weight} kg</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {change !== 0 && (
                      <span className={cn('text-sm font-medium', change < 0 ? 'text-green-500' : 'text-red-500')}>
                        {change > 0 ? '+' : ''}
                        {change.toFixed(1)}kg
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {weightHistory.length > 5 && (
          <Button variant="ghost" className="w-full mt-2 text-lime-500" onClick={() => setShowAllHistory((prev) => !prev)}>
            {showAllHistory ? 'Mostrar menos' : 'Ver historico completo'}
            <ChevronRight className={cn('w-4 h-4 ml-1 transition-transform', showAllHistory && 'rotate-90')} />
          </Button>
        )}
      </div>

      {weightStats && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Estatisticas</h3>
          <Card className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Peso maximo</p>
                <p className="font-medium">{weightStats.max} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peso minimo</p>
                <p className="font-medium">{weightStats.min} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Media</p>
                <p className="font-medium">{weightStats.average} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registros</p>
                <p className="font-medium">{weightStats.entries}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

    </PageContainer>
  );
}
