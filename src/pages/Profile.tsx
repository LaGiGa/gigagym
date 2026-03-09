// Página de Perfil e Configurações

import { useState } from 'react';
import { User, Moon, Sun, Bell, Volume2, Trash2, Download, Upload, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useApp } from '@/store/AppContext';
import { usePWA } from '@/hooks/usePWA';
import type { TrainingGoal } from '@/types';
import { getGoalName } from '@/utils/calculations';
import { exportAllData, importAllData } from '@/utils/storage';
import { cn } from '@/lib/utils';

export function Profile() {
  const { state, updateProfile, updateSettings, resetAllData, forceLocalBackup, lastLocalSaveAt, addWeightEntry } = useApp();
  const { promptInstall, isInstallable, isInstalled } = usePWA();
  const { profile, settings } = state;
  const isFreshUser = state.weightHistory.length === 0 && !profile.name.trim();
  
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(isFreshUser ? '' : profile.age.toString());
  const [height, setHeight] = useState(isFreshUser ? '' : profile.height.toString());
  const [currentWeight, setCurrentWeight] = useState(
    state.weightHistory.length > 0 ? state.bodyMetrics.currentWeight.toString() : ''
  );
  const [targetWeight, setTargetWeight] = useState(isFreshUser ? '' : profile.targetWeight?.toString() || '');
  const [importData, setImportData] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isForcingBackup, setIsForcingBackup] = useState(false);

  const handleSaveProfile = () => {
    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseFloat(height);
    const parsedCurrentWeight = parseFloat(currentWeight);
    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      alert('Informe uma idade valida.');
      return;
    }
    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      alert('Informe uma altura valida.');
      return;
    }
    if (!Number.isFinite(parsedCurrentWeight) || parsedCurrentWeight <= 0) {
      alert('Informe um peso atual valido.');
      return;
    }

    updateProfile({
      name,
      age: parsedAge,
      height: parsedHeight,
      initialWeight: parsedCurrentWeight,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined
    });

    if (Math.abs(parsedCurrentWeight - state.bodyMetrics.currentWeight) > 0.001) {
      addWeightEntry({
        id: uuidv4(),
        date: new Date().toISOString(),
        weight: parsedCurrentWeight,
        notes: 'Atualizado no perfil',
      });
    }
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GiGaGym-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importData) {
      const success = importAllData(importData);
      if (success) {
        alert('Dados importados com sucesso!');
        setShowImportDialog(false);
        setImportData('');
        window.location.reload();
      } else {
        alert('Erro ao importar dados. Verifique o formato do arquivo.');
      }
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      resetAllData();
      window.location.reload();
    }
  };

  const handleForceBackup = async () => {
    setIsForcingBackup(true);
    const ok = await forceLocalBackup();
    setIsForcingBackup(false);
    if (ok) {
      alert('Backup local realizado com sucesso.');
    } else {
      alert('Nao foi possivel realizar o backup local.');
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Perfil</h2>
        <p className="text-muted-foreground">Gerencie suas informações e preferências</p>
      </div>

      <Card className="p-6 mb-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="text-center font-bold text-lg" placeholder="Seu nome" />
        <p className="text-sm text-muted-foreground mt-2">{getGoalName(profile.goal)}</p>
      </Card>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Informações Pessoais</h3>
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Idade</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div>
              <Label>Altura (cm)</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Peso Atual (kg)</Label>
            <Input type="number" step="0.1" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} placeholder="Ex: 85.4" />
          </div>
          <div>
            <Label>Meta de Peso (kg)</Label>
            <Input type="number" step="0.1" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="Ex: 70" />
          </div>
          <div>
            <Label>Objetivo</Label>
            <Select value={profile.goal} onValueChange={(value: TrainingGoal) => updateProfile({ goal: value })}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="condicionamento">Condicionamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sexo</Label>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant={profile.gender === 'masculino' ? 'default' : 'outline'} onClick={() => updateProfile({ gender: 'masculino' })} className={cn('flex-1', profile.gender === 'masculino' && 'bg-lime-500 hover:bg-lime-600')}>Masculino</Button>
              <Button type="button" variant={profile.gender === 'feminino' ? 'default' : 'outline'} onClick={() => updateProfile({ gender: 'feminino' })} className={cn('flex-1', profile.gender === 'feminino' && 'bg-lime-500 hover:bg-lime-600')}>Feminino</Button>
            </div>
          </div>
          <Button onClick={handleSaveProfile} className="w-full bg-lime-500 hover:bg-lime-600">Salvar Alterações</Button>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Configurações</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">{settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</div>
              <div><p className="font-medium">Tema</p><p className="text-sm text-muted-foreground">{settings.theme === 'light' ? 'Claro' : settings.theme === 'dark' ? 'Escuro' : 'Sistema'}</p></div>
            </div>
            <Select value={settings.theme} onValueChange={(value: 'light' | 'dark' | 'system') => updateSettings({ theme: value })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Bell className="w-5 h-5" /></div>
              <div><p className="font-medium">Notificações</p><p className="text-sm text-muted-foreground">Lembretes de treino</p></div>
            </div>
            <Switch checked={settings.notifications} onCheckedChange={(checked) => updateSettings({ notifications: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Volume2 className="w-5 h-5" /></div>
              <div><p className="font-medium">Efeitos Sonoros</p><p className="text-sm text-muted-foreground">Sons ao completar exercícios</p></div>
            </div>
            <Switch checked={settings.soundEffects} onCheckedChange={(checked) => updateSettings({ soundEffects: checked })} />
          </div>
        </Card>
      </div>

      {isInstallable && !isInstalled && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Instalar App</h3>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Instale o GiGaGym no seu dispositivo para acesso rápido e funcionalidades offline.</p>
            <Button onClick={promptInstall} className="w-full bg-lime-500 hover:bg-lime-600"><Download className="w-4 h-4 mr-2" />Instalar GiGaGym</Button>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Backup</h3>
        <Card className="p-4 space-y-3">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-sm font-medium">Dados salvos localmente</p>
            <p className="text-xs text-muted-foreground mt-1">
              {lastLocalSaveAt
                ? `Ultimo salvamento: ${new Date(lastLocalSaveAt).toLocaleString('pt-BR')}`
                : 'Salvamento local ainda nao confirmado nesta sessao.'}
            </p>
          </div>
          <Button onClick={handleForceBackup} className="w-full" disabled={isForcingBackup}>
            {isForcingBackup ? 'Salvando...' : 'Forcar backup local'}
          </Button>
          <Button variant="outline" onClick={handleExport} className="w-full justify-between"><span className="flex items-center"><Download className="w-4 h-4 mr-2" />Exportar Dados</span><ChevronRight className="w-4 h-4" /></Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <Button variant="outline" onClick={() => setShowImportDialog(true)} className="w-full justify-between"><span className="flex items-center"><Upload className="w-4 h-4 mr-2" />Importar Dados</span><ChevronRight className="w-4 h-4" /></Button>
            <DialogContent>
              <DialogHeader><DialogTitle>Importar Dados</DialogTitle><DialogDescription>Cole o conteúdo do arquivo de backup abaixo.</DialogDescription></DialogHeader>
              <div className="space-y-4 mt-4">
                <textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Cole aqui o JSON de backup..." className="w-full h-32 p-3 rounded-lg border border-border bg-background resize-none" />
                <Button onClick={handleImport} className="w-full bg-lime-500 hover:bg-lime-600" disabled={!importData}>Importar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-red-500">Zona de Perigo</h3>
        <Card className="p-4 border-red-500/30">
          <Button variant="destructive" onClick={handleReset} className="w-full"><Trash2 className="w-4 h-4 mr-2" />Apagar Todos os Dados</Button>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-4">By Laércio v1.0.0</p>
    </PageContainer>
  );
}

