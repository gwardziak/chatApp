import React from "react";
import styled from "styled-components";
import { Camcorder } from "../Icons/Camcorder";
import { InfoCircle } from "../Icons/InfoCircle";
import { Phone } from "../Icons/Phone";
import { Avatar as DefaultAvatar } from "../ui/Avatar";

export const Navbar = () => {
  return (
    <Container>
      <Avatar src="https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/cp0/p60x60/46844435_1931467286943369_1021085731109470208_o.jpg?_nc_cat=109&_nc_sid=dbb9e7&_nc_ohc=4pMEq64VPgIAX9y4pTX&_nc_ht=scontent-frt3-1.xx&_nc_tp=27&oh=8c85ae9698f070ec16a84beef5df483e&oe=5F9D606C" />
      <Username>Filip zawada</Username>
      <Activity>Aktywny(a) przez: Messenger</Activity>
      <PhoneIcon viewBox="0 0 36 36" />
      <CamcorderIcon viewBox="0 0 36 36" />
      <IconHelper>
        <InfoIcon viewBox="0 0 36 36" />
      </IconHelper>
    </Container>
  );
};

const Container = styled.div`
  grid-area: nav;
  display: grid;
  grid-template-columns: 40px 1fr 32px 32px 32px;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: "avatar username  phoneIcon camcorderIcon infoIcon" "avatar activity phoneIcon camcorderIcon infoIcon";
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  padding: 8px 8px 8px 16px;
  grid-column-gap: 12px;
  align-items: center;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
`;

const Avatar = styled(DefaultAvatar)`
  grid-area: avatar;
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
  color: rgba(0, 0, 0, 0.4);
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
  border-radius: 99px;
  height: 32px;
  width: 32px;
`;