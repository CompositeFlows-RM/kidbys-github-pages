

export default interface IViewElement {
    
    type: string;
    properties: any;
    value: string | null | Array<IViewElement>;
}
