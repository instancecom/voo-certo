import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Loader2, Upload, Download, CheckCircle, AlertTriangle, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Papa from 'papaparse';

// Expected CSV Columns
const CSV_HEADERS = ['bloco_id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'difficulty', 'explanation'];

export default function ImportQuestoesPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('none');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: number; details: string[] } | null>(null);

  const { data: blocks, isLoading: loadingBlocks } = useQuery({
    queryKey: ['all-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('id, name, category_id')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const downloadTemplate = () => {
    const templateContent = CSV_HEADERS.join(',') + '\n' +
      '"se-bloqueado-dropdown-ignora","Enunciado da questão","Opção A","Opção B","Opção C","Opção D","0","medium","Explicação opcional"';
    
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_importacao.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const processImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo CSV primeiro.');
      return;
    }

    if (selectedBlockId !== 'none' && !blocks?.find(b => b.id === selectedBlockId)) {
      toast.error('Bloco selecionado é inválido.');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (resultsData) => {
        let successCount = 0;
        let errorCount = 0;
        let details: string[] = [];

        const rows = resultsData.data;

        const questionsToInsert = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const lineNum = i + 2; // +1 for header, +1 for 0-index

          try {
            let rowBlockId = selectedBlockId !== 'none' ? selectedBlockId : row.bloco_id;
            
            if (!rowBlockId) {
              throw new Error('bloco_id é obrigatório quando nenhum bloco é selecionado no dropdown.');
            }

            const blockInfo = blocks?.find(b => b.id === rowBlockId);
            if (!blockInfo) {
              throw new Error(`Bloco não encontrado (ID: ${rowBlockId}).`);
            }

            if (!row.text || !row.option_a || !row.option_b || !row.option_c || !row.option_d || row.correct_answer === undefined) {
              throw new Error('Campos obrigatórios faltando (text, options..., correct_answer).');
            }

            const correctAnswerNum = parseInt(row.correct_answer.toString());
            if (isNaN(correctAnswerNum) || correctAnswerNum < 0 || correctAnswerNum > 3) {
              throw new Error('correct_answer deve ser um número de 0 a 3.');
            }

            questionsToInsert.push({
              category_id: blockInfo.category_id,
              subcategory_id: rowBlockId,
              text: row.text,
              options: [row.option_a, row.option_b, row.option_c, row.option_d],
              correct_answer: correctAnswerNum,
              difficulty: row.difficulty || 'medium',
              explanation: row.explanation || null
            });
            successCount++;
          } catch (e: any) {
            errorCount++;
            details.push(`Linha ${lineNum}: ${e.message}`);
          }
        }

        if (questionsToInsert.length > 0) {
          const { error } = await supabase.from('questions').insert(questionsToInsert);
          if (error) {
            toast.error('Erro no Supabase ao inserir questões.');
            console.error(error);
            setIsProcessing(false);
            return;
          }
          queryClient.invalidateQueries({ queryKey: ['admin-block-questions'] });
          queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        }

        setResults({ success: successCount, errors: errorCount, details });

        if (errorCount === 0 && successCount > 0) {
          const blockName = selectedBlockId !== 'none' 
            ? blocks?.find(b => b.id === selectedBlockId)?.name 
            : 'vários blocos';
          toast.success(`${successCount} questões importadas para o bloco ${blockName} com sucesso!`);
        } else if (successCount > 0) {
          toast.warning(`${successCount} questões importadas, porém ${errorCount} linhas tiveram erro.`);
        } else {
          toast.error(`Nenhuma questão importada. ${errorCount} linhas com erro.`);
        }

        setFile(null);
        setIsProcessing(false);
      },
      error: (e) => {
        toast.error('Erro ao ler o arquivo CSV.');
        setIsProcessing(false);
      }
    });
  };

  if (authLoading || loadingBlocks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Acesso Negado</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <h1 className="text-lg font-semibold ml-2">Importar Questões via CSV</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl py-8 px-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Configurar Importação</CardTitle>
            <CardDescription>
              Selecione um bloco específico abaixo para todas as questões ou deixe em "Usar Bloco do CSV" caso queira definir por questão no arquivo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 flex flex-col">
              <Label>Selecione o bloco para este CSV</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="justify-between w-full font-normal"
                  >
                    {selectedBlockId === 'none' 
                      ? "Usar Bloco do CSV (Requer coluna bloco_id)"
                      : blocks?.find((b) => b.id === selectedBlockId)?.name || "Selecione um bloco..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar bloco..." />
                    <CommandEmpty>Nenhum bloco encontrado.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            setSelectedBlockId('none');
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBlockId === 'none' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Usar Bloco do CSV (Requer coluna bloco_id)
                        </CommandItem>
                        {blocks?.map((block) => (
                          <CommandItem
                            key={block.id}
                            value={block.name + " " + block.id}
                            onSelect={() => {
                              setSelectedBlockId(block.id);
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedBlockId === block.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {block.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-4">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <div>
                <Label htmlFor="file-upload" className="cursor-pointer text-primary font-medium hover:underline">
                  Clique ou arraste para enviar seu CSV
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {file ? file.name : "Nenhum arquivo selecionado"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={processImport} disabled={!file || isProcessing} className="flex-1">
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isProcessing ? 'Processando...' : 'Importar Questões'}
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Baixar Modelo CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Card className={results.errors > 0 ? 'border-warning' : 'border-success'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.errors === 0 ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                )}
                Resultados da Importação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="bg-success/10 text-success px-4 py-2 rounded-lg font-medium">
                  {results.success} Sucessos
                </div>
                <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg font-medium">
                  {results.errors} Erros
                </div>
              </div>

              {results.details.length > 0 && (
                <div className="bg-muted p-4 rounded-lg text-sm font-mono max-h-48 overflow-y-auto">
                  {results.details.map((err, i) => (
                    <div key={i} className="text-destructive mb-1 break-words">{err}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
