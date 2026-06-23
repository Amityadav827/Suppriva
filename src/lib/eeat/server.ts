import type {
  Author,
  ExpertAttribution,
  Reviewer,
} from "@/lib/database/types";
import { AuthorsService, ReviewersService } from "@/services/expert-profiles.service";

type ResolveExpertAttributionInput = {
  authorId?: string | null;
  reviewerId?: string | null;
  updatedAt?: string | null;
};

const authorsService = new AuthorsService();
const reviewersService = new ReviewersService();

async function resolveAuthor(authorId?: string | null): Promise<Author> {
  if (!authorId) {
    return authorsService.getDefaultProfile();
  }

  try {
    return await authorsService.getProfileById(authorId);
  } catch {
    return authorsService.getDefaultProfile();
  }
}

async function resolveReviewer(reviewerId?: string | null): Promise<Reviewer> {
  if (!reviewerId) {
    return reviewersService.getDefaultProfile();
  }

  try {
    return await reviewersService.getProfileById(reviewerId);
  } catch {
    return reviewersService.getDefaultProfile();
  }
}

export async function resolveExpertAttribution({
  authorId,
  reviewerId,
  updatedAt,
}: ResolveExpertAttributionInput): Promise<ExpertAttribution> {
  const [author, reviewer] = await Promise.all([
    resolveAuthor(authorId),
    resolveReviewer(reviewerId),
  ]);

  return {
    author,
    reviewer,
    lastUpdated: updatedAt ?? null,
  };
}

