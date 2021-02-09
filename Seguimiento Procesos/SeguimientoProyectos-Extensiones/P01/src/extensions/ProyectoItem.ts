
import {  SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions} from '@microsoft/sp-http';
import { ListItemAccessor, FieldCustomizerContext } from '@microsoft/sp-listview-extensibility';
import { Log } from '@microsoft/sp-core-library';
import * as PCero1Strings from 'PCero1FieldCustomizerStrings';
import * as StatusStrings from 'StatusFieldCustomizerStrings';
import * as Jpcstrings from 'JpcFieldCustomizerStrings';
import * as Utils from './Utils';
import * as Interfaces  from './ISeguimientoProyectos';
import * as Definitions from './Definitions';
import { Guid } from '@microsoft/sp-core-library';
import ProcessStyles from './Process/ProcessFieldCustomizer.module.scss';

const LOG_SOURCE: string = 'ProyectoItem';
const ListTitle:string = "Seguimiento de proyectos";

export  class Proyecto {
    private Item: ListItemAccessor;
    private CurrentContext: FieldCustomizerContext;
    public P01:Interfaces.ISPDates;
    public P02:Interfaces.ISPDates;
    public P03:Interfaces.ISPDates;
    public P04:Interfaces.ISPDates;
    public JPC:Interfaces.ISPDates;
    public Modified:Date;
    public FechaInicio:Date;
    public SOPCliente:Date;

    public InversionesPrevistas:Number;
    public InversionesReales: Number;
    public InversionNegativa:Boolean;
    public P01Retraso:Boolean;
    public P02Retraso:Boolean;
    public P03Retraso:Boolean;
    public P04Retraso:Boolean;
    public JPCRetraso:Boolean;
    public TipoProyecto:string;
    ////SVG from https://material.io/
    public readonly CircleStopSolid:string = '<span title="#0#"><svg fill="#1#" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M10 16c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1zm2-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm2-4c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1z"/></svg><span>';
    public readonly CircleFill:string = '<span title="#0#"><svg fill="#1#" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="12" cy="12" r="8"/></svg></span>';
    public readonly BugIcon:string = '<span title="ERROR!!" style="width:100%;background-color:#ffcccc"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M19 8h-1.81c-.45-.78-1.07-1.45-1.82-1.96l.93-.93c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.47 1.47C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L9.11 3.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l.92.93C7.88 6.55 7.26 7.22 6.81 8H5c-.55 0-1 .45-1 1s.45 1 1 1h1.09c-.05.33-.09.66-.09 1v1H5c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .34.04.67.09 1H5c-.55 0-1 .45-1 1s.45 1 1 1h1.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H19c.55 0 1-.45 1-1s-.45-1-1-1h-1.09c.05-.33.09-.66.09-1v-1h1c.55 0 1-.45 1-1s-.45-1-1-1h-1v-1c0-.34-.04-.67-.09-1H19c.55 0 1-.45 1-1s-.45-1-1-1zm-6 8h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1zm0-4h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg></span>';
    constructor(currentContext:FieldCustomizerContext, proyectoItem: ListItemAccessor) {
        this.CurrentContext = currentContext;
        this.Item = proyectoItem;
    }

    public LoadField(field:number):Promise<string> {
        let currentWebUrl: string = this.CurrentContext.pageContext.web.absoluteUrl;
        let listId: Guid = this.CurrentContext.pageContext.list.id;
        let requestUrl: string = currentWebUrl.concat(`/_api/web/lists/GetByTitle('${ListTitle}')/Items(${this.Item.getValueByName("ID")})`);
        return this.CurrentContext.spHttpClient.get(requestUrl, SPHttpClient.configurations.v1)
            .then((response: SPHttpClientResponse) => {
                if (response.ok) {
                    return response.json().then((responseJSON) => {
                        try
                        {
                        if (responseJSON != null) {
                            this.SetFieldsValues(responseJSON);
                            if(field == Definitions.CustomFields().JPC)
                            {
                                return this.GetJPCIcon();
                            }
                            else if(field == Definitions.CustomFields().PCero1)
                            {
                                return this.GetP01Html();
                            }
                            else if(field == Definitions.CustomFields().Status)
                            {
                                return this.GetStatusIcon();
                            }
                            else if(field == Definitions.CustomFields().Process)
                            {
                                return this.GetProcess();
                            }
                            else
                            {
                                return  "";
                            }
                        }
                      }
                      catch(e)
                      {
                        console.log("SeguimientoProyectos - Extensiones - ProyectoItem", e);
                      }
                    });
                }
                else
                {
                    return "";
                }
            }
        );
    }

    private GetJPCIcon() : string
    {
        let innerHTML:string="";
        try
        {
            var todaysDate:Date = new Date();
            var vencimientoTitle:string = "";
            if(this.JPC.DateValuePrevisto && this.JPC.DateValueReal)
            {
                vencimientoTitle = Jpcstrings.VencimientoTitle.replace("#0#",this.JPC.StringDateValueReal).replace("#1#", this.JPC.StringDateValuePrevisto);
                if(this.JPC.DateValuePrevisto >=this.JPC.DateValueReal)
                {
                    innerHTML = this.CircleStopSolid.replace("#0#", vencimientoTitle).replace("#1#", Definitions.Colors().Green);
                }
                else
                {
                    innerHTML = this.CircleStopSolid.replace("#0#", vencimientoTitle).replace("#1#", Definitions.Colors().Red);
                }
            }
            else if(this.JPC.DateValuePrevisto)
            {
                let timeCustomer:number = this.JPC.DateValuePrevisto.getTime();
                let { yellowOffsetDate, redOffsetDate }: { yellowOffsetDate: Date; redOffsetDate: Date; } = this.GetRedAndYellowDate();
                let overDueByDays:number = (Math.round(((todaysDate.getTime() - timeCustomer)/86400000)*10)/10);
                let timeYellowOffsetDate:number = yellowOffsetDate.getTime();
                let timeRedOffsetDate:number = redOffsetDate.getTime();
                if(timeYellowOffsetDate < timeCustomer && timeRedOffsetDate < this.JPC.DateValuePrevisto.getTime()){
                    innerHTML = this.CircleFill.replace("#0#", Jpcstrings.Vencimiento.replace("#0#", this.JPC.StringDateValuePrevisto)).replace("#1#",Definitions.Colors().Green);
                }
                else if(timeYellowOffsetDate >= this.JPC.DateValuePrevisto.getTime() && timeRedOffsetDate < this.JPC.DateValuePrevisto.getTime()){
                    innerHTML = this.CircleFill.replace("#0#", Jpcstrings.Vencimiento.replace("#0#", this.JPC.StringDateValuePrevisto)).replace("#1#",Definitions.Colors().Orange);
                }
                else if(timeRedOffsetDate == timeCustomer){
                    innerHTML = this.CircleFill.replace("#0#",Jpcstrings.VencimientoHoy).replace("#1#",Definitions.Colors().Red);
                }
                else if(timeRedOffsetDate > timeCustomer){
                    innerHTML = this.CircleFill.replace("#0#", Jpcstrings.VencidaPor.replace("#0#",overDueByDays.toString())).replace("#1#", Definitions.Colors().Red);
                }
            }
            else
            {
                innerHTML = this.CircleFill.replace("#0#", Jpcstrings.SinFechaPrevista).replace("#1#", Definitions.Colors().Black);
            }
        }
        catch(e)
        {
            innerHTML = this.AddLog(e);
        }

        return innerHTML;
    }

    private GetStatusIcon() : string
    {
        let html:string="";
        try
        {
            if (this.P01Retraso ||  this.P02Retraso || this.P03Retraso || this.P04Retraso || this.JPCRetraso || this.InversionNegativa)
            {
                html = this.CircleFill.replace("#0#", StatusStrings.Falso).replace("#1#", Definitions.Colors().Red);
            }
            else{
                html = this.CircleFill.replace("#0#", StatusStrings.Verdadero).replace("#1#", Definitions.Colors().Green);
            }
        }
        catch(e)
        {
            html = this.AddLog(e);
        }

        return html;
    }

    private GetP01Html(): string
    {
        let html:string = "";
        try
        {
            let whiteSpan:string = this.CircleFill.replace("#0#", "").replace("#1#", Definitions.Colors().White);
            if(this.TipoProyecto == Definitions.ProyectTypes().CNS || this.TipoProyecto == Definitions.ProyectTypes().CS) {
                html = whiteSpan;
                html += this.GetHtmlPrevistaReal(this.P02);
                html += this.GetHtmlPrevistaReal(this.P03);
                html += this.GetHtmlPrevistaReal(this.P04);
            } else if(this.TipoProyecto == Definitions.ProyectTypes().BNS || this.TipoProyecto == Definitions.ProyectTypes().BS) {
                html = `${whiteSpan}${whiteSpan}`;
                html += this.GetHtmlPrevistaReal(this.P03);
                html += this.GetHtmlPrevistaReal(this.P04);
            } else if(this.TipoProyecto == Definitions.ProyectTypes().ANS ||this.TipoProyecto == Definitions.ProyectTypes().AS) {
                html = `${whiteSpan}${whiteSpan}${whiteSpan}`;
                html += this.GetHtmlPrevistaReal(this.P04);
            }
            else
            {
                html = this.GetHtmlPrevistaReal(this.P01);
                html += this.GetHtmlPrevistaReal(this.P02);
                html += this.GetHtmlPrevistaReal(this.P03);
                html += this.GetHtmlPrevistaReal(this.P04);
            }
        }
        catch(e)
        {
            html = this.AddLog(e);
        }

        return html;
    }

    private GetProcess() : string
    {
        let html:string = "";
        try
        {
            let sopValue:number = 0.0;
            let modifiedValue:number = Date.parse(this.Modified.toISOString());
            let initDateValue:number = 0.0;
            if(this.SOPCliente)
            {
                sopValue = Date.parse(this.SOPCliente.toISOString());
            }

            if(this.FechaInicio)
            {
                initDateValue =  Date.parse(this.FechaInicio.toISOString());
            }

            let value:number = ((modifiedValue - initDateValue) / (sopValue - initDateValue))* 100;
            var valuePixel:number = value >95 ? 100 : value <=0 ? 0 : value;
            let valueFixed:string = Utils.GetFixedValue(value, 0);
            html =  `
                <div class='${ProcessStyles.Process}'>
                    <div class='${ProcessStyles.full}'>
                    <div style='width:${valuePixel}px; background:#1b5cbe; color:#fff'>
                        &nbsp; ${valueFixed}%
                    </div>
                    </div>
                </div>`;

        }
        catch(e)
        {
            html = `<span style="font-size: 30px;">${this.AddLog(e)}</span>`;
        }

        return html;
    }

    private AddLog(e:any):string
    {
        Log.info(LOG_SOURCE, JSON.stringify(this.Item, undefined, 2));
        console.log(`Se ha producido un error en: ${LOG_SOURCE}`, e);
        console.log(LOG_SOURCE, this);
        return this.BugIcon;
    }

   private GetHtmlPrevistaReal(dates:Interfaces.ISPDates) : string
    {
        let html:string = "";
        let { yellowOffsetDate, redOffsetDate }: { yellowOffsetDate: Date; redOffsetDate: Date; } = this.GetRedAndYellowDate();
        if(dates.DateValuePrevisto && dates.DateValueReal && dates.DateValueReal.getFullYear() > 1899)
        {
            let title:string = "";
            if(dates.DateValuePrevisto.getFullYear() > 1899) {
                title = PCero1Strings.FechaPrevistaReal.replace("#0#", dates.StringDateValuePrevisto).replace("#1#", dates.StringDateValueReal);
            }
            else
            {
                title = PCero1Strings.FechaReal.replace("#0#", dates.StringDateValueReal);
            }

            if(dates.DateValuePrevisto.getFullYear() == 1899 || dates.DateValuePrevisto >= dates.DateValueReal) {
                html =  this.CircleStopSolid.replace("#0#", title).replace("#1#",Definitions.Colors().Green);
            }
            else if (dates.DateValueReal > dates.DateValuePrevisto) {
                html =  this.CircleStopSolid.replace("#0#", title).replace("#1#",Definitions.Colors().Red);
            }
        }
        else if(dates.DateValuePrevisto && dates.DateValuePrevisto.getFullYear() > 1899) {
            let daydiffOrange = Utils.DaysDiff(dates.DateValuePrevisto, yellowOffsetDate);
            if(daydiffOrange >= 0 && daydiffOrange <= Definitions.Constants().YellowDaysOffset) {
                html = this.CircleFill.replace("#0#",  dates.StringDateValuePrevisto).replace("#1#", Definitions.Colors().Orange);
            }  else if(dates.DateValuePrevisto>yellowOffsetDate) {
                html = this.CircleFill.replace("#0#",  dates.StringDateValuePrevisto).replace("#1#", Definitions.Colors().Green);
            }  else if (redOffsetDate > dates.DateValuePrevisto) {
                html = this.CircleFill.replace("#0#",  dates.StringDateValuePrevisto).replace("#1#", Definitions.Colors().Red);
            }
        }
        else
        {
            html = this.CircleFill.replace("#0#", "").replace("#1#", Definitions.Colors().Black);
        }

        return html;
    }

    private GetRedAndYellowDate() {
        let date: Date = new Date();
        let yDay: number = date.getDate() + Definitions.Constants().YellowDaysOffset;
        let rDay: number = date.getDate() + Definitions.Constants().RedDaysOffset;
        let Month: number = date.getMonth();
        let Year: number = date.getFullYear();
        let redOffsetDate: Date = new Date(Year, Month, rDay);
        let yellowOffsetDate: Date = new Date(Year, Month, yDay);
        return { yellowOffsetDate, redOffsetDate };
    }

    private SetFieldsValues(item:any)
    {
        try
        {
            this.Modified = Utils.GetDate(item.Modified);
            this.FechaInicio = Utils.GetDate(item.FechaInicio);
            this.SOPCliente = Utils.GetDate(item.SOPCliente);
            this.InversionesPrevistas = Utils.GetFloat(item.InversionesPrevistas);
            this.InversionesReales = Utils.GetFloat(item.InversionesReales);

            let datePrevisto:Date = Utils.GetDate(item.P0101DisProdPrevisto);
            let dateReal:Date = Utils.GetDate(item.P0101DisProdReal);
            this.P01 = {
                DateValuePrevisto: datePrevisto,
                StringDateValuePrevisto: Utils.GetDateString(datePrevisto),
                DateValueReal: dateReal,
                StringDateValueReal: Utils.GetDateString(dateReal)
            };

            datePrevisto = Utils.GetDate(item.P0102DesProdPrevisto);
            dateReal = Utils.GetDate(item.P0102DesProdReal);
            this.P02 = {
                DateValuePrevisto: datePrevisto,
                StringDateValuePrevisto: Utils.GetDateString(datePrevisto),
                DateValueReal: dateReal,
                StringDateValueReal: Utils.GetDateString(dateReal)
            };

            datePrevisto = Utils.GetDate(item.P0103DisProcPrevisto);
            dateReal = Utils.GetDate(item.P0103DisProcReal);
            this.P03 = {
                DateValuePrevisto: datePrevisto,
                StringDateValuePrevisto: Utils.GetDateString(datePrevisto),
                DateValueReal: dateReal,
                StringDateValueReal: Utils.GetDateString(dateReal)
            };

            datePrevisto = Utils.GetDate(item.P0104DesProcPrevisto);
            dateReal = Utils.GetDate(item.P0104DesProcReal);
            this.P04 = {
                DateValuePrevisto: datePrevisto,
                StringDateValuePrevisto: Utils.GetDateString(datePrevisto),
                DateValueReal: dateReal,
                StringDateValueReal: Utils.GetDateString(dateReal)
            };

            datePrevisto = Utils.GetDate(item.JPCCliente);
            dateReal = Utils.GetDate(item.JPCReal);
            this.JPC = {
                DateValuePrevisto: datePrevisto,
                StringDateValuePrevisto: Utils.GetDateString(datePrevisto),
                DateValueReal: dateReal,
                StringDateValueReal: Utils.GetDateString(dateReal)
            };

            this.P01Retraso = this.IsRetrasoAP(this.P01);
            this.P02Retraso = this.IsRetrasoAP(this.P02);
            this.P03Retraso = this.IsRetrasoAP(this.P03);
            this.P04Retraso = this.IsRetrasoAP(this.P04);
            this.TipoProyecto = (item.TipoProyecto as string).toUpperCase();
            this.SetJPCFields();
            this.SetInversiones();
        }
        catch(e)
        {
            this.AddLog(e);
        }
    }

    private IsRetrasoAP(dates:Interfaces.ISPDates): Boolean{
        let isRetrasoAP:Boolean = false;
        if(dates.DateValuePrevisto && !dates.DateValueReal)
        {
            var todaysDate = new Date();
            if(todaysDate.getTime() > dates.DateValuePrevisto.getTime()) { isRetrasoAP = true; }
        }

        return isRetrasoAP;
    }

    private SetJPCFields()
    {
        this.JPCRetraso = false;
        let todaysDate:Date = new Date();
        if(this.JPC.DateValuePrevisto != undefined && this.JPC.DateValueReal == undefined && todaysDate.getTime() > this.JPC.DateValuePrevisto.getTime()){
            this.JPCRetraso = true;
        }
    }

    private SetInversiones()
    {
        this.InversionNegativa = false;
        if(this.InversionesReales > this.InversionesPrevistas){this.InversionNegativa = true;}
    }
}
