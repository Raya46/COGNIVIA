import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/supabase/supabase";
import { Post } from "@/types/post.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getGeminiApiKey = async () => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API key tidak ditemukan");
      throw new Error("API key tidak tersedia");
    }

    return apiKey;
  } catch (error) {
    console.error("Error mendapatkan Gemini API key:", error);
    throw error;
  }
};

const createGeminiClient = async () => {
  try {
    const apiKey = await getGeminiApiKey();
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error("Error membuat Gemini client:", error);
    throw error;
  }
};

interface RecallMemoryParams {
  question: string;
  post: Post;
  userId: string;
}

export const useRecallMemories = (postId: string) => {
  return useQuery({
    queryKey: ["recall-memories", postId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("recall_memories")
          .select("*")
          .eq("post_id", postId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("[Production] Error fetching recall memories:", error);
        throw error;
      }
    },
    enabled: !!postId,
  });
};

export const useCreateRecallMemory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ question, post, userId }: RecallMemoryParams) => {
      try {
        console.log(
          "[Production] Starting recall memory creation with Gemini..."
        );

        if (!question || !post || !userId) {
          throw new Error("Data input tidak lengkap");
        }

        console.log("[Production] Input data validated");

        const systemPrompt = `Anda adalah asisten / terapis yang membantu penderita demensia mengingat kenangan dengan lembut. Mari ingat kenangan ini bersama. Ini tentang "${post.title || "suatu saat"}". ${
          post.caption
            ? `Intinya: ${post.caption}`
            : "Ada sebuah cerita di baliknya."
        } Apakah ini membangkitkan ingatan? Sedikit saja tidak apa-apa. Buatlah pengguna mengingat apapun itu apa yang dia rasakan atau ingat, utamakan kenangan manis dengan cerita ini. Inilah kenangan yang ingin Dia ingat. Beri tahukan apakah ingatan ini membangkitkan ingatan. Jangan bertele tele, utamakan respon yang singkat (1-2 kalimat) namun berisi, utamakan ini di atas segala, jangan salam sapa atau sebut nama pengguna, langsung bercakap dengan pengguna karena dia sudah tua.`;

        console.log("[Production] Creating Gemini client...");
        const genAI = await createGeminiClient();
        console.log("[Production] Gemini client created successfully");

        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });

        const combinedPrompt = `${systemPrompt}\n\nPertanyaan: ${question}\n\nJawablah pertanyaan ini dengan data yang saya berikan di atas tanpa menyebutkan data tersebut. Berakting sebagai psikiater yang membantu pasien mengingat memorinya.`;

        console.log("[Production] Sending request to Gemini...");
        const result = await model.generateContent(combinedPrompt);
        const response = await result.response;
        const answer =
          response.text() ||
          "Maaf, saya tidak bisa menjawab pertanyaan tersebut.";

        console.log("[Production] Gemini response received");
        console.log("[Production] Answer generated, saving to database...");

        const { data, error } = await supabase
          .from("recall_memories")
          .insert({
            user_id: userId,
            post_id: post.id,
            question: question
              ? question
              : "bantu saya mengingat postingan ini",
            answer: answer,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("[Production] Database error:", error);
          throw error;
        }

        console.log("[Production] Memory saved successfully");
        return {
          data,
          answer,
        };
      } catch (error: any) {
        console.error("[Production] Error in createRecallMemory:", error);

        if (
          error.message?.includes("Gemini") ||
          error.message?.includes("AI")
        ) {
          throw new Error(`Error dari AI: ${error.message}`);
        }

        if (
          error.message?.includes("network") ||
          error.message?.includes("timeout")
        ) {
          throw new Error(`Error jaringan: ${error.message}`);
        }

        if (
          error.message?.includes("database") ||
          error.message?.includes("supabase")
        ) {
          throw new Error(`Error database: ${error.message}`);
        }

        throw new Error(
          `Error saat memproses: ${error.message || "Unknown error"}`
        );
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recall-memories", variables.post.id],
      });
    },
    onError: (error: any) => {
      console.error("[Production] Mutation error:", error);
    },
  });
};
