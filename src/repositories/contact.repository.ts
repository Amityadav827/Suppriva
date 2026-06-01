import type { ContactMessage } from "@/lib/database/types";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContactMessageCreateInput } from "@/lib/validators/contact.validator";
import { randomUUID } from "node:crypto";

export class ContactMessagesRepository {
  async getAllMessages(): Promise<ContactMessage[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as ContactMessage[];
  }

  async createMessage(input: ContactMessageCreateInput): Promise<ContactMessage> {
    const supabase = await createSupabaseServerClient();
    const message: ContactMessage = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("contact_messages")
      .insert(message);

    if (error) {
      throw new DatabaseError(error.message);
    }

    return message;
  }

  async deleteMessage(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }
}
