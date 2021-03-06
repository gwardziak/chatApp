import { BaseEmoji, EmojiData, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { useClickAway } from "react-use";
import styled from "styled-components";
import { Attachment } from "../Icons/Attachment";
import { Camera } from "../Icons/Camera";
import { Close } from "../Icons/Close";
import { EmojiFolder } from "../Icons/EmojiFolder";
import { File } from "../Icons/File";
import { GamePad } from "../Icons/GamePad";
import { GifFolder } from "../Icons/GifFolder";
import { Like } from "../Icons/Like";
import { Microphone } from "../Icons/Microphone";
import { Plus } from "../Icons/Plus";
import { Smile } from "../Icons/Smile";
import { useRootStore } from "../stores/RootStore";
import { mediaQuery } from "../utils/css/cssMedia";
import { useMatchesMediaQuery } from "../utils/css/useMatchesMediaQuery";
import { ContentEditable } from "../utils/ReactContentEditable";
import { graphQLError } from "./../utils/graphQLError";
import { EmojiPicker } from "./EmojiPicker";
import { Modal } from "./Modal";

type SendMessageProps = {
  uploadFiles: File[];
  setUploadFiles(val: File[]): void;
};

export const SendMessage = observer(
  ({ uploadFiles, setUploadFiles }: SendMessageProps) => {
    const rootStore = useRootStore();
    const isMobile = useMatchesMediaQuery([
      mediaQuery.xs,
      mediaQuery.sm,
      mediaQuery.md,
    ]);
    const defaultInput = "Aa";
    const [toggle, setToggle] = useState<boolean>(false);
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] =
      useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const emojiRef = useRef(null);
    const inputRef = useRef<HTMLElement>(null);
    const [emojiStartPosition, setEmojiStartPosition] = useState<number>(-1);
    const emojiStartingChars: string[] = [":", ";", "="];
    const uploadFilesRef = useRef<HTMLInputElement>(null);
    const [chatroomError, setChatroomError] = useState<boolean>(false);

    useClickAway(emojiRef, (e: any) => {
      if (e.srcElement.parentElement.attributes.name?.value === "SmileIcon") {
        return;
      }

      setIsEmojiPickerVisible(false);
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;

      if (files && files.length) {
        setUploadFiles([...uploadFiles, ...files]);
      }
      event.target.value = "";
    };

    const handleRemoveFile = (key: number) => {
      const filter = uploadFiles.filter((file, i) => key !== i);
      setUploadFiles(filter);
    };

    const pasteAsPlainText = (event: ClipboardEvent) => {
      event.preventDefault();

      const text = event.clipboardData?.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    };

    return (
      <Container isToggle={toggle}>
        {chatroomError && (
          <Modal
            title="Chatroom error"
            message="Please select an active chatroom."
            isVisible={chatroomError}
            setIsVisible={setChatroomError}
          />
        )}

        <PlusIcon onClick={() => setToggle(!toggle)} isToggle={toggle} />
        {!isMobile && (
          <>
            {toggle && !isMobile && (
              <>
                <CameraIcon />
                <GamePadIcon />
                <MicrophoneIcon />
              </>
            )}
            <GifIcon />
            <EmojiIcon />
            <AttachmentIcon
              onClick={() =>
                uploadFilesRef.current && uploadFilesRef.current.click()
              }
            />
          </>
        )}
        {isMobile && toggle && (
          <MobileIconsContainer>
            <AttachmentIcon
              onClick={() =>
                uploadFilesRef.current && uploadFilesRef.current.click()
              }
            />
            <EmojiIcon />
            <GifIcon />
            <MicrophoneIcon />
            <GamePadIcon />
            <CameraIcon />
          </MobileIconsContainer>
        )}
        <MessageContainer isToggle={toggle} hasFile={uploadFiles?.length > 0}>
          <UploadFiles
            multiple
            type="file"
            ref={uploadFilesRef}
            onChange={handleFileUpload}
          />

          {uploadFiles.length > 0 && (
            <>
              <Files>
                {uploadFiles.map((file: File, i) => (
                  <FileContainer key={i}>
                    {file.type.includes("image") ? (
                      <UploadImg src={URL.createObjectURL(file)}></UploadImg>
                    ) : (
                      <UploadFile>
                        <UploadFileImgContainer>
                          <FileIcon />
                        </UploadFileImgContainer>
                        <UploadFilename>{file.name}</UploadFilename>
                      </UploadFile>
                    )}
                    <CloseFile onClick={() => handleRemoveFile(i)}>
                      <CloseIcon />
                    </CloseFile>
                  </FileContainer>
                ))}
                <UploadMore
                  onClick={() =>
                    uploadFilesRef.current && uploadFilesRef.current.click()
                  }
                >
                  <UploadMoreImg />
                </UploadMore>
              </Files>
            </>
          )}
          <Input
            ref={inputRef}
            placeholder={defaultInput}
            html={input}
            onPaste={pasteAsPlainText}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setInput(e.target.value)
            }
            onKeyDown={async (e: KeyboardEvent) => {
              if (emojiStartingChars.includes(e.key)) {
                setEmojiStartPosition(input.replace(/&nbsp;/g, " ").length);
              }

              if (e.key === " " && emojiStartPosition !== -1) {
                const emojiString = input.substring(emojiStartPosition);
                const emojis: EmojiData[] | null =
                  emojiIndex.search(emojiString);

                if (
                  emojis === null ||
                  emojis.length === 0 ||
                  !emojis[0].hasOwnProperty("native")
                ) {
                  setEmojiStartPosition(-1);
                } else {
                  setInput(
                    input.substr(0, emojiStartPosition) +
                      (emojis[0] as BaseEmoji).native
                  );
                  setEmojiStartPosition(-1);
                }
              }
              if (e.keyCode === 13) {
                e.preventDefault();

                try {
                  rootStore.chatStore.sendMessage(
                    input.replace(/&nbsp;/g, " "),
                    uploadFiles
                  );
                } catch (ex) {
                  const chatError = graphQLError(ex, "chat doesnt exist");

                  if (chatError) {
                    setChatroomError(true);
                    return;
                  }

                  throw new Error(
                    "Error during sending a message" + ex.message
                  );
                } finally {
                  setInput("");
                  setUploadFiles([]);
                }
              }
            }}
          />

          <SmileIcon
            name="SmileIcon"
            onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
          />
          {isEmojiPickerVisible && (
            <EmojiPicker
              native={true}
              ref={emojiRef}
              setIsVisible={setIsEmojiPickerVisible}
              onSelect={(emoji: BaseEmoji) => {
                setInput(input + emoji.native);
                setIsEmojiPickerVisible(false);
                inputRef.current && inputRef.current.focus();
              }}
            />
          )}
        </MessageContainer>
        <LikeIcon />
      </Container>
    );
  }
);
const Container = styled.div<{ isToggle: boolean }>`
  display: grid;
  grid-template-columns: ${(props) =>
    props.isToggle
      ? "28px 36px 36px 36px 36px 36px 36px 1fr 36px"
      : "28px 36px 36px 36px 1fr 36px"};
  padding: 0 8px 8px;
  grid-column-gap: 8px;
  align-items: flex-end;
  border-left: ${({ theme }) => `1px solid ${theme.divider.color}`};

  @media ${mediaQuery.xs}, ${mediaQuery.sm}, ${mediaQuery.md} {
    grid-template-columns: ${(props) => props.isToggle && "28px 1fr 36px"};
    grid-template-rows: ${(props) => (props.isToggle ? "52px 1fr" : "1fr")};
    grid-row-gap: 8px;
  }
`;

const PlusIcon = styled(Plus)<{ isToggle?: boolean }>`
  height: 24px;
  width: 24px;
  justify-self: center;
  margin-bottom: 6px;
  fill: ${(props) =>
    props.isToggle ? "rgba(134, 142, 153, 0.75)" : "rgb(0, 153, 255)"};
  transition: transform 0.22s cubic-bezier(0.5, 0, 0.4, 1);
  transform: ${(props) => props.isToggle && "rotate(45deg)"};
  cursor: pointer;
  @media ${mediaQuery.xs}, ${mediaQuery.sm}, ${mediaQuery.md} {
    grid-row: ${(props) => props.isToggle && 2};
  }
`;

const UploadFiles = styled.input`
  display: none;
`;

const GifIcon = styled(GifFolder)`
  height: 36px;
  width: 36px;
  fill: rgb(0, 153, 255);
  cursor: pointer;
`;

const EmojiIcon = styled(EmojiFolder)`
  height: 36px;
  width: 36px;
  fill: rgb(0, 153, 255);
  cursor: pointer;
`;

const AttachmentIcon = styled(Attachment)`
  height: 36px;
  width: 36px;
  fill: rgb(0, 153, 255);
  cursor: pointer;
`;

const CameraIcon = styled(Camera)`
  height: 36px;
  width: 36px;
  fill: rgb(0, 153, 255);
  cursor: pointer;
`;

const GamePadIcon = styled(GamePad)`
  height: 36px;
  width: 36px;
  fill: rgb(0, 153, 255);
  cursor: pointer;
`;

const MicrophoneIcon = styled(Microphone)`
  height: 36px;
  width: 36px;
  fill: rgb(0, 153, 255);
  cursor: pointer;
`;

const LikeIcon = styled(Like)`
  height: 36px;
  width: 36px;
  fill: rgb(0, 153, 255);
  cursor: pointer;
`;

const Files = styled.div`
  display: flex;
  grid-column: 1/3;
  overflow-y: auto;
  grid-row-gap: 2px;
  grid-column-gap: 12px;
`;

const MessageContainer = styled.div<{ isToggle: boolean; hasFile: boolean }>`
  display: grid;
  grid-template-columns: 1fr 24px;
  min-width: 100px;
  border-radius: 18px;
  padding: 0 8px 0 12px;
  align-items: flex-end;
  cursor: context-menu;
  font-size: 14px;

  grid-template-rows: ${({ hasFile }) => hasFile && "auto 1fr"};
  background-color: ${({ theme }) => theme.input.background};

  @media ${mediaQuery.xs}, ${mediaQuery.sm}, ${mediaQuery.md} {
    grid-column: ${(props) => (props.isToggle ? "2/3" : "2/6")};
  }
`;

const Input = styled(ContentEditable)`
  padding: 9px 0;
  outline: 0;
  cursor: text;
  overflow: hidden;
  max-height: 144px;
  overflow-y: auto;
  :empty {
    color: ${({ theme }) => theme.input.color};
  }
  :empty:before {
    cursor: text;
    color: ${({ theme }) => theme.input.placeholder};
    content: attr(placeholder);
    display: block; // For Firefox
  }
`;

const SmileIcon = styled(Smile)`
  height: 24px;
  width: 24px;
  fill: #0099ff;
  cursor: pointer;
  margin-bottom: 7px;
`;

const MobileIconsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 36px);
  background-color: ${({ theme }) => theme.item.select};
  column-gap: 16px;
  grid-column: 1/4;
  padding: 8px 0 8px 8px;
  margin: 0 -8px;
`;

const FileContainer = styled.div`
  position: relative;
  height: 62px;
  display: grid;
  align-content: flex-end;
  padding-bottom: 3px;
`;

const UploadImg = styled.img`
  display: grid;
  border-radius: 10px;
  object-fit: cover;
  height: 48px;
  width: 48px;
`;

const UploadFile = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr;
  border-radius: 10px;
  height: 48px;
  width: 152px;
  background-color: ${({ theme }) => theme.svg.background};
  padding: 0 16px 0 8px;
  box-sizing: border-box;
  grid-column-gap: 10px;
`;
const UploadFileImgContainer = styled.div`
  display: grid;
  height: 30px;
  width: 30px;

  background-color: ${({ theme }) => theme.body.background};
  align-self: center;
  border-radius: 50%;
  align-content: center;
  justify-content: center;
`;

const FileIcon = styled(File)`
  align-self: center;
  height: 70%;
  width: 90%;
  justify-self: center;
  fill: ${({ theme }) => theme.text.color.primary};
`;

const UploadFilename = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-weight: 600;
  font-size: 15px;
  align-self: center;
  word-break: break-word;
`;

const CloseFile = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.emojiPicker.background};
  height: 24px;
  width: 24px;
  top: 8px;
  right: -8px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: grid;
  justify-content: center;
  align-content: center;
  :hover {
    background-color: ${({ theme }) => theme.svg.hover};
  }
`;

const CloseIcon = styled(Close)`
  height: 12px;
  width: 12px;

  fill: ${({ theme }) => theme.svg.color};
`;

const UploadMore = styled.div`
  display: grid;
  border-radius: 10px;
  height: 48px;
  width: 48px;
  min-width: 48px;
  justify-content: center;
  align-content: center;
  background-color: ${({ theme }) => theme.svg.background};
  align-self: flex-end;
  margin-bottom: 3px;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.img.hover};
  }
`;

const UploadMoreImg = styled.div`
  height: 24px;
  width: 24px;
  background-image: url("assets/uploadFiles.png");
  background-size: cover;
  background-repeat: no-repeat;
  filter: ${({ theme }) => theme.img.filter};
`;
