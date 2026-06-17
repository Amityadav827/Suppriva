import { SubscriberStatus } from "@/lib/database/constants";
import type { NewsletterSubscriber } from "@/lib/database/types";
import { DatabaseError } from "@/lib/errors/DatabaseError";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NewsletterCreateRecord = {
  email: string;
  status?: SubscriberStatus;
  source_page?: string | null;
};

export type NewsletterStats = {
  totalSubscribers: number;
  newToday: number;
  weeklySubscribers: number;
  monthlySubscribers: number;
  recentSubscribers: NewsletterSubscriber[];
  growth: { label: string; subscribers: number }[];
};

export class NewsletterRepository {
  async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data ?? []) as NewsletterSubscriber[];
  }

  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return (data as NewsletterSubscriber | null) ?? null;
  }

  async createSubscriber(input: NewsletterCreateRecord): Promise<NewsletterSubscriber> {
    const supabase = await createSupabaseServerClient();
    const response = await supabase
      .rpc("subscribe_newsletter", {
        p_email: input.email,
        p_source_page: input.source_page ?? null,
      })
      .single();

    if (response.error) {
      throw new DatabaseError(response.error.message);
    }

    return response.data as NewsletterSubscriber;
  }

  async unsubscribeSubscriber(email: string): Promise<NewsletterSubscriber> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .rpc("unsubscribe_newsletter", {
        p_email: email,
      })
      .single();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as NewsletterSubscriber;
  }

  async deleteSubscriber(email: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("email", email)
      .is("deleted_at", null);

    if (error) {
      throw new DatabaseError(error.message);
    }
  }

  async getSubscriberStats(): Promise<NewsletterStats> {
    const subscribers = await this.getAllSubscribers();
    const activeSubscribers = subscribers.filter(
      (subscriber) => subscriber.status === SubscriberStatus.Active,
    );
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now);
    startOfMonth.setMonth(now.getMonth() - 1);
    const growthMap = new Map<string, number>();

    activeSubscribers.forEach((subscriber) => {
      const label = this.toTrendKey(subscriber.created_at);
      growthMap.set(label, (growthMap.get(label) ?? 0) + 1);
    });

    const growth = Array.from({ length: 30 }, (_, index) => {
      const pointDate = new Date(now);
      pointDate.setDate(now.getDate() - (29 - index));
      const key = this.toTrendKey(pointDate.toISOString());

      return {
        label: pointDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        subscribers: growthMap.get(key) ?? 0,
      };
    });

    return {
      totalSubscribers: activeSubscribers.length,
      newToday: activeSubscribers.filter(
        (subscriber) => new Date(subscriber.created_at) >= startOfToday,
      ).length,
      weeklySubscribers: activeSubscribers.filter(
        (subscriber) => new Date(subscriber.created_at) >= startOfWeek,
      ).length,
      monthlySubscribers: activeSubscribers.filter(
        (subscriber) => new Date(subscriber.created_at) >= startOfMonth,
      ).length,
      recentSubscribers: subscribers.slice(0, 8),
      growth,
    };
  }

  private toTrendKey(dateValue: string) {
    const date = new Date(dateValue);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
