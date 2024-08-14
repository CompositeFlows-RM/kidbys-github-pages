import IPent from "./IPent";
import IViewElement from "./IViewElement";


export default interface IState {

    pent: IPent;
    showDefaults: boolean;
    pages: Array<IViewElement>;
    currentPageIndex: number;
}
