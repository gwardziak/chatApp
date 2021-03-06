import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../db/entities/User";
import { GraphQLServer } from "../GraphQLServer";
import { UserMessageObjectType } from "../message/dto/MessageObjectType";
import { AuthorizeInput } from "./dto/AuthorizeInput";
import { SignInInput } from "./dto/SignInInput";
import { SignUpInput } from "./dto/SignUpInput";
import { UserObjectType } from "./dto/UserObjectType";
import { UserService } from "./UserService";

@Resolver()
export class UserResolver {
  private constructor(private readonly userService: UserService) {}

  @Authorized()
  @Query(() => UserObjectType, { nullable: true })
  async me(@Ctx() { user }: GraphQLServer.Context): Promise<User | null> {
    return await this.userService.me(user);
  }

  @Query(() => [UserMessageObjectType])
  async findUser(
    @Arg("phase") phase: string,
    @Ctx() { user }: GraphQLServer.Context
  ): Promise<User[]> {
    return await this.userService.findUsers(user!, phase);
  }

  @Query(() => UserObjectType, { nullable: true })
  async authorize(
    @Arg("token") token: AuthorizeInput,
    @Ctx() context: GraphQLServer.Context
  ): Promise<User | null> {
    return await this.userService.authorize(token, context);
  }

  @Mutation(() => Boolean)
  async signUp(@Arg("options") options: SignUpInput): Promise<boolean> {
    await this.userService.createUser(options);
    return true;
  }

  @Mutation(() => String)
  async signIn(
    @Arg("options")
    options: SignInInput
  ): Promise<string> {
    return await this.userService.login(options);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async signOut(@Ctx() context: GraphQLServer.Context): Promise<boolean> {
    context.assosiateWithUser(null);
    return true;
  }
}
