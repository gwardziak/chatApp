import { Stream } from "stream";
import { PubSubEngine } from "type-graphql";
import { Inject, Service } from "typedi";
import { getRepository } from "typeorm";
import { FileService } from "../attachment/file/FileService";
import { ImageService } from "../attachment/image/ImageService";
import { File } from "../db/entities/File";
import { Image } from "../db/entities/Image";
import { Message } from "../db/entities/Message";
import { User } from "../db/entities/User";
import { upload } from "../utils/upload";
import { ChatroomService } from "./../chatroom/ChatroomService";
import { Chatroom } from "./../db/entities/Chatroom";

export namespace MessageService {
  export type SendMessage = {
    recipientUuid: string;
    text: string;
  };

  export type PaginateMessages = {
    friendUuid: string;
    limit: number;
    cursor?: string | null;
  };

  export type Attachment = {
    createReadStream: () => Stream;
    filename: string;
    mimetype: string;
    encoding: string;
  };
}

@Service()
export class MessageService {
  private constructor(
    @Inject("PUB_SUB") private readonly pubSub: PubSubEngine,
    private readonly chatroomService: ChatroomService,
    private readonly fileService: FileService,
    private readonly imageService: ImageService
  ) {}
  private messageRepository = getRepository(Message);
  private userRepository = getRepository(User);
  private chatroomRepository = getRepository(Chatroom);

  async getOne(uuid: string): Promise<Message | undefined> {
    return await this.messageRepository.findOne({ where: { uuid } });
  }

  async getAll(
    me: User,
    options: MessageService.PaginateMessages
  ): Promise<{
    messages: Message[];
    hasMore: boolean;
  }> {
    const realLimit = Math.min(50, options.limit);
    const realLimitPlusOne = realLimit + 1;

    const qb = this.messageRepository
      .createQueryBuilder("messages")
      .leftJoin("messages.sender", "sender")
      .leftJoin("messages.recipient", "recipient")
      .orderBy("messages.id", "DESC")
      .take(realLimitPlusOne)
      .where(
        `
            (sender.uuid = :recipientUuid AND recipient.id = :senderId) 
            OR 
            (sender.id = :senderId AND recipient.uuid = :recipientUuid)
        `,
        {
          senderId: me.id,
          recipientUuid: options.friendUuid,
        }
      );

    if (options.cursor) {
      qb.andWhere(
        "messages.id < (SELECT id from message where uuid = :cursor)",
        {
          cursor: options.cursor,
        }
      );
    }
    const messages = await qb.getMany();

    return {
      messages: messages.slice(0, realLimit),
      hasMore: messages.length === realLimitPlusOne,
    };
  }

  async firstMessages(user: User): Promise<Message[]> {
    const fetchFirstMessages = await this.messageRepository.query(
      `SELECT *, MAX(createdAt) as createdAt from
          (
            SELECT message.id, message.uuid, message.text, message.createdAt, message.updatedAt, sender.id as participant from message
              LEFT JOIN
              user as recipient
              ON message.recipientId = recipient.id
              LEFT JOIN
              user as sender
              ON message.senderId = sender.id
              WHERE message.recipientId = @userId

            UNION ALL

            SELECT message.id, message.uuid, message.text, message.createdAt, message.updatedAt, recipient.id as participant from message
              LEFT JOIN
              user as recipient
              ON message.recipientId = recipient.id
              LEFT JOIN
              user as sender
              ON message.senderId = sender.id
              WHERE message.senderId = @userId
            )
            GROUP BY participant
      `,
      [user.id]
    );

    const transformToObj = fetchFirstMessages.map((message: Message) => {
      const created = message.createdAt.toString().replace(" ", "T") + "Z";
      const updated = message.updatedAt.toString().replace(" ", "T") + "Z";

      return {
        id: message.id,
        uuid: message.uuid,
        text: message.text,
        createdAt: new Date(created),
        updatedAt: new Date(updated),
      };
    });
    return transformToObj;
  }

  async sendMessage(
    sender: User,
    options: MessageService.SendMessage,
    files: MessageService.Attachment[]
  ): Promise<void> {
    let room = await this.chatroomRepository
      .createQueryBuilder("chatroom")
      .leftJoinAndSelect("chatroom.participantA", "participantA")
      .leftJoinAndSelect("chatroom.participantB", "participantB")
      .where(
        `(participantA.id = :participantAId AND participantB.uuid = :participantBUuid) OR
      (participantA.uuid = :participantBUuid AND participantB.id = :participantAId)`,
        { participantAId: sender.id, participantBUuid: options.recipientUuid }
      )
      .getOne();

    if (!room) {
      const user = await this.userRepository.findOne({
        where: { uuid: options.recipientUuid },
      });

      if (!user) {
        throw new Error("Selected chat doesnt exist");
      }

      room = await this.chatroomService.createChatroom(user, sender);
    }

    const recipient =
      room.participantA.id === sender.id
        ? room.participantB
        : room.participantA;

    const message = new Message({
      text: options.text,
      sender,
      room,
      recipient,
    });

    const uploadFiles: File[] = [];
    const uploadImages: Image[] = [];

    if (files.length > 0) {
      const resolvedFiles: MessageService.Attachment[] = [];

      for (const file of files) {
        const result = await Promise.resolve(file);
        resolvedFiles.push(result);
      }

      const streams = resolvedFiles.map(async (file) => {
        return await upload(file);
      });

      const uploadMany = await Promise.all([...streams]);

      for (const file of uploadMany) {
        const attachment = {
          ...file,
          participantA: sender,
          participantB: recipient,
        };

        if (file.mimetype.includes("image")) {
          const newImage = await this.imageService.createImage(attachment);
          uploadImages.push(newImage);
        } else {
          const newFile = this.fileService.createFile(attachment);
          uploadFiles.push(newFile);
        }
      }

      message.images = [...uploadImages];
      message.files = [...uploadFiles];
    }

    await this.messageRepository.save(message);
    await this.pubSub.publish("NEW_MESSAGE", message);
  }
}
