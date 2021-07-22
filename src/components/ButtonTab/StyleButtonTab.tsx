import styled from "styled-components";


const StyledButtonMenu = styled.div`
  background: ${({theme}) => theme.bg7};
  border-radius: 5px;
  display: inline-flex;
  padding: 5px;
  & > button + button,
  & > a + a {
    margin-left: 2px; // To avoid focus shadow overlap
  }
`;

export default StyledButtonMenu;