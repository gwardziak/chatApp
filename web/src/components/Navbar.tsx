import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { Camcorder } from "../Icons/Camcorder";
import { InfoCircle } from "../Icons/InfoCircle";
import { Phone } from "../Icons/Phone";
import { useRootStore } from "../stores/RootStore";

export const Navbar = observer(() => {
  const rootStore = useRootStore();

  return (
    <Container>
      <Avatar src="assets/defaultAvatar.svg" />
      <Username>{rootStore.chatStore.recipientName}</Username>
      <Activity>Active 19 m ago</Activity>
      <PhoneIcon />
      <CamcorderIcon />
      <IconHelper>
        <InfoIcon />
      </IconHelper>
    </Container>
  );
});

const Container = styled.div`
  grid-area: nav;
  display: grid;
  grid-template-columns: 40px 1fr 32px 32px 32px;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: "avatar username  phoneIcon camcorderIcon infoIcon" "avatar activity phoneIcon camcorderIcon infoIcon";
  box-shadow: ${({ theme }) => `0 1px 2px 0 ${theme.divider.color}`};
  box-sizing: border-box;
  padding: 8px 8px 8px 16px;
  grid-column-gap: 12px;
  align-items: center;
  border-left: ${({ theme }) => `1px solid ${theme.divider.color}`};
`;

const Avatar = styled.img`
  grid-area: avatar;
  border-radius: 50%;
  height: 40px;
  width: 40px;
`;

const Username = styled.h2`
  grid-area: username;
  margin: 0;
  font-size: 15px;
  font-weight: bold;
`;

const Activity = styled.div`
  grid-area: activity;
  font-size: 12px;
  color: ${({ theme }) => theme.text.color.secondary};
  align-self: stretch;
`;

const PhoneIcon = styled(Phone)`
  grid-area: phoneIcon;
  cursor: pointer;
  fill: #0099ff;
  height: 32px;
  width: 32px;
`;

const CamcorderIcon = styled(Camcorder)`
  grid-area: camcorderIcon;
  cursor: pointer;
  fill: #0099ff;
  height: 32px;
  width: 32px;
`;

const InfoIcon = styled(InfoCircle)`
  grid-area: infoIcon;
  cursor: pointer;
  fill: #0099ff;
  height: 32px;
  width: 32px;
`;

const IconHelper = styled.div`
  grid-area: infoIcon;
  background-color: rgba(0, 153, 255, 0.2);
  border-radius: 50%;
  height: 32px;
  width: 32px;
`;
