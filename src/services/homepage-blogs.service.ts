import {
  DEFAULT_HOMEPAGE_BLOGS,
  mergeHomepageBlogsCms,
  type HomepageBlogsCms,
} from "@/lib/homepage-blogs";
import { ValidationError } from "@/lib/errors/ValidationError";
import { validateHomepageBlogsInput } from "@/lib/validators/homepage-blogs.validator";
import {
  SupabaseHomepageBlogsRepository,
  type HomepageBlogsRepository,
} from "@/repositories/homepage-blogs.repository";

export class HomepageBlogsService {
  constructor(
    private readonly homepageBlogsRepository: HomepageBlogsRepository =
      new SupabaseHomepageBlogsRepository(),
  ) {}

  async getHomepageBlogs() {
    const blogs = await this.homepageBlogsRepository.getHomepageBlogs();

    return mergeHomepageBlogsCms(blogs);
  }

  async safeGetHomepageBlogs() {
    try {
      return await this.getHomepageBlogs();
    } catch {
      return DEFAULT_HOMEPAGE_BLOGS;
    }
  }

  async updateHomepageBlogs(input: HomepageBlogsCms) {
    const normalizedInput = this.normalizeInput(input);
    const validation = validateHomepageBlogsInput(normalizedInput);

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(" "));
    }

    const blogs = await this.homepageBlogsRepository.updateHomepageBlogs(
      normalizedInput,
    );

    return mergeHomepageBlogsCms(blogs);
  }

  private normalizeInput(input: HomepageBlogsCms): HomepageBlogsCms {
    return {
      settings: {
        ...input.settings,
        max_blogs: Math.floor(Number(input.settings.max_blogs)),
        sort_mode: input.settings.sort_mode,
        show_featured_badge: Boolean(input.settings.show_featured_badge),
      },
    };
  }
}
