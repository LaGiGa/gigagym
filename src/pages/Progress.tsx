// Página de Progresso Corporal

import { useState, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus,
  Target,
  Activity,
  ChevronRight
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/custom/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBodyMetrics } from '@/hooks/useBodyMetrics';
import { useApp } from '@/store/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export function Progress() {
  const { state } = useApp();
  const { 
    currentWeight, 
    weightHistory, 
    getCurrentIMC, 
    getWeightProgress,
    getWeightStats,
    getChartData,
    addWeight
  } = useBodyMetrics();
  
  const [newWeight, setNewWeight] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const imc = getCurrentIMC();
  const weightProgress = getWeightProgress();
  const weightStats = getWeightStats();
  const chartData = getChartData();
  
  const handleAddWeight = useCallback(() => {
    const weight = parseFloat(newWeight);
    if (weight > 0) {
      addWeight(weight);
      setNewWeight('');
      setShowAddDialog(false);
    }
  }, [newWeight, addWeight]);

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Seu Progresso</h2>
        <p className="text-muted-foreground">
          Acompanhe sua evolução
        </p>
      </div>

      {/* Peso atual */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-lime-500/10 to-lime-600/5 border-lime-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Peso Atual</p>
            <p className="text-4xl font-bold">{currentWeight} <span className="text-lg text-muted-foreground">kg</span></p>
            
            {weightProgress && (
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'text-sm font-medium',
                  weightProgress.difference > 0 ? 'text-red-500' : 'text-green-500'
                )}>
                  {weightProgress.difference > 0 ? '+' : ''}{weightProgress.difference}kg
                </span>
                <span className="text-sm text-muted-foreground">
                  da meta ({state.profile.targetWeight}kg)
                </span>
              </div>
            )}
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-lime-500 hover:bg-lime-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Novo Peso</DialogTitle>
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
                <Button 
                  onClick={handleAddWeight}
                  className="w-full bg-lime-500 hover:bg-lime-600"
                  disabled={!newWeight}
                >
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          title="IMC"
          value={imc.value}
          subtitle={imc.classification}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Meta"
          value={`${state.profile.targetWeight || '-'} kg`}
          subtitle={weightProgress?.isGoalReached ? 'Meta alcançada!' : 'Em progresso'}
          icon={Target}
          color={weightProgress?.isGoalReached ? 'green' : 'orange'}
        />
      </div>

      {/* Gráfico de evolução */}
      {chartData.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Evolução do Peso</h3>
          <Card className="p-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={10}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px'
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

      {/* Histórico de peso */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Histórico</h3>
        <div className="space-y-2">
          {weightHistory.slice(0, 5).map((entry, index) => {
            const prevEntry = weightHistory[index + 1];
            const change = prevEntry ? entry.weight - prevEntry.weight : 0;
            
            return (
              <Card key={entry.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      change < 0 ? 'bg-green-500/10 text-green-500' :
                      change > 0 ? 'bg-red-500/10 text-red-500' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {change < 0 ? <TrendingDown className="w-4 h-4" /> :
                       change > 0 ? <TrendingUp className="w-4 h-4" /> :
                       <Minus className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{entry.weight} kg</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {change !== 0 && (
                    <span className={cn(
                      'text-sm font-medium',
                      change < 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {change > 0 ? '+' : ''}{change.toFixed(1)}kg
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        
        {weightHistory.length > 5 && (
          <Button variant="ghost" className="w-full mt-2 text-lime-500">
            Ver histórico completo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Estatísticas gerais */}
      {weightStats && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Estatísticas</h3>
          <Card className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Peso Máximo</p>
                <p className="font-medium">{weightStats.max} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peso Mínimo</p>
                <p className="font-medium">{weightStats.min} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Média</p>
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
