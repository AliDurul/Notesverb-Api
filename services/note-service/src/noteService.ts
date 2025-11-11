import { createServiceError, sanitizeInput } from "@shared/utils";
import { CreateNoteRequest, Note } from "@shared/types";
import prisma from "./database";
// import { TagsServiceClient } from "./tagsServiceClient";

export class NotesService {
    // private tagsServiceClient: TagsServiceClient;
    // constructor() {
    //     this.tagsServiceClient = new TagsServiceClient();
    // }

    async createNote(
        userId: string,
        noteData: CreateNoteRequest,
        authToken?: string
    ): Promise<Note> {
        // sanitize input data

        //Create note
        const note = await prisma.note.create({
            data: {
                userId,
                title: noteData.title,
                content: noteData.content,
            },
            include: {
                noteTags: true,
            },
        });

        //TODO: add tags to note if provided
        // if (noteData.tagIds && note.noteTags.length === 0) {
        //     // Validate tags exists and belongs to user
        //     if (authToken) {
        //         await this.tagsServiceClient.validateTags(noteData.tagIds, authToken);
        //     }
        //     await this.addTagsToNote(note.id, noteData.tagIds);

        //     // fetch the note again with tags
        //     return this.getNoteById(note.id, userId);
        // }

        return note as Note;
    }

    async getNoteById(noteId: string, userId: string): Promise<Note> {
        const note = await prisma.note.findFirst({
            where: {
                id: noteId,
                userId,
                isDeleted: false,
            },
            include: {
                noteTags: true,
            },
        });

        if (!note) {
            throw createServiceError("Note not found", 404);
        }

        return note as Note;
    }

    async getNotesByUser(
        userId: string,
        page: number = 1,
        limit: number = 50,
        search?: string
    ): Promise<{
        notes: Note[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        // build where clause
        const whereClause: any = {
            userId,
            isDeleted: false,
        };

        // add search functionality
        if (search) {
            whereClause.OR = [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    content: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where: whereClause,
                include: {
                    noteTags: true,
                },
                skip,
                take: limit,
                orderBy: { updatedAt: "desc" },
            }),
            prisma.note.count({
                where: whereClause,
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            notes,
            total,
            page,
            totalPages,
        };
    }

    private async addTagsToNote(noteId: string, tagIds: string[]): Promise<void> {
        const noteTagData = tagIds.map((tagId) => ({
            noteId,
            tagId,
        }));

        await prisma.noteTag.createMany({
            data: noteTagData,
            skipDuplicates: true, // avoid errors if tag is already associated
        });
    }

    async getNotesByTag(
        userId: string,
        tagId: string,
        page: number = 1,
        limit: number = 50,
        authToken?: string
    ): Promise<{
        notes: Note[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        // if (authToken) {
        //     await this.tagsServiceClient.validateTags([tagId], authToken);
        // }

        const skip = (page - 1) * limit;

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where: {
                    userId,
                    isDeleted: false,
                    noteTags: {
                        some: {
                            tagId,
                        },
                    },
                },
                include: {
                    noteTags: true,
                },
                skip,
                take: limit,
                orderBy: { updatedAt: "desc" },
            }),
            prisma.note.count({
                where: {
                    userId,
                    isDeleted: false,
                    noteTags: {
                        some: {
                            tagId,
                        },
                    },
                },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            notes,
            total,
            page,
            totalPages,
        };
    }
}