import { ButtonMenuProps } from "@pancakeswap/uikit";
import React, { cloneElement, Children, ReactElement } from "react";
import StyledButtonMenu from "./StyleButtonTab";

const ButtonMenu: React.FC<ButtonMenuProps> = ({
    activeIndex = 0,
    onItemClick,
    children,
}) => {
    return (
        <StyledButtonMenu>
            {Children.map(children, (child: ReactElement, index) => {
                return cloneElement(child, {
                    isActive: activeIndex === index,
                    onClick: onItemClick ? () => onItemClick(index) : undefined
                });
            })}
        </StyledButtonMenu>
    );
};

export default ButtonMenu;