import type { ExpertQuery } from "@/lib/database/types";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ExpertQueryCreateInput,
  ExpertQueryUpdateInput,
} from "@/lib/validators/expert-query.validator";
import { randomUUID } from "node:crypto";

export class ExpertQueryRepository {
  async getAllQueries(): Promise<ExpertQuery[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("expert_queries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as ExpertQuery[];
  }

  async createQuery(input: ExpertQueryCreateInput): Promise<ExpertQuery> {
    const supabase = await createSupabaseServerClient();
    const query: ExpertQuery = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      product_name: input.product_name,
      product_url: input.product_url,
      question_type: input.question_type,
      message: input.message,
      status: "new",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("expert_queries").insert(query);

    if (error) {
      throw new DatabaseError(error.message);
    }

    return query;
  }

  async updateQueryStatus(id: string, input: ExpertQueryUpdateInput): Promise<ExpertQuery> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("expert_queries")
      .update({ status: input.status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as ExpertQuery;
  }

  async deleteQuery(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("expert_queries").delete().eq("id", id);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }
}
