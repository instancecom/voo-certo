import { useState } from 'react';
import { useGuiaEtapas, useSimuladoOptions, useUpdateGuiaEtapa } from '@/hooks/useGuiaEtapas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Loader2, 
  Save, 
  Plus, 
  X,
  BookOpen,
  Layers
} from 'lucide-react';

export function GuiaCarreiraManager() {
  const { data: etapas, isLoading: loadingEtapas } = useGuiaEtapas();
  const { data: simuladoOptions, isLoading: loadingOptions } = useSimuladoOptions();
  const updateEtapa = useUpdateGuiaEtapa();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSimulados, setSelectedSimulados] = useState<{ id: string; type: 'category' | 'subcategory'; label?: string }[]>([]);
  
  const isLoading = loadingEtapas || loadingOptions;

  const handleEdit = (etapa: { id: string; simulado_ids: { id: string; type: 'category' | 'subcategory'; label?: string }[] }) => {
    setEditingId(etapa.id);
    setSelectedSimulados(etapa.simulado_ids || []);
  };

  const handleCancel = () => {
    setEditingId(null);
    setSelectedSimulados([]);
  };

  const handleAddSimulado = (value: string) => {
    if (!value || value === 'none') return;
    
    const [type, id] = value.split(':');
    const option = simuladoOptions?.find(o => o.id === id);
    
    if (option && !selectedSimulados.find(s => s.id === id)) {
      const label = option.type === 'subcategory' && option.parentName 
        ? `${option.parentName} - ${option.name}` 
        : option.name;
      
      setSelectedSimulados([
        ...selectedSimulados,
        { id, type: type as 'category' | 'subcategory', label }
      ]);
    }
  };

  const handleRemoveSimulado = (id: string) => {
    setSelectedSimulados(selectedSimulados.filter(s => s.id !== id));
  };

  const handleSave = async (etapaId: string) => {
    try {
      await updateEtapa.mutateAsync({
        id: etapaId,
        simulado_ids: selectedSimulados,
      });
      toast.success('Etapa atualizada com sucesso!');
      setEditingId(null);
      setSelectedSimulados([]);
    } catch (error) {
      toast.error('Erro ao atualizar etapa');
      console.error(error);
    }
  };

  const getSimuladoLabel = (simulado: { id: string; type: 'category' | 'subcategory'; label?: string }) => {
    if (simulado.label) return simulado.label;
    const option = simuladoOptions?.find(o => o.id === simulado.id);
    if (!option) return 'Simulado não encontrado';
    return option.type === 'subcategory' && option.parentName 
      ? `${option.parentName} - ${option.name}` 
      : option.name;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Guia de Carreira</h2>
        <p className="text-muted-foreground">
          Configure os simulados recomendados para cada etapa do processo seletivo.
        </p>
      </div>

      <div className="space-y-4">
        {etapas?.map((etapa) => (
          <Card key={etapa.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{etapa.emoji}</span>
                  <div>
                    <CardTitle className="text-lg">
                      Etapa {etapa.step_number}: {etapa.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {etapa.description}
                    </CardDescription>
                  </div>
                </div>
                {editingId !== etapa.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(etapa)}
                  >
                    Editar Simulados
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {editingId === etapa.id ? (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Simulados recomendados para esta etapa:
                    </label>
                    
                    {/* Selected simulados */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedSimulados.length === 0 ? (
                        <span className="text-sm text-muted-foreground italic">
                          Nenhum simulado selecionado
                        </span>
                      ) : (
                        selectedSimulados.map((simulado) => (
                          <Badge
                            key={simulado.id}
                            variant="secondary"
                            className="flex items-center gap-1 py-1 px-2"
                          >
                            {simulado.type === 'category' ? (
                              <BookOpen className="w-3 h-3" />
                            ) : (
                              <Layers className="w-3 h-3" />
                            )}
                            {getSimuladoLabel(simulado)}
                            <button
                              onClick={() => handleRemoveSimulado(simulado.id)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    
                    {/* Add simulado selector */}
                    <div className="flex items-center gap-2">
                      <Select onValueChange={handleAddSimulado}>
                        <SelectTrigger className="w-full max-w-md">
                          <SelectValue placeholder="Adicionar simulado..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Selecione um simulado</SelectItem>
                          
                          {/* Categories */}
                          {simuladoOptions?.filter(o => o.type === 'category').map(option => (
                            <SelectItem 
                              key={`cat-${option.id}`} 
                              value={`category:${option.id}`}
                              disabled={selectedSimulados.some(s => s.id === option.id)}
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <span>{option.name}</span>
                                <Badge variant="outline" className="text-xs ml-2">Profissão</Badge>
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* Subcategories */}
                          {simuladoOptions?.filter(o => o.type === 'subcategory').map(option => (
                            <SelectItem 
                              key={`sub-${option.id}`} 
                              value={`subcategory:${option.id}`}
                              disabled={selectedSimulados.some(s => s.id === option.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-accent" />
                                <span>{option.parentName} - {option.name}</span>
                                <Badge variant="outline" className="text-xs ml-2">Bloco</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0"
                        onClick={() => handleAddSimulado('')}
                        disabled
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Você pode selecionar até 2 simulados por etapa. Deixe vazio para não mostrar botão de treino.
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleSave(etapa.id)}
                      disabled={updateEtapa.isPending}
                    >
                      {updateEtapa.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {etapa.simulado_ids && etapa.simulado_ids.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground mr-2">Simulados vinculados:</span>
                      {etapa.simulado_ids.map((simulado) => (
                        <Badge
                          key={simulado.id}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {simulado.type === 'category' ? (
                            <BookOpen className="w-3 h-3" />
                          ) : (
                            <Layers className="w-3 h-3" />
                          )}
                          {getSimuladoLabel(simulado)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Nenhum simulado vinculado a esta etapa
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
