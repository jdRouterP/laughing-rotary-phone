import styled from "styled-components";
import { space, variant as StyledSystemVariant } from "styled-system";

import styleVariants from "./themes";
import { ProgressProps, variants } from "./types";

interface BarProps {
  primary?: boolean;
}

export const Bar = styled.div<BarProps>`
  position: absolute;
  top: 0;
  left: 0;
  background: radial-gradient(174.47% 188.91% at 1.84% 0%,#ff007a 0%,#2172e5 100%),#edeef2;
  height: 3px;
  transition: width 1s ease;
`;

Bar.defaultProps = {
  primary: false,
};

interface StyledProgressProps {
  variant: ProgressProps["variant"];
}

const StyledProgress = styled.div<StyledProgressProps>`
  position: relative;
  background-color: ${({ theme }) => theme.text9};
  height: 3px;
  overflow: hidden;
  ${Bar} {
    border-top-left-radius: ${({ variant }) => (variant === variants.FLAT ? "0" : "32px")};
    border-bottom-left-radius: ${({ variant }) => (variant === variants.FLAT ? "0" : "32px")};
  }
  ${StyledSystemVariant({
    variants: styleVariants,
  })}
  ${space}
`;

export default StyledProgress;