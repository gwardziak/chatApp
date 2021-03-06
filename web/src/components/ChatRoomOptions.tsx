import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import Scrollbar from "react-scrollbars-custom";
import { ElementPropsWithElementRefAndRenderer } from "react-scrollbars-custom/dist/types/types";
import styled from "styled-components";
import { useRootStore } from "../stores/RootStore";
import { MyScrollbar } from "../utils/Scrollbar";
import { PrivacyMenu } from "./PrivacyMenu";
import { SettingsMenu } from "./SettingsMenu";
import { SharedFilesMenu } from "./SharedFilesMenu";
import { SharedPhotosMenu } from "./SharedPhotosMenu";

export const ChatRoomOptions = observer(() => {
  const rootStore = useRootStore();
  const scrollbarRef = useRef<Scrollbar>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const activeChat = rootStore.chatStore.activeChat!;

  const handleLoadMore = async () => {
    const scroll = scrollbarRef.current;
    const roomId = rootStore.chatStore.activeChat;
    const room = rootStore.attachmentsStore.imagesInfo.get(roomId ?? "");

    if (!scroll || !room) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scroll;

    if (
      isOpen &&
      scrollTop / (scrollHeight - clientHeight) > 0.95 &&
      !isFetching &&
      room.hasMore
    ) {
      console.log("Fetching new images");
      try {
        setIsFetching(true);
        await rootStore.attachmentsStore.fetchImages();
        setIsFetching(false);
        console.log("Done fetching images");
      } catch (ex) {
        console.log("Error during fetching messages", ex.message);
      }
    }
  };

  return (
    <StyledScrollbar
      autoHide
      noScrollX
      elementRef={scrollbarRef}
      onUpdate={(e: React.ChangeEvent<HTMLInputElement>) => handleLoadMore()}
      scrollerProps={{
        renderer: (props: ElementPropsWithElementRefAndRenderer) => {
          let { elementRef, ...restProps } = props;
          if (restProps.style!.overflowY === "scroll") {
            restProps.style!.marginRight = -16.8;
          }

          return <div {...restProps} ref={elementRef} />;
        },
      }}
    >
      <Container>
        <Avatar src="assets/defaultAvatar.svg" />
        <Username>{rootStore.chatStore.recipientName}</Username>
        <Activity>Active 19 m ago</Activity>
        <SettingsMenu />
        <PrivacyMenu />
        {rootStore.attachmentsStore.files.get(activeChat)?.length! > 0 && (
          <SharedFilesMenu />
        )}
        {rootStore.attachmentsStore.images.get(activeChat)?.length! > 0 && (
          <SharedPhotosMenu setIsOpen={setIsOpen} isOpen={isOpen} />
        )}
      </Container>
    </StyledScrollbar>
  );
});

const Container = styled.div`
  grid-area: chatRoomOptions;
  display: grid;
  grid-template-rows: 100px;
  grid-template-columns: minmax(200px, 420px);
  grid-template-areas: "avatar" "username" "activity" "settingsMenu" "supportMenu" "sharedFilesMenu" "sharedPhotosMenu";
  padding-top: 14px;
  justify-items: center;
`;

const Avatar = styled.img`
  grid-area: avatar;
  border-radius: 50%;
  height: 100px;
  width: 100px;
`;

const Username = styled.div`
  grid-area: username;
  margin-top: 12px;
  font-size: 20px;
  font-weight: bold;
`;

const Activity = styled.div`
  grid-area: activity;
  color: ${({ theme }) => theme.text.color.secondary};
  font-size: 14px;
  margin-top: 2px;
  padding-bottom: 16px;
`;

const StyledScrollbar = styled(MyScrollbar)`
  border-left: ${({ theme }) => `1px solid ${theme.divider.color}`};
  box-sizing: border-box;

  .ScrollbarsCustom-Wrapper {
    inset: 0px !important;
  }

  .ScrollbarsCustom-Content {
    padding: 0px !important;
  }

  .ScrollbarsCustom-Thumb {
    background: ${({ theme }) => theme.scroll.color} !important;
  }
`;

// import { observer } from "mobx-react-lite";
// import React, { useRef, useState } from "react";
// import Scrollbar from "react-scrollbars-custom";
// import styled from "styled-components";
// import { useRootStore } from "../stores/RootStore";
// import { MyScrollbar } from "../utils/Scrollbar";
// import { PrivacyMenu } from "./PrivacyMenu";
// import { SettingsMenu } from "./SettingsMenu";
// import { SharedFilesMenu } from "./SharedFilesMenu";
// import { SharedPhotosMenu } from "./SharedPhotosMenu";

// export const ChatRoomOptions = observer(() => {
//   const rootStore = useRootStore();
//   const scrollbarRef = useRef<Scrollbar>(null);
//   const [isFetching, setIsFetching] = useState<boolean>(false);
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const activeChat = rootStore.chatStore.activeChat!;

//   const handleLoadMore = async () => {
//     const scroll = scrollbarRef.current;
//     const roomId = rootStore.chatStore.activeChat;
//     const room = rootStore.attachmentsStore.imagesInfo.get(roomId ?? "");

//     if (!scroll || !room) {
//       return;
//     }

//     const { scrollTop, scrollHeight, clientHeight } = scroll;

//     if (
//       isOpen &&
//       scrollTop / (scrollHeight - clientHeight) > 0.95 &&
//       !isFetching &&
//       room.hasMore
//     ) {
//       console.log("Fetching new images");
//       try {
//         setIsFetching(true);
//         await rootStore.attachmentsStore.fetchImages();
//         setIsFetching(false);
//         console.log("Done fetching images");
//       } catch (ex) {
//         console.log("Error during fetching messages", ex.message);
//       }
//     }
//   };

//   return (
//     <StyledScrollbar
//       autoHide
//       noScrollX
//       elementRef={scrollbarRef}
//       onUpdate={(e: React.ChangeEvent<HTMLInputElement>) => handleLoadMore()}
//     >
//       <Container>
//         <Avatar src="assets/defaultAvatar.svg" />
//         <Username>{rootStore.chatStore.recipientName}</Username>
//         <Activity>Active 19 m ago</Activity>
//         <SettingsMenu />
//         <PrivacyMenu />
//         {rootStore.attachmentsStore.files.get(activeChat)?.length! > 0 && (
//           <SharedFilesMenu />
//         )}
//         {rootStore.attachmentsStore.images.get(activeChat)?.length! > 0 && (
//           <SharedPhotosMenu setIsOpen={setIsOpen} isOpen={isOpen} />
//         )}
//       </Container>
//     </StyledScrollbar>
//   );
// });

// const Container = styled.div`
//   grid-area: chatRoomOptions;
//   display: grid;
//   grid-template-rows: 100px;
//   grid-template-columns: minmax(200px, 420px);
//   grid-template-areas: "avatar" "username" "activity" "settingsMenu" "supportMenu" "sharedFilesMenu" "sharedPhotosMenu";
//   padding-top: 14px;
//   justify-items: center;
// `;

// const Avatar = styled.img`
//   grid-area: avatar;
//   border-radius: 50%;
//   height: 100px;
//   width: 100px;
// `;

// const Username = styled.div`
//   grid-area: username;
//   margin-top: 12px;
//   font-size: 20px;
//   font-weight: bold;
// `;

// const Activity = styled.div`
//   grid-area: activity;
//   color: ${({ theme }) => theme.text.color.secondary};
//   font-size: 14px;
//   margin-top: 2px;
//   padding-bottom: 16px;
// `;

// const StyledScrollbar = styled(MyScrollbar)`
//   border-left: ${({ theme }) => `1px solid ${theme.divider.color}`};
//   box-sizing: border-box;

//   .ScrollbarsCustom-Thumb {
//     background: ${({ theme }) => theme.scroll.color} !important;
//   }
// `;
