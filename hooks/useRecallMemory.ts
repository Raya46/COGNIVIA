import OpenAI from "openai";
import { supabase } from "@/supabase/supabase";
import { Post } from "@/types/post.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

interface RecallMemoryParams {
  question: string;
  post: Post;
  userId: string;
}

export const useRecallMemories = (postId: string) => {
  return useQuery({
    queryKey: ["recall-memories", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recall_memories")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });
};

export const useCreateRecallMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ question, post, userId }: RecallMemoryParams) => {
      // Menyiapkan prompt dengan data post
      const systemPrompt = `Anda adalah asisten yang membantu mengingat memori. 
      Gunakan informasi berikut untuk menjawab pertanyaan user:
      - Judul: ${post.title}
      - Tanggal: ${post.image_date || post.created_at}
      - Kata kunci memori: ${post.memory_word}
      - Deskripsi: ${post.caption}`;

      // Membuat completion dengan text dan gambar
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `${question} jawablah pertanyaan ini dengan data yang saya kirim melalui system-prompt: ${systemPrompt} tanpa menyebutkan system-prompt langsung isi dari system-prompt saja dan berperanlah seperti dokter yang sedang membantu pasiennya mengingat kembali memori dari postingan ini`,
          },
        ],
      });

      const answer =
        response.choices[0]?.message?.content ||
        "Maaf, saya tidak bisa menjawab pertanyaan tersebut.";

      // Menyimpan pertanyaan dan jawaban ke database
      const { data, error } = await supabase
        .from("recall_memories")
        .insert({
          user_id: userId,
          post_id: post.id,
          question: question,
          answer: answer,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        answer,
      };
    },
    onSuccess: (_, variables) => {
      // Invalidate query untuk memperbarui daftar recall memories
      queryClient.invalidateQueries({
        queryKey: ["recall-memories", variables.post.id],
      });
    },
    onError: (error) => {
      console.error("Error in createRecallMemory:", error);
      throw error;
    },
  });
};
