import React from "react";
import { Client } from "urql";
import { StoreContext } from "..";
import { ChatStore } from "./ChatStore";
import { UserStore } from "./UserStore";

export class RootStore {
  public readonly userStore: UserStore;
  public readonly chatStore: ChatStore;

  constructor(public readonly urqlClient: Client) {
    this.userStore = new UserStore(this);
    this.chatStore = new ChatStore(this);
  }
}

export const useRootStore = () => React.useContext(StoreContext);