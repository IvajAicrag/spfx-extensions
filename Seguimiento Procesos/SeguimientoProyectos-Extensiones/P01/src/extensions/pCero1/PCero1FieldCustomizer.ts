import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'PCero1FieldCustomizerStrings';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IPCero1FieldCustomizerProperties {
  // This is an example; replace with your own property
  sampleText?: string;
}

import {Proyecto} from '../ProyectoItem';
import { ListItemAccessor } from '@microsoft/sp-listview-extensibility';
import {CustomFields} from '../Definitions';
const LOG_SOURCE: string = 'PCero1FieldCustomizer';

export default class PCero1FieldCustomizer
  extends BaseFieldCustomizer<IPCero1FieldCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated PCero1FieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "PCero1FieldCustomizer" and "${strings.Title}"`);
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    // Use this method to perform your custom cell rendering.
    let proyectoItem = new Proyecto(this.context, event.listItem as ListItemAccessor);
    
    event.domElement.innerHTML = strings.Cargando;
    proyectoItem.LoadField(CustomFields().PCero1).then((result:string) =>
    {
        event.domElement.innerHTML = `<span style="font-size: 30px;">${result}</span>`;
    });
  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    super.onDisposeCell(event);
  }
}