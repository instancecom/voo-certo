
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { microcoursesService } from '@/services/microcourses';
import { googleDriveService } from '@/services/googleDrive';
import { youtubeService } from '@/services/youtube';
import { Microcourse, Module, Lesson } from '@/types/admin';
import { toast } from 'sonner';

export function useMicrocoursesManager() {
  const queryClient = useQueryClient();
  const [showMicrocourseForm, setShowMicrocourseForm] = useState(false);
  const [editingMicrocourse, setEditingMicrocourse] = useState<Microcourse | null>(null);
  const [expandedMicrocourses, setExpandedMicrocourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [addingModuleTo, setAddingModuleTo] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [checkingConnections, setCheckingConnections] = useState(true);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  useEffect(() => {
    checkConnections();
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'youtube_connected') {
        setYoutubeConnected(true);
        toast.success('YouTube conectado!');
      }
      if (e.data?.type === 'drive_connected') {
        setDriveConnected(true);
        toast.success('Google Drive conectado!');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkConnections = async () => {
    setCheckingConnections(true);
    try {
      const [ytStatus, driveStatus] = await Promise.all([
        youtubeService.getStatus(),
        googleDriveService.getStatus(),
      ]);
      setYoutubeConnected(ytStatus.connected);
      setDriveConnected(driveStatus.connected);
    } catch { /* ignore */ } finally {
      setCheckingConnections(false);
    }
  };

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['admin-microcourses'],
    queryFn: microcoursesService.getMicrocourses,
  });

  const { data: allModules } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: microcoursesService.getModules,
  });

  const { data: allLessons } = useQuery({
    queryKey: ['admin-lessons'],
    queryFn: microcoursesService.getLessons,
  });

  const saveMicrocourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: Partial<Microcourse> = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      };
      return microcoursesService.saveMicrocourse(payload, editingMicrocourse?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-microcourses'] });
      toast.success(editingMicrocourse ? 'Microcurso atualizado!' : 'Microcurso criado!');
      setShowMicrocourseForm(false);
      setEditingMicrocourse(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMicrocourseMutation = useMutation({
    mutationFn: microcoursesService.deleteMicrocourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-microcourses'] });
      toast.success('Microcurso removido!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const saveModuleMutation = useMutation({
    mutationFn: ({ data, microcourseId, moduleId }: { data: any; microcourseId: string; moduleId?: string }) => 
      microcoursesService.saveModule({ ...data, microcourse_id: microcourseId }, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      toast.success('Módulo salvo!');
      setAddingModuleTo(null);
      setEditingModule(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: microcoursesService.deleteModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
      toast.success('Módulo removido!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const saveLessonMutation = useMutation({
    mutationFn: async ({ data, moduleId, lessonId, materialFile }: { data: any; moduleId: string; lessonId?: string; materialFile?: File }) => {
      let materialUrl = data.material_url || null;
      let materialName = data.material_name || null;

      if (materialFile) {
        setUploadingMaterial(true);
        try {
          const result = await googleDriveService.uploadFile(materialFile, materialFile.name, data.material_drive_folder);
          materialUrl = result.directUrl;
          materialName = materialFile.name;
        } finally {
          setUploadingMaterial(false);
        }
      }

      const payload = { ...data, material_url: materialUrl, material_name: materialName, module_id: moduleId };
      return microcoursesService.saveLesson(payload, lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
      toast.success('Aula salva!');
      setAddingLessonTo(null);
      setEditingLesson(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: microcoursesService.deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] });
      toast.success('Aula removida!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleExpand = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const getModules = (mcId: string) => (allModules || []).filter(m => m.microcourse_id === mcId);
  const getLessons = (modId: string) => (allLessons || []).filter(l => l.module_id === modId);

  return {
    courses,
    isLoadingCourses,
    showMicrocourseForm,
    setShowMicrocourseForm,
    editingMicrocourse,
    setEditingMicrocourse,
    expandedMicrocourses,
    setExpandedMicrocourses,
    expandedModules,
    setExpandedModules,
    addingModuleTo,
    setAddingModuleTo,
    editingModule,
    setEditingModule,
    addingLessonTo,
    setAddingLessonTo,
    editingLesson,
    setEditingLesson,
    youtubeConnected,
    driveConnected,
    uploadingMaterial,
    saveMicrocourseMutation,
    deleteMicrocourseMutation,
    saveModuleMutation,
    deleteModuleMutation,
    saveLessonMutation,
    deleteLessonMutation,
    toggleExpand,
    getModules,
    getLessons,
  };
}
