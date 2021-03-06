import {
  BeforeInsert,
  Column,
  Entity,
  Generated,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Message } from "./Message";
import { User } from "./User";

export namespace File {
  export type Options = {
    name: string;
    file: Buffer;
    participantA: User;
    participantB: User;
    mimetype: string;
    message?: Message;
  };
}

@Entity()
export class File implements File.Options {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  @Generated("uuid")
  uuid!: string;

  @Column()
  name!: string;

  @Column({ type: "blob" })
  file!: Buffer;

  @Column()
  mimetype!: string;

  @Column()
  createdAt!: Date;

  @BeforeInsert()
  private setCreateDate(): void {
    this.createdAt = new Date();
  }

  @UpdateDateColumn()
  updatedAt!: Date;

  @Index()
  @ManyToOne(() => Message, (message) => message.files, {
    nullable: false,
  })
  message!: Message;

  @ManyToOne(() => User, {
    nullable: false,
  })
  public readonly participantA!: User;

  @ManyToOne(() => User, {
    nullable: false,
  })
  public readonly participantB!: User;

  constructor(options: File.Options) {
    if (options) {
      let participantA, participantB;
      if (options.participantA.id < options.participantB.id) {
        participantA = options.participantA;
        participantB = options.participantB;
      } else {
        participantA = options.participantB;
        participantB = options.participantA;
      }

      Object.assign(this, { ...options, participantA, participantB });
    }
    Object.assign(this, options);
  }
}
