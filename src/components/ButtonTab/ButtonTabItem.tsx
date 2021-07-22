import { BaseButtonProps, ButtonMenuItemProps } from "@pancakeswap/uikit";
import { PolymorphicComponent } from "@pancakeswap/uikit/dist/components/Button/types";
import React from "react";
import { Button } from "rebass";
import { useIsDarkMode } from "state/user/hooks";
import styled from "styled-components";

interface InactiveButtonProps extends BaseButtonProps {
  forwardedAs: BaseButtonProps["as"];
}

// interface ActiveButtonProps extends BaseButtonProps {
//     forwardedAs: BaseButtonProps["as"];
// }

// const ActiveButton: PolymorphicComponent<ActiveButtonProps, "button"> = styled(Button) <ActiveButtonProps>`
//   background-color: #17181F;
//   color: ${({ theme }) => theme.text7};
//   &:hover {
//     opacity: 0.1;
//   }
// `;

const InactiveButton: PolymorphicComponent<InactiveButtonProps, "button"> = styled(Button) <InactiveButtonProps>`
  background-color: transparent;
  color: ${({ theme }) => theme.text8} !important;
  &:hover:not(:disabled):not(:active) {
    background-color: ${({ theme }) => theme.bg10};
    color: ${({ theme }) => theme.text7};
  }
`;


const ButtonMenuItem: PolymorphicComponent<ButtonMenuItemProps, "button"> = ({
  isActive = false,
  as,
  ...props
}: ButtonMenuItemProps) => {
  const darkMode = useIsDarkMode()
  if (!isActive) {
    return (
      <InactiveButton
        forwardedAs={as}
        {...props}
      />
    );
  }

  return <Button style={{ color: darkMode ? "#DD3679" : "#FFFFFF", background: darkMode ? "#17181F" : "#DD3679" }} as={as}  {...props} />;
};

export default ButtonMenuItem;