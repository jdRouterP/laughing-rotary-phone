import styled from "styled-components";


const StyledButtonMenu = styled.div`
  background-color: grey;
  border-radius: 16px;
  display: inline-flex;
  & > button + button,
  & > a + a {
    margin-left: 2px; // To avoid focus shadow overlap
  }
`;

export default StyledButtonMenu;