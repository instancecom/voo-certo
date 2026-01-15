import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BadgeVerification {
  id: string;
  user_id: string;
  insignia_id: string | null;
  proof_type: 'file' | 'code';
  proof_url: string | null;
  anac_code: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approval_id: string | null;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

// Generate unique approval ID
const generateApprovalId = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VOO-${year}-${code}`;
};

// User hooks
export const useUserVerifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-verifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("badge_verifications")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as BadgeVerification[];
    },
    enabled: !!user?.id,
  });
};

export const useSubmitVerification = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      insigniaId: string;
      proofType: 'file' | 'code';
      proofUrl?: string;
      anacCode?: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("badge_verifications")
        .insert({
          user_id: user.id,
          insignia_id: data.insigniaId,
          proof_type: data.proofType,
          proof_url: data.proofUrl || null,
          anac_code: data.anacCode || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return result as BadgeVerification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-verifications"] });
    },
  });
};

// Admin hooks
export const usePendingVerifications = () => {
  return useQuery({
    queryKey: ["pending-verifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badge_verifications")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: true });

      if (error) throw error;
      return data as BadgeVerification[];
    },
  });
};

export const useAllVerifications = () => {
  return useQuery({
    queryKey: ["all-verifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badge_verifications")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as BadgeVerification[];
    },
  });
};

export const useApproveVerification = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (verificationId: string) => {
      if (!user?.id) throw new Error("Admin not authenticated");

      const approvalId = generateApprovalId();

      // Update verification
      const { data: verification, error: verifyError } = await supabase
        .from("badge_verifications")
        .update({
          status: 'approved',
          approval_id: approvalId,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", verificationId)
        .select()
        .single();

      if (verifyError) throw verifyError;

      // Grant the insignia to the user
      if (verification?.insignia_id) {
        const { error: grantError } = await supabase
          .from("user_insignias")
          .insert({
            user_id: verification.user_id,
            insignia_id: verification.insignia_id,
          });

        // Ignore duplicate errors
        if (grantError && grantError.code !== '23505') {
          throw grantError;
        }
      }

      return verification as BadgeVerification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["all-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["user-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["user-insignias"] });
    },
  });
};

export const useRejectVerification = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { verificationId: string; notes?: string }) => {
      if (!user?.id) throw new Error("Admin not authenticated");

      const { data: result, error } = await supabase
        .from("badge_verifications")
        .update({
          status: 'rejected',
          admin_notes: data.notes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", data.verificationId)
        .select()
        .single();

      if (error) throw error;
      return result as BadgeVerification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["all-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["user-verifications"] });
    },
  });
};
