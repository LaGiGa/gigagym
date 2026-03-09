// Página de Calculadoras

import { useEffect, useState } from 'react';
import { Calculator, Info, User } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/store/AppContext';
import { calculateIMC, calculateBodyFat } from '@/utils/calculations';
import type { IMCCResult, BodyFatResult } from '@/types';
import { cn } from '@/lib/utils';

export function Calculators() {
  const { state } = useApp();
  const { profile } = state;
  const hasWeightData = state.weightHistory.length > 0;
  const isFreshUser = state.weightHistory.length === 0 && !profile.name.trim();
  
  // IMC Calculator
  const [imcWeight, setImcWeight] = useState(hasWeightData ? state.bodyMetrics.currentWeight.toString() : '');
  const [imcHeight, setImcHeight] = useState(isFreshUser ? '' : profile.height.toString());
  const [imcResult, setImcResult] = useState<IMCCResult | null>(null);
  
  // Body Fat Calculator
  const [bfGender, setBfGender] = useState<'masculino' | 'feminino'>(profile.gender);
  const [bfAge, setBfAge] = useState(isFreshUser ? '' : profile.age.toString());
  const [bfHeight, setBfHeight] = useState(isFreshUser ? '' : profile.height.toString());
  const [bfWeight, setBfWeight] = useState(hasWeightData ? state.bodyMetrics.currentWeight.toString() : '');
  const [bfNeck, setBfNeck] = useState('');
  const [bfWaist, setBfWaist] = useState('');
  const [bfHip, setBfHip] = useState('');
  const [bfResult, setBfResult] = useState<BodyFatResult | null>(null);
  const [activeCalculatorTab, setActiveCalculatorTab] = useState<'imc' | 'bodyfat'>('imc');

  useEffect(() => {
    const preferredTab = sessionStorage.getItem('gigagym_calculator_tab');
    if (preferredTab === 'imc' || preferredTab === 'bodyfat') {
      setActiveCalculatorTab(preferredTab);
      sessionStorage.removeItem('gigagym_calculator_tab');
    }
  }, []);

  const handleCalculateIMC = () => {
    const weight = parseFloat(imcWeight);
    const height = parseFloat(imcHeight);
    
    if (weight > 0 && height > 0) {
      setImcResult(calculateIMC(weight, height));
    }
  };

  const handleCalculateBodyFat = () => {
    const measurements = {
      gender: bfGender,
      age: parseInt(bfAge),
      height: parseFloat(bfHeight),
      weight: parseFloat(bfWeight),
      neck: parseFloat(bfNeck),
      waist: parseFloat(bfWaist),
      hip: bfGender === 'feminino' ? parseFloat(bfHip) : undefined
    };
    
    if (measurements.neck > 0 && measurements.waist > 0) {
      if (bfGender === 'feminino' && !measurements.hip) {
        return;
      }
      setBfResult(calculateBodyFat(measurements));
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Calculadoras</h2>
        <p className="text-muted-foreground">
          Calcule seus indicadores corporais
        </p>
      </div>

      <Tabs value={activeCalculatorTab} onValueChange={(value) => setActiveCalculatorTab(value as 'imc' | 'bodyfat')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="imc">IMC</TabsTrigger>
          <TabsTrigger value="bodyfat">% Gordura</TabsTrigger>
        </TabsList>

        {/* IMC Calculator */}
        <TabsContent value="imc">
          <Card className="p-4 mb-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="imc-weight">Peso (kg)</Label>
                <Input
                  id="imc-weight"
                  type="number"
                  step="0.1"
                  value={imcWeight}
                  onChange={(e) => setImcWeight(e.target.value)}
                  placeholder="Ex: 70.5"
                />
              </div>
              
              <div>
                <Label htmlFor="imc-height">Altura (cm)</Label>
                <Input
                  id="imc-height"
                  type="number"
                  value={imcHeight}
                  onChange={(e) => setImcHeight(e.target.value)}
                  placeholder="Ex: 175"
                />
              </div>
              
              <Button 
                onClick={handleCalculateIMC}
                className="w-full bg-lime-500 hover:bg-lime-600"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calcular IMC
              </Button>
            </div>
          </Card>

          {imcResult && (
            <Card className="p-6 mb-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Seu IMC</p>
                <p className="text-5xl font-bold" style={{ color: imcResult.color }}>
                  {imcResult.value}
                </p>
                <p className="text-lg font-medium mt-2" style={{ color: imcResult.color }}>
                  {imcResult.classification}
                </p>
              </div>
              
              {/* IMC Scale */}
              <div className="mt-6">
                <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 relative">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-800 shadow-lg transition-all"
                    style={{ 
                      left: `${Math.min(100, Math.max(0, (imcResult.value - 15) / 20 * 100))}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>15</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>35</span>
                </div>
              </div>
            </Card>
          )}

          {/* IMC Info */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-2">Classificações do IMC</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Abaixo do peso</span>
                    <span className="text-amber-500">&lt; 18.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peso normal</span>
                    <span className="text-lime-500">18.5 - 24.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sobrepeso</span>
                    <span className="text-orange-500">25 - 29.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Obesidade</span>
                    <span className="text-red-500">≥ 30</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Body Fat Calculator */}
        <TabsContent value="bodyfat">
          <Card className="p-4 mb-4">
            <div className="space-y-4">
              <div>
                <Label>Sexo</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={bfGender === 'masculino' ? 'default' : 'outline'}
                    onClick={() => setBfGender('masculino')}
                    className={cn(
                      'flex-1',
                      bfGender === 'masculino' && 'bg-lime-500 hover:bg-lime-600'
                    )}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Masculino
                  </Button>
                  <Button
                    type="button"
                    variant={bfGender === 'feminino' ? 'default' : 'outline'}
                    onClick={() => setBfGender('feminino')}
                    className={cn(
                      'flex-1',
                      bfGender === 'feminino' && 'bg-lime-500 hover:bg-lime-600'
                    )}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Feminino
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bf-age">Idade</Label>
                  <Input
                    id="bf-age"
                    type="number"
                    value={bfAge}
                    onChange={(e) => setBfAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bf-height">Altura (cm)</Label>
                  <Input
                    id="bf-height"
                    type="number"
                    value={bfHeight}
                    onChange={(e) => setBfHeight(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bf-weight">Peso (kg)</Label>
                <Input
                  id="bf-weight"
                  type="number"
                  step="0.1"
                  value={bfWeight}
                  onChange={(e) => setBfWeight(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bf-neck">Pescoço (cm)</Label>
                  <Input
                    id="bf-neck"
                    type="number"
                    step="0.1"
                    value={bfNeck}
                    onChange={(e) => setBfNeck(e.target.value)}
                    placeholder="Circunferência"
                  />
                </div>
                <div>
                  <Label htmlFor="bf-waist">Cintura (cm)</Label>
                  <Input
                    id="bf-waist"
                    type="number"
                    step="0.1"
                    value={bfWaist}
                    onChange={(e) => setBfWaist(e.target.value)}
                    placeholder="Circunferência"
                  />
                </div>
              </div>
              
              {bfGender === 'feminino' && (
                <div>
                  <Label htmlFor="bf-hip">Quadril (cm)</Label>
                  <Input
                    id="bf-hip"
                    type="number"
                    step="0.1"
                    value={bfHip}
                    onChange={(e) => setBfHip(e.target.value)}
                    placeholder="Circunferência"
                  />
                </div>
              )}
              
              <Button 
                onClick={handleCalculateBodyFat}
                className="w-full bg-lime-500 hover:bg-lime-600"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calcular % Gordura
              </Button>
            </div>
          </Card>

          {bfResult && (
            <Card className="p-6 mb-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Percentual de Gordura Estimado</p>
                <p className="text-5xl font-bold" style={{ color: bfResult.color }}>
                  {bfResult.value}%
                </p>
                <p className="text-lg font-medium mt-2" style={{ color: bfResult.color }}>
                  {bfResult.classification}
                </p>
              </div>
            </Card>
          )}

          {/* Body Fat Info */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-2">Sobre a Calculadora</p>
                <p className="text-sm text-muted-foreground">
                  Esta calculadora utiliza a fórmula da Marinha dos EUA para estimar 
                  o percentual de gordura corporal baseado em medidas antropométricas. 
                  O resultado é uma estimativa e pode variar de outros métodos.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
