import {
  users,
  posts,
  likes,
  comments,
  rentalRequests,
  badges,
  userBadges,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type PostWithUser,
  type UserWithStats,
  type RentalRequest,
  type InsertRentalRequest,
  type Comment,
  type InsertComment,
  type Badge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStats(userId: string, stats: { ecoPoints?: number; waterSaved?: string; carbonReduced?: string; itemsReused?: number }): Promise<void>;
  getUserWithStats(id: string): Promise<UserWithStats | undefined>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<PostWithUser[]>;
  getPost(id: string, userId?: string): Promise<PostWithUser | undefined>;
  getPostsByUser(userId: string): Promise<Post[]>;
  getRentablePosts(limit?: number, offset?: number): Promise<PostWithUser[]>;

  // Like operations
  toggleLike(userId: string, postId: string): Promise<boolean>;
  isPostLiked(userId: string, postId: string): Promise<boolean>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: string): Promise<Comment[]>;

  // Rental operations
  createRentalRequest(request: InsertRentalRequest): Promise<RentalRequest>;
  getRentalRequestsByUser(userId: string): Promise<RentalRequest[]>;
  updateRentalRequestStatus(id: string, status: string): Promise<void>;

  // Badge operations
  getUserBadges(userId: string): Promise<Badge[]>;
  initializeBadges(): Promise<void>;
  checkAndAwardBadges(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string, stats: { ecoPoints?: number; waterSaved?: string; carbonReduced?: string; itemsReused?: number }): Promise<void> {
    await db
      .update(users)
      .set({
        ...stats,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getUserWithStats(id: string): Promise<UserWithStats | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;

    const [postsCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(eq(posts.userId, id));

    const userBadges = await this.getUserBadges(id);

    return {
      ...user,
      postsCount: postsCount.count,
      followersCount: 0, // TODO: Implement following system
      followingCount: 0, // TODO: Implement following system
      badges: userBadges,
    };
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    
    // Update user stats
    const currentUser = await this.getUser(post.userId);
    if (currentUser) {
      const newEcoPoints = (currentUser.ecoPoints || 0) + (post.ecoPoints || 0);
      const newWaterSaved = (parseFloat(currentUser.waterSaved || "0") + parseFloat(post.waterSaved || "0")).toString();
      const newCarbonReduced = (parseFloat(currentUser.carbonReduced || "0") + parseFloat(post.carbonReduced || "0")).toString();
      const newItemsReused = (currentUser.itemsReused || 0) + 1;

      await this.updateUserStats(post.userId, {
        ecoPoints: newEcoPoints,
        waterSaved: newWaterSaved,
        carbonReduced: newCarbonReduced,
        itemsReused: newItemsReused,
      });

      // Check for new badges
      await this.checkAndAwardBadges(post.userId);
    }

    return newPost;
  }

  async getPosts(limit = 20, offset = 0): Promise<PostWithUser[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        imageUrl: posts.imageUrl,
        caption: posts.caption,
        tags: posts.tags,
        thriftStore: posts.thriftStore,
        pricePaid: posts.pricePaid,
        originalBrand: posts.originalBrand,
        availableForRent: posts.availableForRent,
        rentPrice: posts.rentPrice,
        size: posts.size,
        waterSaved: posts.waterSaved,
        carbonReduced: posts.carbonReduced,
        ecoPoints: posts.ecoPoints,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
          location: users.location,
          username: users.username,
          ecoPoints: users.ecoPoints,
          waterSaved: users.waterSaved,
          carbonReduced: users.carbonReduced,
          itemsReused: users.itemsReused,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  async getPost(id: string, userId?: string): Promise<PostWithUser | undefined> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        imageUrl: posts.imageUrl,
        caption: posts.caption,
        tags: posts.tags,
        thriftStore: posts.thriftStore,
        pricePaid: posts.pricePaid,
        originalBrand: posts.originalBrand,
        availableForRent: posts.availableForRent,
        rentPrice: posts.rentPrice,
        size: posts.size,
        waterSaved: posts.waterSaved,
        carbonReduced: posts.carbonReduced,
        ecoPoints: posts.ecoPoints,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
          location: users.location,
          username: users.username,
          ecoPoints: users.ecoPoints,
          waterSaved: users.waterSaved,
          carbonReduced: users.carbonReduced,
          itemsReused: users.itemsReused,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id));

    if (result.length === 0) return undefined;

    const post = result[0];
    let isLiked = false;

    if (userId) {
      isLiked = await this.isPostLiked(userId, id);
    }

    return { ...post, isLiked };
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getRentablePosts(limit = 20, offset = 0): Promise<PostWithUser[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        imageUrl: posts.imageUrl,
        caption: posts.caption,
        tags: posts.tags,
        thriftStore: posts.thriftStore,
        pricePaid: posts.pricePaid,
        originalBrand: posts.originalBrand,
        availableForRent: posts.availableForRent,
        rentPrice: posts.rentPrice,
        size: posts.size,
        waterSaved: posts.waterSaved,
        carbonReduced: posts.carbonReduced,
        ecoPoints: posts.ecoPoints,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
          location: users.location,
          username: users.username,
          ecoPoints: users.ecoPoints,
          waterSaved: users.waterSaved,
          carbonReduced: users.carbonReduced,
          itemsReused: users.itemsReused,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.availableForRent, true))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  async toggleLike(userId: string, postId: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

    if (existingLike.length > 0) {
      // Unlike
      await db
        .delete(likes)
        .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
      
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));
      
      return false;
    } else {
      // Like
      await db.insert(likes).values({ userId, postId });
      
      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));
      
      return true;
    }
  }

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    
    return result.length > 0;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, comment.postId));
    
    return newComment;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async createRentalRequest(request: InsertRentalRequest): Promise<RentalRequest> {
    const [newRequest] = await db.insert(rentalRequests).values(request).returning();
    return newRequest;
  }

  async getRentalRequestsByUser(userId: string): Promise<RentalRequest[]> {
    return await db
      .select()
      .from(rentalRequests)
      .where(eq(rentalRequests.requesterId, userId))
      .orderBy(desc(rentalRequests.createdAt));
  }

  async updateRentalRequestStatus(id: string, status: string): Promise<void> {
    await db
      .update(rentalRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(rentalRequests.id, id));
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    const result = await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        icon: badges.icon,
        requirement: badges.requirement,
        createdAt: badges.createdAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

    return result;
  }

  async initializeBadges(): Promise<void> {
    const existingBadges = await db.select().from(badges);
    
    if (existingBadges.length === 0) {
      const defaultBadges = [
        {
          name: "Eco Star",
          description: "50+ eco-friendly posts",
          icon: "♻️",
          requirement: "posts_count_50",
        },
        {
          name: "Green Icon",
          description: "1000+ eco points",
          icon: "💚",
          requirement: "eco_points_1000",
        },
        {
          name: "Water Saver",
          description: "200L+ water saved",
          icon: "💧",
          requirement: "water_saved_200",
        },
        {
          name: "Trendsetter",
          description: "100+ likes average",
          icon: "🌟",
          requirement: "likes_average_100",
        },
        {
          name: "Thrift Champion",
          description: "100 thrift finds",
          icon: "🏆",
          requirement: "posts_count_100",
        },
        {
          name: "Planet Protector",
          description: "Save 100kg CO₂",
          icon: "🌍",
          requirement: "carbon_reduced_100",
        },
      ];

      await db.insert(badges).values(defaultBadges);
    }
  }

  async checkAndAwardBadges(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const userPosts = await this.getPostsByUser(userId);
    const existingBadges = await this.getUserBadges(userId);
    const existingBadgeNames = existingBadges.map(b => b.name);

    const allBadges = await db.select().from(badges);
    
    for (const badge of allBadges) {
      if (existingBadgeNames.includes(badge.name)) continue;

      let shouldAward = false;

      switch (badge.requirement) {
        case "posts_count_50":
          shouldAward = userPosts.length >= 50;
          break;
        case "posts_count_100":
          shouldAward = userPosts.length >= 100;
          break;
        case "eco_points_1000":
          shouldAward = (user.ecoPoints || 0) >= 1000;
          break;
        case "water_saved_200":
          shouldAward = parseFloat(user.waterSaved || "0") >= 200;
          break;
        case "carbon_reduced_100":
          shouldAward = parseFloat(user.carbonReduced || "0") >= 100;
          break;
        case "likes_average_100":
          const totalLikes = userPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
          const avgLikes = userPosts.length > 0 ? totalLikes / userPosts.length : 0;
          shouldAward = avgLikes >= 100;
          break;
      }

      if (shouldAward) {
        await db.insert(userBadges).values({
          userId,
          badgeId: badge.id,
        });
      }
    }
  }
}

export const storage = new DatabaseStorage();
