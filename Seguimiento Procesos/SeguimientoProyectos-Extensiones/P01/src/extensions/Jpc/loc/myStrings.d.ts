declare interface IJpcFieldCustomizerStrings {
  Title: string;
  SinFechaPrevista: string;
  VencimientoTitle:string;
  VencimientoHoy:string;
  Vencimiento:string;
  VencidaPor:string;
  Cargando:string;
}

declare module 'JpcFieldCustomizerStrings' {
  const strings: IJpcFieldCustomizerStrings;
  export = strings;
}
