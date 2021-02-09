import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import {CustomFields} from '../Definitions';
import * as strings from 'ProcessFieldCustomizerStrings';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IProcessFieldCustomizerProperties {
  // This is an example; replace with your own property
  sampleText?: string;
}

import {Proyecto} from '../ProyectoItem';

import { ListItemAccessor } from '@microsoft/sp-listview-extensibility';
const LOG_SOURCE: string = 'ProcessFieldCustomizer';

export default class ProcessFieldCustomizer
  extends BaseFieldCustomizer<IProcessFieldCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated ProcessFieldCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    Log.info(LOG_SOURCE, `The following string should be equal: "ProcessFieldCustomizer" and "${strings.Title}"`);
    return Promise.resolve();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    event.domElement.innerHTML = strings.Cargando;
    // Use this method to perform your custom cell rendering.
    let proyectoItem = new Proyecto(this.context, event.listItem as ListItemAccessor);
    proyectoItem.LoadField(CustomFields().Process).then((result:string) =>
    {
        event.domElement.innerHTML =result;
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