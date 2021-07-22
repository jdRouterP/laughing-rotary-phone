import { BaseButtonProps, ButtonMenuItemProps } from "@pancakeswap/uikit";
import { PolymorphicComponent } from "@pancakeswap/uikit/dist/components/Button/types";
import React from "react";
import { Button } from "rebass";
import styled from "styled-components";

interface InactiveButtonProps extends BaseButtonProps {
    forwardedAs: BaseButtonProps["as"];
    colorKey: "primary1" | "primary2";
}

const InactiveButton: PolymorphicComponent<InactiveButtonProps, "button"> = styled(Button) <InactiveButtonProps>`
  background-color: transparent;
  color: ${({ theme }) => theme.primary1};
  &:hover:not(:disabled):not(:active) {
    background-color: transparent;
  }
`;

const ButtonMenuItem: PolymorphicComponent<ButtonMenuItemProps, "button"> = ({
    isActive = false,
    as,
    ...props
}: ButtonMenuItemProps) => {
    if (!isActive) {
        return (
            <InactiveButton
                forwardedAs={as}
                variant="tertiary"
                colorKey={"primary2"}
                {...props}
            />
        );
    }

    return <Button as={as}  {...props} />;
};

export default ButtonMenuItem;