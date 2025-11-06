import { UpdateProfileRequest, UserProfile } from "@shared/types";
import { AuthClient } from "./authClient";
import prisma from "./database";
import { createServiceError, sanitizeInput } from "@shared/utils";

export class UserService {
  private authClient: AuthClient;

  constructor() {
    this.authClient = new AuthClient();
  }

  async createProfile(
    profileData: Partial<UpdateProfileRequest>
  ): Promise<UserProfile> {
    console.log('profileData', profileData);
    // sanitize input data
    // const sanitizedData = this.sanitizeProfileData(profileData);

    // create new profile
    const profile = await prisma.userProfile.create({
      data: {
        id: profileData.id,
        email: profileData.email!,
      },
    });

    return profile;
  }

  async getProfile(id: string): Promise<UserProfile | null> {
    const profile = await prisma.userProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw createServiceError("User profile not found", 404);
    }

    return profile;
  }

  async updateProfile(
    id: string,
    profileData: Partial<UpdateProfileRequest>
  ): Promise<UserProfile> {
    // check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      // if no profile exists, create one
      return this.updateProfile(id, profileData);
    }

    // sanitize input data
    // const sanitizedData = this.sanitizeProfileData(profileData);

    // update existing profile
    const updatedProfile = await prisma.userProfile.update({
      where: { id },
      data: profileData,
    });

    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    const profile = await prisma.userProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw createServiceError("User profile not found", 404);
    }

    await prisma.userProfile.delete({
      where: { id },
    });
  }

  // private sanitizeProfileData(
  //   data: Partial<UpdateProfileRequest>
  // ): Partial<UpdateProfileRequest> {
  //   const sanitized: any = {};

  //   if (data.firstName !== undefined) {
  //     sanitized.firstName = data.firstName
  //       ? sanitizeInput(data.firstName)
  //       : null;
  //   }

  //   if (data.lastName !== undefined) {
  //     sanitized.lastName = data.lastName ? sanitizeInput(data.lastName) : null;
  //   }

  //   if (data.bio !== undefined) {
  //     sanitized.bio = data.bio ? sanitizeInput(data.bio) : null;
  //   }

  //   if (data.avatarUrl !== undefined) {
  //     sanitized.avatarUrl = data.avatarUrl
  //       ? sanitizeInput(data.avatarUrl)
  //       : null;
  //   }

  //   if (data.preferences !== undefined) {
  //     sanitized.preferences = data.preferences ? data.preferences : null;
  //   }

  //   return sanitized;
  // }
}