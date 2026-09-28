import { useState } from 'react';
import {
  Apple,
  ChevronDown,
  ChevronUp,
  Droplets,
  Dumbbell,
  Flame,
  Minus,
  Pill,
  Plus,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Target,
  Clock,
  Share2,
  Check,
  Calendar,
  ShieldCheck,
  Utensils,
  Settings2,
  Trash2,
  User,
  Zap,
  Activity,
  Heart
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/store/AppContext';
import { generateSmartPlan } from '@/utils/planGenerator';
import { generateGroqPlan } from '@/lib/groq';
import { getTrainingGoalName } from '@/utils/calculations';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { TrainingGoal, UserGender, UserExperience, SmartPlan } from '@/types';

export function HealthPlan() {
  const {
    state,
    setCurrentPlan,
    clearCurrentPlan,
    updateProfile,
    addWeightEntry,
    updatePlanWater,
    togglePlanMeal,
    togglePlanSupplement,
  } = useApp();
  const { currentPlan, profile, bodyMetrics } = state;

  const [activeTab, setActiveTab] = useState<'diet' | 'supplements' | 'water' | 'ai'>('diet');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMealId, setExpandedMealId] = useState<string | null>('meal_1');
  const [selectedSuppCategory, setSelectedSuppCategory] = useState<string>('todos');
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states para criação/ajuste do plano
  const [formName, setFormName] = useState(profile.name || '');
  const [formGender, setFormGender] = useState<UserGender>(profile.gender || 'masculino');
  const [formAge, setFormAge] = useState(profile.age && profile.age > 0 ? profile.age : 26);
  const [formWeight, setFormWeight] = useState(
    bodyMetrics.currentWeight && bodyMetrics.currentWeight > 0
      ? bodyMetrics.currentWeight
      : profile.initialWeight && profile.initialWeight > 0
      ? profile.initialWeight
      : 75
  );
  const [formHeight, setFormHeight] = useState(profile.height && profile.height > 0 ? profile.height : 175);
  const [formGoal, setFormGoal] = useState<TrainingGoal>(profile.goal || 'hipertrofia');
  const [formExperience, setFormExperience] = useState<UserExperience>(profile.experienceLevel || 'iniciante');

  // O plano ativo só existe se o usuário tiver gerado um plano estruturado
  const activePlan: SmartPlan | null = currentPlan && currentPlan.macroTargets ? currentPlan : null;

  const handleCreateOrUpdatePlan = async (isRecalculating = false) => {
    if (!formWeight || formWeight <= 0) {
      toast.error('Por favor, informe seu peso atual.');
      return;
    }
    if (!formHeight || formHeight <= 0) {
      toast.error('Por favor, informe sua altura em cm.');
      return;
    }

    setIsLoading(true);
    toast.info('Calculando TMB, TDEE, macros e montando seu cardápio...');

    try {
      // 1. Atualiza o perfil e métricas com os novos dados informados
      updateProfile({
        name: formName.trim() || profile.name || 'Atleta',
        gender: formGender,
        age: Number(formAge),
        height: Number(formHeight),
        goal: formGoal,
        experienceLevel: formExperience,
        initialWeight: Number(formWeight),
      });

      addWeightEntry({
        id: uuidv4(),
        date: new Date().toISOString(),
        weight: Number(formWeight),
        notes: isRecalculating ? 'Ajuste de métricas do plano' : 'Criação do plano de saúde',
      });

      // 2. Gera plano algorítmico personalizado de precisão
      const basePlan = generateSmartPlan(formGoal, {
        name: formName.trim() || profile.name || 'Atleta',
        age: Number(formAge),
        height: Number(formHeight),
        weight: Number(formWeight),
        gender: formGender,
        experienceLevel: formExperience,
      });

      // 3. Tenta enriquecer com IA Groq se disponível
      const groqData = await generateGroqPlan({
        name: formName.trim() || profile.name || 'Atleta',
        age: Number(formAge),
        height: Number(formHeight),
        weight: Number(formWeight),
        goal: formGoal,
        gender: formGender,
        experienceLevel: formExperience,
      });

      if (groqData && groqData.suggestions) {
        setCurrentPlan({
          ...basePlan,
          diet: groqData.diet || basePlan.diet,
          supplementation: groqData.supplementation || basePlan.supplementation,
          suggestions: groqData.suggestions.map((s: { id?: string; specialistType: 'nutrologa' | 'nutricionista' | 'personal'; title: string; content: string; date?: string }) => ({
            ...s,
            id: s.id || Math.random().toString(),
            date: s.date || new Date().toISOString(),
          })),
        });
        toast.success('Plano personalizado gerado com sucesso com IA!');
      } else {
        setCurrentPlan(basePlan);
        toast.success('Plano mestre personalizado gerado com base nas suas métricas!');
      }

      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      const fallback = generateSmartPlan(formGoal, {
        name: formName.trim() || profile.name || 'Atleta',
        age: Number(formAge),
        height: Number(formHeight),
        weight: Number(formWeight),
        gender: formGender,
        experienceLevel: formExperience,
      });
      setCurrentPlan(fallback);
      toast.info('Plano calculado offline com base nas suas métricas corporais.');
      setShowEditModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToNewPlan = () => {
    if (confirm('Deseja excluir o plano atual e preencher novas informações do zero?')) {
      clearCurrentPlan();
      toast.info('Plano anterior removido. Preencha seus dados para criar um novo.');
    }
  };

  const handleAddWater = (ml: number) => {
    updatePlanWater(ml);
    toast.success(`+${ml}ml de água registrados!`, { duration: 1500 });
  };

  const handleResetWater = () => {
    if (activePlan?.waterConsumed) {
      updatePlanWater(-activePlan.waterConsumed);
      toast.info('Contador de água zerado.');
    }
  };

  const handleCopyPlanSummary = () => {
    if (!activePlan) return;
    const summary = `🏋️ GiGaGym - Plano Mestre (${getTrainingGoalName(activePlan.goal)})\n` +
      `🔥 Meta Calórica: ${activePlan.macroTargets?.calories || 2000} kcal\n` +
      `🍗 Proteínas: ${activePlan.macroTargets?.protein || 150}g | 🍞 Carbos: ${activePlan.macroTargets?.carbs || 200}g | 🥑 Gorduras: ${activePlan.macroTargets?.fats || 60}g\n` +
      `💧 Meta de Água: ${(activePlan.waterTarget || 3000) / 1000}L/dia\n` +
      `✨ Gerado por GiGaGym Elite`;
    navigator.clipboard.writeText(summary);
    toast.success('Resumo do plano copiado para a área de transferência!');
  };

  // Componente de Formulário Reutilizável
  const renderPlanForm = (isModal = false) => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-bold text-muted-foreground uppercase">Seu Nome / Como quer ser chamado</Label>
        <Input
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Ex: João Silva"
          className="mt-1 h-12 rounded-xl border-border/80"
        />
      </div>

      <div>
        <Label className="text-xs font-bold text-muted-foreground uppercase">Sexo Biológico (Para taxa metabólica basal)</Label>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          <button
            type="button"
            onClick={() => setFormGender('masculino')}
            className={cn(
              'h-12 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95',
              formGender === 'masculino'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border/70 text-muted-foreground hover:bg-accent/20'
            )}
          >
            <User className="w-4 h-4" />
            Masculino
          </button>
          <button
            type="button"
            onClick={() => setFormGender('feminino')}
            className={cn(
              'h-12 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95',
              formGender === 'feminino'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border/70 text-muted-foreground hover:bg-accent/20'
            )}
          >
            <Heart className="w-4 h-4" />
            Feminino
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase">Idade</Label>
          <Input
            type="number"
            min={12}
            max={100}
            value={formAge}
            onChange={(e) => setFormAge(Number(e.target.value))}
            className="mt-1 h-12 rounded-xl text-center font-bold"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase">Peso (kg)</Label>
          <Input
            type="number"
            step="0.1"
            min={30}
            max={300}
            value={formWeight}
            onChange={(e) => setFormWeight(Number(e.target.value))}
            className="mt-1 h-12 rounded-xl text-center font-bold"
          />
        </div>

        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase">Altura (cm)</Label>
          <Input
            type="number"
            min={100}
            max={230}
            value={formHeight}
            onChange={(e) => setFormHeight(Number(e.target.value))}
            className="mt-1 h-12 rounded-xl text-center font-bold"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-bold text-muted-foreground uppercase">Objetivo Principal do Plano</Label>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          {[
            { id: 'hipertrofia', title: 'Hipertrofia', desc: 'Ganho de massa e força', icon: Dumbbell, color: 'text-orange-500' },
            { id: 'emagrecimento', title: 'Emagrecimento', desc: 'Queima de gordura e déficit', icon: Flame, color: 'text-red-500' },
            { id: 'manutencao', title: 'Manutenção', desc: 'Saúde e equilíbrio estável', icon: ShieldCheck, color: 'text-green-500' },
            { id: 'condicionamento', title: 'Condicionamento', desc: 'Resistência aeróbica', icon: Zap, color: 'text-blue-500' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = formGoal === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormGoal(item.id as TrainingGoal)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between h-20',
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'bg-card border-border/70 hover:border-border'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">{item.title}</span>
                  <Icon className={cn('w-4 h-4', item.color)} />
                </div>
                <span className="text-[10px] text-muted-foreground">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-xs font-bold text-muted-foreground uppercase">Nível de Treino</Label>
        <div className="grid grid-cols-3 gap-2 mt-1.5">
          {(['iniciante', 'intermediario', 'avancado'] as UserExperience[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFormExperience(level)}
              className={cn(
                'h-10 rounded-xl border text-xs font-bold capitalize transition-all active:scale-95',
                formExperience === level
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card border-border/70 text-muted-foreground hover:bg-accent/20'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => handleCreateOrUpdatePlan(isModal)}
        disabled={isLoading}
        className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-energy text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all gap-2 mt-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Calculando Metas & IA...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 fill-current" />
            {isModal ? 'Atualizar Meu Plano com Esses Dados' : 'Gerar Meu Plano Personalizado'}
          </>
        )}
      </Button>
    </div>
  );

  // TELA INICIAL: Nenhum plano criado ainda -> Tela de personalização/configuração
  if (!activePlan) {
    return (
      <PageContainer>
        <div className="py-2 animate-in fade-in duration-300">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-primary border-primary/30 bg-primary/10">
                Novo Plano
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">Personalização Biológica</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Montar Meu Plano de Saúde</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Preencha suas informações abaixo para calcularmos suas <strong>calorias</strong>, <strong>divisão de macros</strong>, <strong>cardápio completo</strong> e <strong>suplementos</strong> sob medida para você.
            </p>
          </div>

          <Card className="p-4 sm:p-5 rounded-2xl border-border/70 bg-card shadow-sm mb-8">
            {renderPlanForm(false)}
          </Card>
        </div>
      </PageContainer>
    );
  }

  // CÁLCULOS DO PLANO ATIVO EXISTENTE
  const macros = activePlan.macroTargets || {
    calories: 2200,
    protein: 150,
    carbs: 230,
    fats: 65,
    fiber: 28,
  };
  const waterTarget = activePlan.waterTarget || 2800;
  const todayStr = new Date().toISOString().slice(0, 10);
  const waterConsumed = activePlan.waterLogDate === todayStr ? (activePlan.waterConsumed || 0) : 0;
  const waterPercent = Math.min(100, Math.round((waterConsumed / waterTarget) * 100));

  const mealsList = activePlan.meals || [];
  const completedMealsCount = mealsList.filter((m) => m.completed).length;
  const mealsPercent = mealsList.length > 0 ? Math.round((completedMealsCount / mealsList.length) * 100) : 0;

  const supplementsList = activePlan.supplements || [];
  const filteredSupplements = selectedSuppCategory === 'todos'
    ? supplementsList
    : supplementsList.filter((s) => s.timing === selectedSuppCategory);

  const takenSuppsCount = supplementsList.filter((s) => s.takenToday).length;

  return (
    <PageContainer>
      {/* Top Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-primary border-primary/30 bg-primary/10">
              Health & Diet Hub
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {getTrainingGoalName(activePlan.goal)}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Plano Alimentar & Saúde</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyPlanSummary}
            title="Copiar resumo"
            className="rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
            className="rounded-xl text-xs font-semibold gap-1.5 px-3 border-border/80 hover:border-primary/50"
          >
            <Settings2 className="w-3.5 h-3.5 text-primary" />
            Ajustar Dados
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetToNewPlan}
            title="Zerar e criar novo plano"
            className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal de Ajuste de Dados */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Ajustar Informações do Plano
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-4">
              Atualize seu peso atual, objetivo ou nível para recalcularmos instantaneamente suas calorias e cardápio.
            </p>
            {renderPlanForm(true)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'diet' | 'supplements' | 'water' | 'ai')} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4 h-12 p-1 bg-muted/60 rounded-2xl">
          <TabsTrigger value="diet" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Utensils className="w-4 h-4 text-green-500" />
            <span className="hidden sm:inline">Dieta &</span> Macros
          </TabsTrigger>
          <TabsTrigger value="supplements" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Pill className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Suplementos</span>
            <span className="sm:hidden">Suplem.</span>
          </TabsTrigger>
          <TabsTrigger value="water" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Droplets className="w-4 h-4 text-sky-500" />
            Água
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            IA & Dicas
          </TabsTrigger>
        </TabsList>

        {/* ================= ABA 1: DIETA & MACROS ================= */}
        <TabsContent value="diet" className="space-y-4 animate-in fade-in duration-200">
          {/* Card Resumo de Calorias & Macros */}
          <Card className="p-4 sm:p-5 rounded-2xl border-border/70 bg-gradient-to-br from-card via-card to-primary/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta Calórica Diária</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black tracking-tight text-foreground">{macros.calories}</span>
                  <span className="text-xs font-bold text-primary uppercase">kcal / dia</span>
                </div>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Barra de Distribuição de Macros */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] font-bold text-muted-foreground mb-1.5">
                <span>Distribuição calórica</span>
                <span>P: {macros.protein}g | C: {macros.carbs}g | G: {macros.fats}g</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${Math.round(((macros.protein * 4) / macros.calories) * 100)}%` }}
                  title="Proteínas"
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${Math.round(((macros.carbs * 4) / macros.calories) * 100)}%` }}
                  title="Carboidratos"
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${Math.round(((macros.fats * 9) / macros.calories) * 100)}%` }}
                  title="Gorduras"
                />
              </div>
            </div>

            {/* 3 Blocos de Macros */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider block">Proteína</span>
                <span className="text-lg font-black text-foreground">{macros.protein}g</span>
                <span className="text-[9px] text-muted-foreground block">
                  {profile.initialWeight ? `~${(macros.protein / profile.initialWeight).toFixed(1)}g/kg` : 'Base'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block">Carboidratos</span>
                <span className="text-lg font-black text-foreground">{macros.carbs}g</span>
                <span className="text-[9px] text-muted-foreground block">Energia Limpa</span>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">Gorduras</span>
                <span className="text-lg font-black text-foreground">{macros.fats}g</span>
                <span className="text-[9px] text-muted-foreground block">Hormonal</span>
              </div>
            </div>
          </Card>

          {/* Progresso de Aderência Diária */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-bold text-foreground">Cardápio do Dia</h3>
              <p className="text-xs text-muted-foreground">{completedMealsCount} de {mealsList.length} refeições realizadas hoje</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${mealsPercent}%` }} />
              </div>
              <span className="text-xs font-bold text-green-500">{mealsPercent}%</span>
            </div>
          </div>

          {/* Lista de Refeições com Acordeão e Substituições */}
          <div className="space-y-3">
            {mealsList.map((meal) => {
              const isExpanded = expandedMealId === meal.id;

              return (
                <Card
                  key={meal.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border transition-all duration-200',
                    meal.completed ? 'bg-green-500/5 border-green-500/30' : 'bg-card border-border/70 hover:border-border'
                  )}
                >
                  {/* Cabeçalho da Refeição */}
                  <div
                    onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlanMeal(meal.id);
                        }}
                        className={cn(
                          'w-6 h-6 rounded-lg border flex items-center justify-center transition-all active:scale-90 shrink-0',
                          meal.completed
                            ? 'bg-green-500 border-green-500 text-white shadow-sm shadow-green-500/30'
                            : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50'
                        )}
                        title={meal.completed ? 'Desmarcar' : 'Concluir refeição'}
                      >
                        {meal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={cn('font-bold text-sm truncate', meal.completed && 'line-through text-muted-foreground')}>
                            {meal.name}
                          </h4>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md shrink-0">
                            <Clock className="w-3 h-3 text-primary" />
                            {meal.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {meal.calories} kcal • {meal.macros.protein}g P • {meal.macros.carbs}g C • {meal.macros.fats}g G
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Detalhes dos Alimentos & Substituições */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/50 bg-muted/20 space-y-3 animate-in slide-in-from-top-1 duration-200">
                      {/* Alimentos Recomendados */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                          Alimentos & Porções Recomendadas
                        </p>
                        <div className="space-y-1.5">
                          {meal.foods.map((food) => (
                            <div
                              key={food.id}
                              className="flex items-center justify-between text-xs p-2 rounded-xl bg-background/80 border border-border/40"
                            >
                              <span className="font-semibold text-foreground">{food.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-muted-foreground">{food.portion}</span>
                                {food.calories && (
                                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    {food.calories} kcal
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Opções de Substituição Inteligente */}
                      {meal.substitutions && meal.substitutions.length > 0 && (
                        <div className="p-3 rounded-xl bg-background/60 border border-border/40 space-y-1.5">
                          <p className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <RotateCcw className="w-3 h-3" /> Opções de Substituição Prática
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1 pl-1">
                            {meal.substitutions.map((sub, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-primary font-bold">•</span>
                                <span>{sub}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ================= ABA 2: SUPLEMENTAÇÃO ================= */}
        <TabsContent value="supplements" className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-bold text-foreground">Protocolo de Suplementos</h3>
              <p className="text-xs text-muted-foreground">{takenSuppsCount} de {supplementsList.length} tomados hoje</p>
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs font-bold">
              Base Científica
            </Badge>
          </div>

          {/* Filtros de Horário */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'jejum', label: '🌅 Manhã / Jejum' },
              { id: 'pre_treino', label: '⚡ Pré-Treino' },
              { id: 'pos_treino', label: '🥛 Pós-Treino' },
              { id: 'refeicao', label: '🍽️ Com Refeição' },
              { id: 'noite', label: '🌙 Noite' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedSuppCategory(cat.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors border',
                  selectedSuppCategory === cat.id
                    ? 'bg-amber-500 text-black border-amber-500'
                    : 'bg-card border-border/70 text-muted-foreground hover:bg-accent/20'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cards de Suplementos */}
          <div className="space-y-3">
            {filteredSupplements.map((supp) => (
              <Card
                key={supp.id}
                className={cn(
                  'p-4 rounded-2xl border transition-all duration-200',
                  supp.takenToday
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-card border-border/70'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => togglePlanSupplement(supp.id)}
                      className={cn(
                        'w-7 h-7 rounded-xl border flex items-center justify-center transition-all active:scale-90 shrink-0 mt-0.5',
                        supp.takenToday
                          ? 'bg-amber-500 border-amber-500 text-black shadow-sm shadow-amber-500/30'
                          : 'border-muted-foreground/30 bg-muted/20 hover:border-amber-500/50'
                      )}
                      title={supp.takenToday ? 'Desmarcar' : 'Marcar como tomado'}
                    >
                      {supp.takenToday && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={cn('font-bold text-sm', supp.takenToday && 'line-through text-muted-foreground')}>
                          {supp.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {supp.dosage}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {supp.timingLabel}
                      </p>

                      <p className="text-xs text-muted-foreground/90 mt-2 p-2.5 rounded-xl bg-muted/30 border border-border/40 leading-relaxed">
                        <strong>Objetivo:</strong> {supp.purpose}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ================= ABA 3: ÁGUA & HÁBITOS ================= */}
        <TabsContent value="water" className="space-y-4 animate-in fade-in duration-200">
          <Card className="p-6 rounded-3xl border-border/70 bg-gradient-to-br from-card via-card to-sky-500/10 text-center relative overflow-hidden">
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-28 h-28 rounded-full bg-sky-500/10 border-4 border-sky-500/30 flex flex-col items-center justify-center shadow-lg shadow-sky-500/10">
                  <Droplets className="w-8 h-8 text-sky-500 mb-1" />
                  <span className="text-2xl font-black text-foreground">{waterPercent}%</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground">Hidratação de Alta Performance</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Calculada para o seu peso e atividade</p>

              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-4xl font-black text-sky-500">{(waterConsumed / 1000).toFixed(2)}</span>
                <span className="text-sm font-bold text-muted-foreground">/ {(waterTarget / 1000).toFixed(2)} Litros</span>
              </div>

              {/* Botões Rápidos de Adicionar Água */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-xs mt-6">
                <Button
                  onClick={() => handleAddWater(250)}
                  variant="outline"
                  className="rounded-2xl h-14 flex flex-col items-center justify-center border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 text-sky-500 mb-0.5" />
                  <span className="text-xs font-bold">+250ml</span>
                  <span className="text-[9px] text-muted-foreground">Copo</span>
                </Button>

                <Button
                  onClick={() => handleAddWater(500)}
                  className="rounded-2xl h-14 flex flex-col items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-bold active:scale-95 shadow-md shadow-sky-500/20 transition-all"
                >
                  <Plus className="w-4 h-4 mb-0.5" />
                  <span className="text-xs font-bold">+500ml</span>
                  <span className="text-[9px] text-white/80">Garrafa</span>
                </Button>

                <Button
                  onClick={() => handleAddWater(1000)}
                  variant="outline"
                  className="rounded-2xl h-14 flex flex-col items-center justify-center border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 text-sky-500 mb-0.5" />
                  <span className="text-xs font-bold">+1.0L</span>
                  <span className="text-[9px] text-muted-foreground">Garrafão</span>
                </Button>
              </div>

              {waterConsumed > 0 && (
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleAddWater(-250)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/60 hover:bg-accent/20"
                  >
                    <Minus className="w-3 h-3" /> Desfazer 250ml
                  </button>
                  <button
                    type="button"
                    onClick={handleResetWater}
                    className="text-xs text-destructive hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/10"
                  >
                    <RotateCcw className="w-3 h-3" /> Zerar Dia
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Dicas Científicas de Água */}
          <Card className="p-4 rounded-2xl border-border/70 space-y-2 bg-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Por que bater sua meta de água?
            </h4>
            <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <p>• <strong>Transporte de Nutrientes:</strong> A creatina e a glicose precisam de água para saturar os miócitos e gerar força.</p>
              <p>• <strong>Termogênese:</strong> Beber água gelada estimula o metabolismo em até 4-5% pela regulação de temperatura interna.</p>
              <p>• <strong>Recuperação Articular:</strong> A hidratação adequada mantém o líquido sinovial nas articulações com máxima lubrificação.</p>
            </div>
          </Card>
        </TabsContent>

        {/* ================= ABA 4: RECOMENDAÇÕES IA ================= */}
        <TabsContent value="ai" className="space-y-4 animate-in fade-in duration-200">
          {/* Fases do Ciclo de 6 Meses */}
          {activePlan.phases && activePlan.phases.length > 0 && (
            <Card className="p-4 rounded-2xl border-border/70 bg-gradient-to-br from-card to-primary/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">Ciclo Mestre de 6 Meses</h4>
                </div>
                <span className="text-[11px] font-bold text-primary">
                  {format(new Date(activePlan.startDate), 'MMM yy', { locale: ptBR })} - {format(new Date(activePlan.endDate), 'MMM yy', { locale: ptBR })}
                </span>
              </div>

              <div className="space-y-2.5">
                {activePlan.phases.map((phase) => (
                  <div
                    key={phase.phase}
                    className={cn(
                      'p-3 rounded-xl border transition-all',
                      phase.active ? 'bg-primary/10 border-primary/40' : 'bg-background/60 border-border/40'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-foreground">{phase.title}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{phase.focus}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Relatórios dos 3 Especialistas */}
          <div className="space-y-3">
            {activePlan.suggestions.map((sug) => {
              const icons = {
                nutrologa: <Stethoscope className="w-5 h-5 text-blue-500" />,
                nutricionista: <Apple className="w-5 h-5 text-green-500" />,
                personal: <Dumbbell className="w-5 h-5 text-orange-500" />,
              };
              const titles = {
                nutrologa: 'Dra. Metabologia & Hormônios',
                nutricionista: 'Nutrição de Alta Performance',
                personal: 'Coach de Fisiologia & Sobrecarga',
              };

              return (
                <Card key={sug.id} className="p-4 rounded-2xl border-border/70 bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center border border-border/60">
                      {icons[sug.specialistType] || <Target className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{titles[sug.specialistType] || sug.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{sug.specialistType}</p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed space-y-2 p-3 rounded-xl bg-muted/20 border border-border/30">
                    <MarkdownLite content={sug.content} />
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Espaço extra no rodapé */}
      <div className="h-10" />
    </PageContainer>
  );
}

/**
 * Renderizador lite para Markdown estruturado
 */
function MarkdownLite({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed text-foreground/90">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-xs font-black text-primary uppercase mt-3 mb-1">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-sm font-black text-foreground mt-4 mb-2">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-primary font-bold">•</span>
              <p className="flex-1">{processBold(line.replace('- ', ''))}</p>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;

        return <p key={i} className="font-medium text-muted-foreground">{processBold(line)}</p>;
      })}
    </div>
  );
}

function processBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
