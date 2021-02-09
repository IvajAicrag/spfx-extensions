import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';
import { initializeIcons } from '@uifabric/icons';
import * as strings from 'IndicadorProgresoFieldCustomizerStrings';
import styles from './IndicadorProgresoFieldCustomizer.module.scss';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IIndicadorProgresoFieldCustomizerProperties {
  // This is an example; replace with your own property
  sampleText?: string;
}

const LOG_SOURCE: string = 'IndicadorProgresoFieldCustomizer';
interface ITiposPrototipo {
  UnoA: string;
  UnoB: string;
  DosA: string;
  DosB: string;
}
/*PRUEBAS */
function TiposPrototipo(): ITiposPrototipo {
return {
  UnoA: "1A",
  UnoB: "1B",
  DosA: "2A",
  DosB: "2B"
};
}

interface IFieldsNames {
FechaSolicitud: string;
RealCPE: string;
RealTaller: string;
TipoPrototipo: string;
}

function FieldsNames(): IFieldsNames {
  return {
    FechaSolicitud: "FechaSolicitud",
    RealCPE: "RealCPE",
    RealTaller: "RealTaller",
    TipoPrototipo: "TipoPrototipo"
  };
}

export default class IndicadorProgresoFieldCustomizer
  extends BaseFieldCustomizer<IIndicadorProgresoFieldCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated IndicadorProgresoFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "IndicadorProgresoFieldCustomizer" and "${strings.Title}"`);
    initializeIcons();
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    var fechaSolicitudMilliseconds: number = this.GetMilliSecondsFromDateField(event, FieldsNames().FechaSolicitud);
    var realCPEMilliseconds: number = this.GetMilliSecondsFromDateField(event, FieldsNames().RealCPE);
    var realTallerMilliseconds: number = this.GetMilliSecondsFromDateField(event, FieldsNames().RealTaller);

    var previstaTaller: number = 0.0;
    var tipoPrototipo: string = event.listItem.getValueByName(FieldsNames().TipoPrototipo);
    var now: number = new Date().getDate();
    var finalValue:number = 0.0;

    if(tipoPrototipo == TiposPrototipo().UnoA){
      if(realCPEMilliseconds >0){
        previstaTaller = realCPEMilliseconds + this.GetMillisecondsFromDays(7);
      }
    }
    else if(tipoPrototipo == TiposPrototipo().UnoB || tipoPrototipo == TiposPrototipo().DosA)
    {
      previstaTaller = fechaSolicitudMilliseconds + this.GetMillisecondsFromDays(2);
    }
    else if(tipoPrototipo == TiposPrototipo().DosB){
      previstaTaller = fechaSolicitudMilliseconds + this.GetMillisecondsFromDays(3);
    }


    if(fechaSolicitudMilliseconds>0 && previstaTaller>0)
    {
      if(realTallerMilliseconds==0) {
        realTallerMilliseconds = now;
      }

      finalValue = ((realTallerMilliseconds - fechaSolicitudMilliseconds) / (previstaTaller - fechaSolicitudMilliseconds)) * 100;
    }

    var valuePixel:number = finalValue >100 ? 100 : finalValue <=0 ? 0 : finalValue;

    var fixedvalue: string = this.GetFixedValue(finalValue, 2);
    event.domElement.classList.add(styles.cell);

        event.domElement.innerHTML = `
                <div class='${styles.IndicadorProgreso}'>
                    <div class='${styles.full}'>
                    <div style='width:${valuePixel}px; background:#1b5cbe; color:#fff'>
                        &nbsp; ${fixedvalue}%
                    </div>
                    </div>
                </div>`;
  }

  private GetFixedValue(finalValue: number, fractionDigits:number) : string {
    var fixedvalue: string = finalValue.toFixed(fractionDigits);
    var splitValue = fixedvalue.split(".");
    if (splitValue[1] == "00") {
      fixedvalue = splitValue[0];
    }
    else {
      fixedvalue = fixedvalue.replace(".", ",");
    }
    return fixedvalue;
  }

  private GetMillisecondsFromDays(days:number):number {
    const MillisecondsDay:number = 86400000;
    return MillisecondsDay * days;
  }

  private GetMilliSecondsFromDateField(event: IFieldCustomizerCellEventParameters, fieldInternalName:string) {
    var dateMilliseconds: number = 0.0;
    var dateValue: string = event.listItem.getValueByName(fieldInternalName);

    if(dateValue && dateValue !== "")
    {
      var dateValues: string[] = dateValue.split("/");
      dateMilliseconds = Date.parse(`${dateValues[1]}/${dateValues[0]}/${dateValues[2]}`);
    }

    return dateMilliseconds;
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    super.onDisposeCell(event);
  }
}
