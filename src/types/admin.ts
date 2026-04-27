
export interface DriveFolder {
  id: string;
  name: string;
}

export interface Microcourse {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  youtube_video_id: string | null;
  category: string;
  tags: string[];
  duration_minutes: number;
  display_order: number;
  is_active: boolean;
}

export interface Module {
  id: string;
  microcourse_id: string;
  title: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  display_order: number;
  video_url: string | null;
  youtube_video_id: string | null;
  thumbnail_url: string | null;
  material_url: string | null;
  material_name: string | null;
  material_drive_folder: string | null;
  is_active: boolean;
  is_premium: boolean;
}

export interface Profession {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  active_modes: string[] | null;
  total_time: number | null;
  display_order: number | null;
  image_url: string | null;
  created_at: string;
  block_count?: number;
  question_count?: number;
}
