import IPent from "../interfaces/IPent";


export default class Pent implements IPent {

    // defaults
    public maxStudDistance: number = 400;
    public framingSizePivot: number = 50;
    public floorOverhangStandard: number = 10;
    public floorOverhangHeavy: number = 15;
    public maxPanelLength: number = 4000;
    public buildPanelsTogether: boolean = false;

    // shed measurements
    public floorDepth: number = 0;
    public frontHeight: number = 0;
    public backHeight: number = 0;

    // frame sizes
    public framingWidth: number = 45;
    public framingDepth: number = 33;
    public roofRailWidth: number = 69;
    public roofRailDepth: number = 34;
    public shiplapBottomOverhang: number = 35;
    public shiplapButtingWidth: number = 112;
    public shiplapDepth: number = 12;

    public sideCount: number = 2;

    public maxStudDistanceError: string | null = null;
    public framingSizePivotError: string | null = null;
    public floorOverhangStandardError: string | null = null;
    public floorOverhangHeavyError: string | null = null;
    public maxPanelLengthError: string | null = null;
    public buildPanelsTogetherError: string | null = null;

    // shed measurements
    public floorDepthError: string | null = null;
    public frontHeightError: string | null = null;
    public backHeightError: string | null = null;
    public framingWidthError: string | null = null;
    public framingDepthError: string | null = null;
        
    // frame sizes
    public roofRailWidthError: string | null = null;
    public roofRailDepthError: string | null = null;
    public shiplapBottomOverhangError: string | null = null;
    public shiplapButtingWidthError: string | null = null;
    public shiplapDepthError: string | null = null;
    
    public sideCountError: string | null = null;

}
