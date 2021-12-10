// import { Typography } from "@material-ui/core";
import React from "react";
// import { HEADER_ACCESS } from 'constants/networks'
import styled from "styled-components";
import { ExternalLink, TYPE } from "theme";
// import BackgroundBanner from "../../../assets/images/burnDfyn.png";
// import BURNDFYN from '../../assets/images/burn.png'
// import { OpenInNew } from "@material-ui/icons";

const BannerBox = styled.div<{
  image: string;
  value: number;
  index: number;
  length: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.5s;
  width: 100%;
  max-width: 420px;
  height: 142px;
  background: url(${({ image }) => image}) no-repeat center;
  background-size: contain;
  transform: ${({ value, index, length }) => {
    if (Math.abs(value % length) > index) return "translateX(-110%)";
    else if (Math.abs(value % length) === index) return "translateX(0)";
    else return "translateX(110%)";
  }};
  /* box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px,
    rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px; */
  padding-top: 30px;
  padding-left: 16.8px;
`;


const CustomExternalLink = styled(ExternalLink)`
  display: inline-block;
  margin-right: 20px;
  margin-top: 35px;
`;
interface BannerProps {
  description: string;
  image: string;
  value: number;
  index: number;
  length: number;
  viewTransaction: string;
  learnText: string;
  transaction: string;
  learnMore: string;
}
const Banner: React.FC<BannerProps> = ({
  value,
  index,
  description,
  image,
  length,
  viewTransaction,
  learnText,
  transaction,
  learnMore,
}) => {
  return (
    <BannerBox  value={value} length={length} index={index} image={image} >
      <TYPE.white 
      style={{fontStyle: "normal", fontWeight: "bold", fontSize: "25px", lineHeight:"35px", marginTop:"40px"}}>
        {description}
      </TYPE.white>
      <CustomExternalLink
        style={{ color: "white", textDecoration: "underline", textShadow: "1px 1px black"}}
        href={transaction}
        target="_blank"
        rel="noopener noreferrer"
      >
        <TYPE.white
          fontSize="14px"
          marginBottom="15px"
          marginTop="5px"
          style={{ cursor: "pointer" }}
        >
          {viewTransaction}
          {/* <OpenInNew style={{ fontSize: "14px", marginLeft: "2px" }} /> */}
        </TYPE.white>
      </CustomExternalLink>

      <CustomExternalLink
        style={{ color: "white", textDecoration: "underline", textShadow: "1px 1px black"}}
        href={learnMore}
        target="_blank"
        rel="noopener noreferrer"
      >
        <TYPE.white
          fontSize="14px"
          marginTop="5px"
          style={{ cursor: "pointer" }}
        >
          {learnText}
        </TYPE.white>
      </CustomExternalLink>
    </BannerBox>
  );
};
export default Banner;
