import styled from "styled-components";

export const SwitchStyled = styled.div`

position: absolute;
bottom: 10px;
right: 10px;

    
.switch1{
  width: 40px;
  height: 20px;
  background-color: #373737;
  border-radius: 50px;
  box-shadow: inset 0px 5px 5px #0000006b;
  position: relative;
  overflow: hidden;
}

.switch2 {
  background-color: ${props => !props.btnSwitch ? "#b300ff" : "#f58634"};
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  box-shadow: inset 0px 5px 5px #0000006b, 0px 5px 5px #0000006b;
  position: absolute;
  left: 0; /* Ponto inicial da animação */
  animation: ${props => !props.btnSwitch ? "switch2" : "switch1"} .3s forwards ease-in-out;
  cursor: pointer;
}

@keyframes switch1 {
  0% {
    left: 0;
  }
  100% {
    left: 50%;
  }
}

@keyframes switch2 {
  0% {
    left: 50%;
  }
  100% {
    left: 0%;
  }
}

`;
