import { supabase } from "@/supabase/supabase";
import { Post } from "@/types/post.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";

export const useGetPost = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select(
          `id, title, caption, image, created_at,users(
          username
          )`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Dapatkan URL publik untuk setiap gambar
      const postsWithImageUrls = await Promise.all(
        posts.map(async (post) => {
          if (post.image) {
            const { data: imageUrl } = supabase.storage
              .from("postimage")
              .getPublicUrl(post.image);

            return {
              ...post,
              image_url: imageUrl.publicUrl,
            };
          }
          return post;
        })
      );

      console.log(postsWithImageUrls);
      return postsWithImageUrls;
    },
  });

  return { posts, isLoading };
};

export const useGetPostByUser = (user_id: string) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", user_id],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select(
          `id, title, caption, image, created_at,user_id, users(
          username
          )`
        )
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Dapatkan URL publik untuk setiap gambar
      const postsWithImageUrls = await Promise.all(
        posts.map(async (post) => {
          if (post.image) {
            const { data: imageUrl } = supabase.storage
              .from("postimage")
              .getPublicUrl(post.image);

            return {
              ...post,
              image_url: imageUrl.publicUrl,
            };
          }
          return post;
        })
      );

      console.log(postsWithImageUrls);
      return postsWithImageUrls;
    },
  });

  return { posts, isLoading };
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: Post) => {
      let imagePath = "";

      if (data.image) {
        const timestamp = new Date().getTime();
        const fileExt = data.image.split(".").pop();
        imagePath = `public/${timestamp}.${fileExt}`;

        const fileInfo = await FileSystem.getInfoAsync(data.image);

        if (!fileInfo.exists) {
          throw new Error("File tidak ditemukan");
        }

        if (data.image.startsWith("file://")) {
          const base64 = await FileSystem.readAsStringAsync(data.image, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const { error: storageError } = await supabase.storage
            .from("postimage")
            .upload(imagePath, decode(base64), {
              contentType: `image/${fileExt}`,
              upsert: true,
            });

          if (storageError) throw storageError;
        } else {
          const response = await fetch(data.image);
          const blob = await response.blob();

          const { error: storageError } = await supabase.storage
            .from("postimage")
            .upload(imagePath, blob, {
              contentType: `image/${fileExt}`,
              upsert: true,
            });

          if (storageError) throw storageError;
        }
      }

      // Tambahkan console.log untuk debugging
      console.log("Data yang akan dikirim ke server:", {
        ...data,
        image: imagePath || null,
      });

      const { data: postData, error } = await supabase
        .from("posts")
        .insert({
          title: data.title,
          caption: data.caption,
          image: imagePath || null,
          memory_word: data.memory_word,
          image_date: data.image_date,
          user_id: data.user_id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saat membuat post:", error);
        throw error;
      }

      return postData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.user_id] });
      router.replace("/home");
    },
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });
  return { mutate: mutation.mutate, isLoading: mutation.isPending };
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  return { mutate: mutation.mutate, isLoading: mutation.isPending };
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Post }) => {
      const { error } = await supabase.from("posts").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  return { mutate: mutation.mutate, isLoading: mutation.isPending };
};

export const useGetPostById = (id: string) => {
  const { data: post, isLoading } = useQuery({
    queryKey: [`post-${id}`],
    queryFn: async () => {
      const { data: post, error } = await supabase
        .from("posts")
        .select()
        .eq("id", id)
        .single();

      if (error) throw error;

      if (post && post.image) {
        const { data: imageUrl } = supabase.storage
          .from("postimage")
          .getPublicUrl(post.image);

        return {
          ...post,
          image_url: imageUrl.publicUrl,
        };
      }

      return post;
    },
    enabled: !!id,
  });

  return { post, isLoading };
};
