import * as Interface from './ISeguimientoProyectos';
const YellowDaysOffset:number = 30;
const RedDaysOffset:number = 0;
const CirclesStyle:string = `style='width:45px;height: 45px;margin-right:5px;border-radius:50%;display:inline-block;margin-top:5px;background-color:#0#;'`;
const SquareStyle:string = `style='font-weight:bold;margin-top:5px; font-size:60px; color:#0#;'`;
const NoAplica:string = "N/A";


export function Constants(): Interface.IConstants { 
    return {
        YellowDaysOffset: YellowDaysOffset,
        RedDaysOffset:RedDaysOffset,
        CirclesStyle: CirclesStyle,
        SquareStyle: SquareStyle,
        NotApply:NoAplica
    };
  }

  export function ProyectTypes(): Interface.IProyectTypes { 
    return {
      ANS: "ANS",
      AS: "AS",
      BNS: "BNS",
      BS: "BS",
      CNS: "CNS",
      CS: "CS",
      DNS: "DNS",
      DS: "DS"
    };
  }

  export function Colors(): Interface.IColors { 
    return {
    White: "#fff",
    Black: "black",
    Green: "green",
    Orange: "orange",
    Red: "red"
    };
  }

  export function CustomFields(): Interface.ICustomFields { 
    return {
      PCero1: 1,
      JPC: 2,
      Status: 3,
      Process:4
    };
  }

  
