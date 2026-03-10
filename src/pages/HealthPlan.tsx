import { useState } from 'react';
import {
    Target,
    Calendar,
    Apple,
    Dumbbell,
    Stethoscope,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/store/AppContext';
import { generateSmartPlan } from '@/utils/planGenerator';
import { generateGroqPlan } from '@/lib/groq';
import { getTrainingGoalName } from '@/utils/calculations';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export function HealthPlan() {
    const { state, setCurrentPlan } = useApp();
    const { currentPlan, profile } = state;
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        toast.info('Consultando especialistas (Groq Cloud)...');

        try {
            const groqData = await generateGroqPlan({
                name: profile.name,
                age: profile.age,
                height: profile.height,
                weight: state.bodyMetrics.currentWeight,
                goal: profile.goal,
                gender: profile.gender || 'não informado',
                experienceLevel: profile.experienceLevel
            });

            if (groqData) {
                const basePlan = generateSmartPlan(profile.goal);
                setCurrentPlan({
                    ...basePlan,
                    diet: groqData.diet || basePlan.diet,
                    supplementation: groqData.supplementation || basePlan.supplementation,
                    suggestions: groqData.suggestions.map((s: any) => ({
                        ...s,
                        id: s.id || Math.random().toString()
                    }))
                });
                toast.success('Plano mestre gerado com sucesso!');
            } else {
                const plan = generateSmartPlan(profile.goal);
                setCurrentPlan(plan);
                toast.warning('Plano básico gerado (API offline)');
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao conectar com a API Groq');
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentPlan) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Seu Plano Mestre de 6 Meses</h2>
                    <p className="text-muted-foreground mb-8 max-w-xs">
                        Ainda não geramos seu planejamento de elite baseado no seu objetivo de {getTrainingGoalName(profile.goal)}.
                    </p>
                    <Button
                        onClick={handleGeneratePlan}
                        size="lg"
                        className="w-full max-w-xs gap-2 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                Sincronizando Dados...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Gerar Plano Groq Cloud
                            </>
                        )}
                    </Button>
                </div>
            </PageContainer>
        );
    }

    const suggestionsBySpecialist = {
        nutrologa: currentPlan.suggestions.find(s => s.specialistType === 'nutrologa'),
        nutricionista: currentPlan.suggestions.find(s => s.specialistType === 'nutricionista'),
        personal: currentPlan.suggestions.find(s => s.specialistType === 'personal'),
    };

    return (
        <PageContainer>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">ELITE AI</span>
                        <h2 className="text-2xl font-bold tracking-tight">Health Ecosystem</h2>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium">Periodização Groq focada em {getTrainingGoalName(currentPlan.goal)}.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="rounded-xl border-dashed hover:border-primary/50 transition-all active:scale-95"
                >
                    <Sparkles className={cn("w-4 h-4 mr-2 text-primary", isLoading && "animate-spin")} />
                    Reset IA
                </Button>
            </div>

            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6 h-14 p-1 bg-muted/50 rounded-2xl">
                    <TabsTrigger value="overview" className="rounded-xl data-[state=active]:shadow-lg"><Target className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="nutrologa" className="rounded-xl data-[state=active]:shadow-lg text-blue-500"><Stethoscope className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="nutrition" className="rounded-xl data-[state=active]:shadow-lg text-green-500"><Apple className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="personal" className="rounded-xl data-[state=active]:shadow-lg text-orange-500"><Dumbbell className="w-4 h-4" /></TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <Card className="p-5 border-none shadow-xl bg-gradient-to-br from-card to-muted/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="flex items-start justify-between relative">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Estratégia Principal</p>
                                <h3 className="text-xl font-bold">Ciclo Mestre 180 Dias</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center shadow-sm">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                            <div className="p-3 rounded-2xl bg-muted/60 border border-border/40">
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Start</p>
                                <p className="font-bold text-sm">{format(new Date(currentPlan.startDate), 'dd MMM yy', { locale: ptBR })}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-primary" />
                            <div className="p-3 rounded-2xl bg-muted/60 border border-border/40">
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Finish</p>
                                <p className="font-bold text-sm">{format(new Date(currentPlan.endDate), 'dd MMM yy', { locale: ptBR })}</p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-3">
                        <SpecialistMiniCard
                            type="nutrologa"
                            title="Macros & Meta"
                            desc={currentPlan.diet || 'Configurando macros...'}
                            onClick={() => setActiveTab('nutrologa')}
                        />
                        <SpecialistMiniCard
                            type="nutricionista"
                            title="Suplementação"
                            desc={currentPlan.supplementation || 'Definindo protocolo...'}
                            onClick={() => setActiveTab('nutrition')}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="nutrologa">
                    <SpecialistDetailView
                        name="Dra. Groq Expert"
                        role="Metabologia e Performance"
                        icon={<Stethoscope className="w-6 h-6" />}
                        suggestion={suggestionsBySpecialist.nutrologa}
                        color="blue"
                    />
                </TabsContent>

                <TabsContent value="nutrition">
                    <SpecialistDetailView
                        name="Nutri Groq Pro"
                        role="Nutrição Esportiva"
                        icon={<Apple className="w-6 h-6" />}
                        suggestion={suggestionsBySpecialist.nutricionista}
                        color="green"
                    />
                </TabsContent>

                <TabsContent value="personal">
                    <SpecialistDetailView
                        name="Coach Groq Elite"
                        role="Fisiologia e Bioestatística"
                        icon={<Dumbbell className="w-6 h-6" />}
                        suggestion={suggestionsBySpecialist.personal}
                        color="orange"
                    />
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
}

function SpecialistMiniCard({ type, title, desc, onClick }: { type: string, title: string, desc: string, onClick: () => void }) {
    const icons = {
        nutrologa: <Target className="w-5 h-5 text-blue-500" />,
        nutricionista: <Sparkles className="w-5 h-5 text-green-500" />,
        personal: <Dumbbell className="w-5 h-5 text-orange-500" />,
    };

    const bgColors = {
        nutrologa: 'bg-blue-500/5 border-blue-500/10',
        nutricionista: 'bg-green-500/5 border-green-500/10',
        personal: 'bg-orange-500/5 border-orange-500/10',
    };

    return (
        <Card
            className={cn("p-5 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] border shadow-sm", bgColors[type as keyof typeof bgColors])}
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background border flex items-center justify-center shadow-sm">
                    {icons[type as keyof typeof icons]}
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{title}</p>
                    <p className="font-bold text-sm truncate max-w-[200px]">{desc}</p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
        </Card>
    );
}

function SpecialistDetailView({ name, role, icon, suggestion, color }: { name: string, role: string, icon: React.ReactNode, suggestion?: any, color: string }) {
    const { state, setCurrentPlan } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(suggestion?.content || '');

    const handleSave = () => {
        if (!state.currentPlan) return;
        const newSuggestions = state.currentPlan.suggestions.map(s =>
            s.id === suggestion?.id ? { ...s, content: editedContent } : s
        );
        setCurrentPlan({ ...state.currentPlan, suggestions: newSuggestions });
        setIsEditing(false);
        toast.success('Plano atualizado com sucesso!');
    };

    const colorMap = {
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        green: 'bg-green-500/10 text-green-500 border-green-500/20',
        orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex items-center gap-4 px-2">
                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center border-2 border-white shadow-xl", colorMap[color as keyof typeof colorMap])}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-black text-lg tracking-tight leading-none mb-1">{name}</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{role}</p>
                </div>
            </div>

            <Card className="p-6 border-none shadow-2xl bg-card/90 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    {icon}
                </div>

                <div className="flex items-center justify-between mb-6 relative">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h4 className="font-bold text-sm uppercase tracking-widest">{suggestion?.title || 'Relatório Técnico'}</h4>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => {
                        setIsEditing(!isEditing);
                        setEditedContent(suggestion?.content || '');
                    }} className="h-8 rounded-full bg-muted/50 text-[10px] font-bold uppercase hover:bg-muted transition-colors px-4">
                        {isEditing ? 'Voltar' : 'Edit'}
                    </Button>
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full min-h-[300px] p-4 rounded-2xl border-2 border-muted bg-background text-sm leading-relaxed focus:border-primary transition-all outline-none font-sans"
                            placeholder="Descreva o novo planejamento..."
                        />
                        <Button onClick={handleSave} className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20">SALVAR PLANO MESTRE</Button>
                    </div>
                ) : (
                    <div className="min-h-[200px]">
                        {suggestion?.content ? (
                            <MarkdownLite content={suggestion.content} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                                <CloudLoader />
                                <p className="text-sm font-medium">Processando relatório Groq Cloud...</p>
                            </div>
                        )}
                    </div>
                )}

                {!isEditing && suggestion?.content && (
                    <div className="mt-8 pt-6 border-t border-dashed flex items-center justify-between">
                        <Button variant="outline" size="sm" className="rounded-2xl h-10 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Exportar PDF</Button>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-muted-foreground font-black uppercase">Validado IA</span>
                            <span className="text-[10px] text-primary font-bold">{format(new Date(), 'dd/MM/yyyy')}</span>
                        </div>
                    </div>
                )}
            </Card>

            <p className="text-[10px] text-center text-muted-foreground italic px-4">
                *Este planejamento é gerado por inteligência artificial e deve ser revisado por profissionais de saúde antes da aplicação prática.
            </p>
        </div>
    );
}

/**
 * Renderizador simples para Markdown para evitar dependências pesadas
 */
function MarkdownLite({ content }: { content: string }) {
    // Processamento básico para negrito, listas e cabeçalhos
    const lines = content.split('\n');

    return (
        <div className="space-y-4 text-sm leading-relaxed text-card-foreground/90">
            {lines.map((line, i) => {
                if (line.startsWith('### ')) {
                    return <h4 key={i} className="text-base font-black text-primary uppercase mt-6 mb-2">{line.replace('### ', '')}</h4>;
                }
                if (line.startsWith('## ')) {
                    return <h3 key={i} className="text-lg font-black text-card-foreground mt-8 mb-3">{line.replace('## ', '')}</h3>;
                }
                if (line.startsWith('- ')) {
                    return (
                        <div key={i} className="flex gap-3 pl-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <p className="flex-1 italic">{processBold(line.replace('- ', ''))}</p>
                        </div>
                    );
                }
                if (line.trim() === '') return <div key={i} className="h-2" />;

                return <p key={i} className="font-medium text-muted-foreground/90">{processBold(line)}</p>;
            })}
        </div>
    );
}

function processBold(text: string) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-primary font-black uppercase tracking-tighter mx-0.5">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

function CloudLoader() {
    return (
        <div className="flex gap-1 items-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
    );
}
