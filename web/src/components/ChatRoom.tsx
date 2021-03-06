import { observer } from "mobx-react-lite";
import React, { useLayoutEffect, useRef, useState } from "react";
import { Scrollbar } from "react-scrollbars-custom";
import { ScrollState } from "react-scrollbars-custom/dist/types/types";
import styled, { css } from "styled-components";
import { AttachmentStore } from "../stores/AttachmentsStore";
import { IFile } from "../stores/ChatStore";
import { useRootStore } from "../stores/RootStore";
import { MyScrollbar } from "../utils/Scrollbar";
import { Files } from "./Files";
import { Images } from "./Images";

export const ChatRoom = observer(() => {
  const rootStore = useRootStore();
  const scrollbarRef = useRef<Scrollbar>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useLayoutEffect(() => {
    const initialFetch = rootStore.chatStore.messagesInfo.get(
      rootStore.chatStore.activeChat!
    )?.initialFetch;
    const activeChat = rootStore.chatStore.activeChat;

    //Todo onInitialFetch true
    if (!initialFetch || activeChat) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [
    rootStore.chatStore.messagesInfo.get(rootStore.chatStore.activeChat!)
      ?.initialFetch,
    rootStore.chatStore.activeChat,
  ]);

  return (
    <StyledScrollbar
      elementRef={scrollbarRef}
      autoHide
      noScrollX
      onUpdate={async (
        scrollValues: ScrollState,
        prevScrollValues: ScrollState
      ) => {
        const activeChat = rootStore.chatStore.activeChat;
        const recipientUuid =
          rootStore.chatStore.incomingMessage?.recipientUuid;
        const senderUuid = rootStore.chatStore.incomingMessage?.senderUuid;

        //scrollToBottom on new received, sent message
        if (activeChat === (recipientUuid || senderUuid)) {
          scrollbarRef.current!.scrollToBottom();
          rootStore.chatStore.setIncomingMessage(null);
        }

        const roomId = rootStore.chatStore.activeChat;
        const room = rootStore.chatStore.messagesInfo.get(roomId ?? "");

        if (!room) {
          return;
        }

        if (
          scrollValues.scrollTop === 0 &&
          !isFetching &&
          room.hasMore &&
          !room.initialFetch
        ) {
          const scroll = scrollbarRef.current!;

          try {
            console.log("Fetching");
            setIsFetching(true);
            await rootStore.chatStore.fetchChatMessages();
            const scrollPosition =
              scroll.scrollHeight - prevScrollValues.scrollHeight;

            scroll.scrollTo(0, scrollPosition);

            setIsFetching(false);
            console.log("Done fetching");
          } catch (ex) {
            console.log("Error during fetching messages", ex.message);
          }
        }
      }}
    >
      <Container>
        <MessageDate>Dziś</MessageDate>
        {rootStore.chatStore.roomMessages.map((messages) => {
          const sender = rootStore.userStore.uuid === messages[0].sender.uuid;
          return (
            <MessageContainer key={messages[0].uuid} messagesSender={sender}>
              <GroupMessages messagesSender={sender}>
                {messages.map((message) => {
                  const files: IFile[] = [];
                  const images: AttachmentStore.Image[] = [];

                  if (message.files!.length !== 0) {
                    for (const file of message.files!) {
                      files.push(file);
                    }
                  }

                  if (message.images!.length !== 0) {
                    for (const image of message.images!) {
                      images.push(image);
                    }
                  }

                  return (
                    <React.Fragment key={message.uuid}>
                      {message.text === "" &&
                      (message.files?.length !== 0 ||
                        message.images?.length !== 0) ? null : (
                        <Message key={message.uuid} sender={sender}>
                          {message.text}
                        </Message>
                      )}
                      {files.length !== 0 && (
                        <Files files={files} sender={sender} />
                      )}

                      {images.length !== 0 && <Images images={images} />}
                    </React.Fragment>
                  );
                })}
              </GroupMessages>
              {!sender && <Avatar src="assets/defaultAvatar.svg" />}
            </MessageContainer>
          );
        })}
      </Container>
    </StyledScrollbar>
  );
});

const Container = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  padding: 0 20px 0 12px;
  grid-row-gap: 15px;
  padding-bottom: 20px;

  -webkit-touch-callout: text; /* iOS Safari */
  -webkit-user-select: text; /* Safari */
  -khtml-user-select: text; /* Konqueror HTML */
  -moz-user-select: text; /* Old versions of Firefox */
  -ms-user-select: text; /* Internet Explorer/Edge */
  user-select: text; /* Non-prefixed version, currently
                                supported by Chrome, Edge, Opera and Firefox */
`;

const GroupMessages = styled.div<{ messagesSender: boolean }>`
  display: grid;
  grid-gap: 2px;
  justify-items: ${(props) => props.messagesSender && "flex-end"};
`;

const MessageDate = styled.h4`
  display: grid;
  font-weight: 500;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.4);
  font-size: 12px;
  justify-self: center;
`;

const MessageContainer = styled.div<{ messagesSender: boolean }>`
  display: grid;
  grid-gap: 2px;
  align-items: flex-end;
  grid-template-columns: ${(props) => !props.messagesSender && "36px 1fr"};
`;

const Message = styled.div<{ sender: boolean }>`
  display: grid;
  font-size: 14px;
  padding: 6px 12px 7px;
  max-width: 85%;
  width: fit-content;
  min-height: 32px;
  box-sizing: border-box;
  overflow-wrap: anywhere;
  background-color: ${({ theme, sender }) =>
    sender ? "#09f" : theme.item.hover};
  color: ${(props) => props.sender && "#fff"};
  ${({ sender }) =>
    !sender &&
    css`
      border-top-right-radius: 1.3em;
      border-bottom-right-radius: 1.3em;
      :first-child {
        border-top-left-radius: 1.3em;
      }
      :last-child {
        border-bottom-left-radius: 1.3em;
      }
    `}
  ${({ sender }) =>
    sender &&
    css`
      border-top-left-radius: 1.3em;
      border-bottom-left-radius: 1.3em;
      :first-child {
        border-top-right-radius: 1.3em;
      }
      :last-child {
        border-bottom-right-radius: 1.3em;
      }
    `}
`;

const Avatar = styled.img`
  display: grid;
  grid-row: 1;
  border-radius: 50%;
  width: 32px;
  height: 32px;
`;

const StyledScrollbar = styled(MyScrollbar)`
  border-left: ${({ theme }) => `1px solid ${theme.divider.color}`};
  box-sizing: border-box;

  .ScrollbarsCustom-Thumb {
    background: ${({ theme }) => theme.scroll.color} !important;
  }
`;
