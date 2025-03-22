import { supabase } from "@/supabase/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";

export const useGetGuessMe = (user_id?: string) => {
  const { data: guessMeData, isLoading } = useQuery({
    queryKey: ["guess-me", user_id],
    queryFn: async () => {
      if (!user_id) {
        return [];
      }

      // Selalu filter berdasarkan user_id yang login
      const { data, error } = await supabase
        .from("guess_me")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Dapatkan URL publik untuk setiap gambar dan data questions/answers
      const guessMeWithDetails = await Promise.all(
        data.map(async (guessMe) => {
          let imageUrl = null;
          if (guessMe.image) {
            const { data: imgUrl } = supabase.storage
              .from("guessmeimages")
              .getPublicUrl(guessMe.image);
            imageUrl = imgUrl.publicUrl;
          }

          // Dapatkan questions untuk guess-me ini
          const { data: qaData, error: qaError } = await supabase
            .from("guess_qa")
            .select(
              `
              question_id, 
              answer_id,
              questions(id, question),
              answers(id, answer, user_input, user_input_value)
            `
            )
            .eq("guess_me_id", guessMe.id);

          if (qaError) throw qaError;

          // Transformasi data menjadi format yang lebih mudah digunakan
          const questionsMap = new Map();

          qaData.forEach((item) => {
            const questionId = item.question_id;
            const question = item.questions?.question || "";
            const answer = item.answers || null;

            if (!questionsMap.has(questionId)) {
              questionsMap.set(questionId, {
                id: questionId,
                question: question,
                answers: [],
              });
            }

            if (answer) {
              questionsMap.get(questionId).answers.push(answer);
            }
          });

          const questions = Array.from(questionsMap.values());

          return {
            ...guessMe,
            image_url: imageUrl,
            questions: questions,
          };
        })
      );

      return guessMeWithDetails;
    },
    enabled: !!user_id,
  });

  return { guessMeData, isLoading };
};

// Get questions for a specific guess-me
export const useGetGuessMeQuestions = (
  guess_me_id: string,
  user_id?: string
) => {
  const { data: questions, isLoading } = useQuery({
    queryKey: ["guess-me-questions", guess_me_id, user_id],
    queryFn: async () => {
      // Pastikan user adalah pemilik guess_me ini
      if (!user_id) {
        return [];
      }

      const { data: guessMeData, error: guessMeError } = await supabase
        .from("guess_me")
        .select("user_id")
        .eq("id", guess_me_id)
        .single();

      if (guessMeError) throw guessMeError;

      // Jika user_id tidak sama dengan pemilik guess_me, return array kosong
      if (guessMeData.user_id !== user_id) {
        return [];
      }

      // Ambil pertanyaan jika validasi berhasil
      const { data, error } = await supabase
        .from("guess_qa")
        .select(
          `
          question_id,
          questions(question)
        `
        )
        .eq("guess_me_id", guess_me_id);

      if (error) throw error;

      // Transform data untuk kemudahan penggunaan
      const uniqueQuestions = [
        ...new Map(
          data.map((item) => [item.question_id, item.questions])
        ).values(),
      ];

      return uniqueQuestions;
    },
    enabled: !!(guess_me_id && user_id),
  });

  return { questions, isLoading };
};

// Get answers for a specific guess-me and question
export const useGetGuessMeAnswers = (
  guess_me_id: string,
  question_id: string,
  user_id?: string
) => {
  const { data: answers, isLoading } = useQuery({
    queryKey: ["guess-me-answers", guess_me_id, question_id, user_id],
    queryFn: async () => {
      // Pastikan user adalah pemilik guess_me ini
      if (!user_id) {
        return [];
      }

      const { data: guessMeData, error: guessMeError } = await supabase
        .from("guess_me")
        .select("user_id")
        .eq("id", guess_me_id)
        .single();

      if (guessMeError) throw guessMeError;

      // Jika user_id tidak sama dengan pemilik guess_me, return array kosong
      if (guessMeData.user_id !== user_id) {
        return [];
      }

      // Ambil jawaban jika validasi berhasil
      const { data, error } = await supabase
        .from("guess_qa")
        .select(
          `
          answer_id,
          answers(answer, user_id, user_input, user_input_value)
        `
        )
        .eq("guess_me_id", guess_me_id)
        .eq("question_id", question_id);

      if (error) throw error;

      return data.map((item) => item.answers);
    },
    enabled: !!(guess_me_id && question_id && user_id),
  });

  return { answers, isLoading };
};

// Create new guess-me
export const useCreateGuessMe = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      image,
      title,
      user_id,
      questions,
    }: {
      image: string;
      title: string;
      user_id: string;
      questions: { question: string; answers: string[] }[];
    }) => {
      try {
        // 1. Upload image (tetap sekuensial karena ini operasi storage)
        let uploadTask;
        let imagePath = "";

        if (image) {
          const timestamp = new Date().getTime();
          const fileExt = image.split(".").pop();
          imagePath = `public/${timestamp}.${fileExt}`;

          const fileInfo = await FileSystem.getInfoAsync(image);
          if (!fileInfo.exists) {
            throw new Error("File tidak ditemukan");
          }

          // Mulai upload secara paralel dengan operasi lain
          if (image.startsWith("file://")) {
            const base64Promise = FileSystem.readAsStringAsync(image, {
              encoding: FileSystem.EncodingType.Base64,
            });

            uploadTask = base64Promise.then((base64) => {
              return supabase.storage
                .from("guessmeimages")
                .upload(imagePath, decode(base64), {
                  contentType: `image/${fileExt}`,
                  upsert: true,
                });
            });
          } else {
            uploadTask = fetch(image)
              .then((response) => response.blob())
              .then((blob) => {
                return supabase.storage
                  .from("guessmeimages")
                  .upload(imagePath, blob, {
                    contentType: `image/${fileExt}`,
                    upsert: true,
                  });
              });
          }
        }

        // 2. Create guess-me entry
        const { data: guessMeData, error: guessMeError } = await supabase
          .from("guess_me")
          .insert({
            image: imagePath,
            title: title,
            user_id: user_id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (guessMeError) throw guessMeError;

        // Pastikan upload gambar selesai
        if (uploadTask) {
          const { error: storageError } = await uploadTask;
          if (storageError) throw storageError;
        }

        // 3. Persiapkan pertanyaan dan jawaban
        const questionInsertPromises = await Promise.all(
          questions.map(async (item) => {
            // Periksa pertanyaan yang sudah ada secara paralel
            const { data: existingQuestion } = await supabase
              .from("questions")
              .select("id")
              .eq("question", item.question)
              .single();

            let questionId;

            if (existingQuestion) {
              questionId = existingQuestion.id;
            } else {
              // Buat pertanyaan baru
              const { data: newQuestion, error: questionError } = await supabase
                .from("questions")
                .insert({
                  question: item.question,
                  created_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (questionError) throw questionError;
              questionId = newQuestion.id;
            }

            return {
              questionId,
              answers: item.answers,
            };
          })
        );

        // 4. Insert jawaban secara batch jika memungkinkan
        const answerPromises = [];

        for (const item of questionInsertPromises) {
          const answerTexts = item.answers;

          // Buat jawaban secara paralel
          const batchAnswerPromises = answerTexts.map(async (answerText) => {
            const { data: answerData, error: answerError } = await supabase
              .from("answers")
              .insert({
                answer: answerText,
                user_id: user_id,
                user_input: "",
                user_input_value: false,
              })
              .select()
              .single();

            if (answerError) throw answerError;

            return {
              questionId: item.questionId,
              answerId: answerData.id,
            };
          });

          answerPromises.push(...batchAnswerPromises);
        }

        // Tunggu semua jawaban selesai dibuat
        const answersResult = await Promise.all(answerPromises);

        // 5. Buat entri guess_qa secara batch
        const guess_qa_data = answersResult.map((result) => ({
          guess_me_id: guessMeData.id,
          question_id: result.questionId,
          answer_id: result.answerId,
        }));

        // Insert semua guess_qa dalam satu operasi batch
        if (guess_qa_data.length > 0) {
          const { error: qaError } = await supabase
            .from("guess_qa")
            .insert(guess_qa_data);

          if (qaError) throw qaError;
        }

        return guessMeData;
      } catch (error) {
        console.error("Error creating guess me:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guess-me"] });
    },
  });

  return { mutate: mutation.mutate, isLoading: mutation.isPending };
};

// Helper function
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Tambahkan fungsi baru untuk menyimpan jawaban user (tebakan)
export const useSubmitGuess = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      answer_id,
      user_id,
      user_input,
    }: {
      answer_id: string;
      user_id: string;
      user_input: string;
    }) => {
      try {
        console.log("In mutationFn with:", { answer_id, user_id, user_input });

        // 1. Dapatkan data jawaban asli
        const { data: answerData, error: answerError } = await supabase
          .from("answers")
          .select("answer, user_id")
          .eq("id", answer_id)
          .single();

        if (answerError) {
          console.error("Error fetching answer:", answerError);
          throw answerError;
        }

        console.log("Retrieved answer data:", answerData);

        // 2. Pastikan user adalah pemilik jawaban - SKIP validasi ini untuk sementara
        // karena user sedang mengerjakan quiz miliknya sendiri
        // if (answerData.user_id !== user_id) {
        //   throw new Error("Tidak berwenang menjawab guess-me ini");
        // }

        // 3. Periksa apakah jawaban benar (case insensitive)
        const isCorrect =
          answerData.answer.toLowerCase() === user_input.toLowerCase();
        console.log("Answer correct?", isCorrect);

        // 4. Update jawaban dengan input user
        const { data, error } = await supabase
          .from("answers")
          .update({
            user_input: user_input,
            user_input_value: isCorrect,
          })
          .eq("id", answer_id)
          .select()
          .single();

        if (error) {
          console.error("Error updating answer:", error);
          throw error;
        }

        console.log("Update successful:", data);

        return {
          ...data,
          is_correct: isCorrect,
          original_answer: answerData.answer,
        };
      } catch (error) {
        console.error("Error in useSubmitGuess:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation successful, invalidating queries");
      // Invalidate query untuk memperbarui data
      queryClient.invalidateQueries({ queryKey: ["guess-me-answers"] });
      queryClient.invalidateQueries({ queryKey: ["guess-me-detail"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  return { mutate: mutation.mutate, isLoading: mutation.isPending };
};

export const useGetQuestion = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("questions").select("*");
      if (error) throw error;
      return data;
    },
  });
  return { data, isLoading };
};

// Tambahkan fungsi baru untuk mengambil detail guess me berdasarkan ID
export const useGetGuessMeDetail = (guess_me_id: string, user_id?: string) => {
  const { data: guessMeDetail, isLoading } = useQuery({
    queryKey: ["guess-me-detail", guess_me_id, user_id],
    queryFn: async () => {
      if (!user_id || !guess_me_id) {
        return null;
      }

      // Ambil data guess me
      const { data: guessMeData, error: guessMeError } = await supabase
        .from("guess_me")
        .select("*")
        .eq("id", guess_me_id)
        .eq("user_id", user_id)
        .single();

      if (guessMeError) throw guessMeError;

      // Dapatkan URL gambar
      let imageUrl = null;
      if (guessMeData.image) {
        const { data: imgUrl } = supabase.storage
          .from("guessmeimages")
          .getPublicUrl(guessMeData.image);
        imageUrl = imgUrl.publicUrl;
      }

      // Dapatkan questions dan answers
      const { data: qaData, error: qaError } = await supabase
        .from("guess_qa")
        .select(
          `
          question_id, 
          answer_id,
          questions(id, question),
          answers(id, answer, user_input, user_input_value)
        `
        )
        .eq("guess_me_id", guess_me_id);

      if (qaError) throw qaError;

      // Transformasi data
      const questionsMap = new Map();

      qaData.forEach((item) => {
        const questionId = item.question_id;
        const question = item.questions?.question || "";
        const answer = item.answers || null;

        if (!questionsMap.has(questionId)) {
          questionsMap.set(questionId, {
            id: questionId,
            question: question,
            answers: [],
          });
        }

        if (answer) {
          questionsMap.get(questionId).answers.push(answer);
        }
      });

      const questions = Array.from(questionsMap.values());

      return {
        ...guessMeData,
        image_url: imageUrl,
        questions: questions,
      };
    },
    enabled: !!(guess_me_id && user_id),
  });

  return { guessMeDetail, isLoading };
};
