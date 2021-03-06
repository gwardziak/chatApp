import { Field, InputType, Int } from "type-graphql";

export namespace IMessagePaginationInput {
  export type MessagesOptions = {
    friendUuid: string;
    limit: number;
    cursor?: string | null;
  };
}

@InputType()
export class MessagePaginationInput
  implements IMessagePaginationInput.MessagesOptions {
  @Field()
  public readonly friendUuid!: string;

  @Field(() => Int)
  public readonly limit!: number;

  @Field(() => String, { nullable: true })
  public readonly cursor!: string | null;
}
