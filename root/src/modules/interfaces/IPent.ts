

export default interface IPent {

    maxStudDistance: number;
    framingSizePivot: number;
    floorOverhangStandard: number;
    floorOverhangHeavy: number;
    maxPanelLength: number;
    buildPanelsTogether: boolean;

    // shed measurements
    floorDepth: number | null;
    frontHeight: number | null;
    backHeight: number | null;

    // frame sizes
    framingWidth: number;
    framingDepth: number;
    roofRailWidth: number;
    roofRailDepth: number;
    shiplapBottomOverhang: number;
    shiplapButtingWidth: number;
    shiplapDepth: number;

    sideCount: number;

    
    maxStudDistanceError: string | null;
    framingSizePivotError: string | null;
    floorOverhangStandardError: string | null;
    floorOverhangHeavyError: string | null;
    maxPanelLengthError: string | null;
    buildPanelsTogetherError: string | null;
    
    // shed measurements
    floorDepthError: string | null;
    frontHeightError: string | null;
    backHeightError: string | null;
    
    // frame sizes
    framingWidthError: string | null;
    framingDepthError: string | null;
    roofRailWidthError: string | null;
    roofRailDepthError: string | null;
    shiplapBottomOverhangError: string | null;
    shiplapButtingWidthError: string | null;
    shiplapDepthError: string | null;
    
    sideCountError: string | null;
}
