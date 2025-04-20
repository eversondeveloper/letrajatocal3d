import { SwitchStyled } from "./SwitchStyled";

export default function Switch(props) {
  

  return (
    <SwitchStyled
      onClick={() => {
        props.setBtnSwitch((prev) => (prev ? false : true));
      }}
      btnSwitch={props.btnSwitch}
    >
      <div className="switch1" title="Cliente ou parceiro?">
        <div className="switch2"></div>
      </div>
    </SwitchStyled>
  );
}
