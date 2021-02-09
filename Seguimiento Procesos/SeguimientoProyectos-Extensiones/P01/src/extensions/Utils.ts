export function DaysDiff(first, second):number 
{ 
      return Math.round((second-first)/(1000*60*60*24));
}

export function GetDateString(date:Date):string
{ 
      if(date)
      {
            return `${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()}`;
      }
      else{
            return "";
      }

}

export function GetFixedValue(value: number, fractionDigits:number) : string {
      var fixedvalue: string = value.toFixed(fractionDigits);
      var splitValue = fixedvalue.split(".");
      if (splitValue[1] == "00") {
        fixedvalue = splitValue[0];
      }
      else {
        fixedvalue = fixedvalue.replace(".", ",");
      }
      return fixedvalue;
    }

export function GetDate(dateValue:string):Date
{ 
      let value: Date=undefined;
      if(dateValue && dateValue !=="")
      {
            value = new Date(dateValue);
      }
      
      return value;
}

export function GetFloat(value: any):number{
      let returnValue:number = 0.0;
      if (value && value != null) {
          returnValue = parseFloat(value);
      }
      return returnValue;
  }
