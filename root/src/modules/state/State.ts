import IPent from "../interfaces/IPent";
import IState from "../interfaces/IState";
import Pent from "./Pent";
import IViewElement from "../interfaces/IViewElement";


export default class State implements IState {

    public pent: IPent = new Pent();
    public showDefaults: boolean = false;
    public pages: Array<IViewElement> = [];
    public currentPageIndex: number = 0;
}
