import IPent from "../../../interfaces/IPent";


const pentSideValidationCode = {

    validateValues: (pent: IPent): void => {

        let alertText = "";

        if (pent.maxStudDistance == null) {

            alertText += `maxStudDistance is undefined
    `;
        }

        if (pent.framingSizePivot == null) {

            alertText += `framingSizePivot is undefined
    `;
        }

        if (pent.floorOverhangStandard == null) {

            alertText += `floorOverhangStandard is undefined
    `;
        }

        if (pent.floorOverhangHeavy == null) {

            alertText += `floorOverhangHeavy is undefined
    `;
        }

        if (pent.maxPanelLength == null) {

            alertText += `maxPanelLength is undefined
    `;
        }

        if (pent.floorDepth == null) {

            alertText += `floorDepth is undefined
    `;
        }

        if (pent.frontHeight == null) {

            alertText += `frontHeight is undefined
    `;
        }

        if (pent.backHeight == null) {

            alertText += `backHeight is undefined
    `;
        }

        if (pent.framingWidth == null) {

            alertText += `framingWidth is undefined
    `;
        }

        if (pent.framingDepth == null) {

            alertText += `framingDepth is undefined
    `;
        }

        if (pent.roofRailWidth == null) {

            alertText += `roofRailWidth is undefined
    `;
        }

        if (pent.roofRailDepth == null) {

            alertText += `roofRailDepth is undefined
    `;
        }

        if (pent.sideCount == null) {

            alertText += `sideCount is undefined
    `;
        }

        if (pent.buildPanelsTogether == null) {

            alertText += `buildPanelsTogether is undefined
    `;
        }

        if (pent.shiplapBottomOverhang == null) {

            alertText += `shiplapBottomOverhang is undefined
    `;
        }

        if (pent.shiplapButtingWidth == null) {

            alertText += `shiplapButtingWidth is undefined
    `;
        }

        if (pent.shiplapDepth == null) {

            alertText += `shiplapDepth is undefined
    `;
        }


        if (pent.maxStudDistance < 100
            || pent.maxStudDistance > 1000
        ) {

            alertText += `maxStudDistance is less than 100 or greater than 1000
    `;
        }

        if (pent.framingSizePivot < 10
            || pent.framingSizePivot > 1000
        ) {

            alertText += `framingSizePivot is undefined
    `;
        }

        if (pent.floorOverhangStandard < 1
            || pent.floorOverhangStandard > 100
        ) {

            alertText += `floorOverhangStandard is less than 1 or greater than 100
    `;
        }

        if (pent.floorOverhangHeavy < 1
            || pent.floorOverhangHeavy > 100
        ) {

            alertText += `floorOverhangHeavy is less than 100 or greater than 100
    `;
        }

        if (pent.maxPanelLength < 100
            || pent.maxPanelLength > 10000
        ) {

            alertText += `maxPanelLength is less than 100 or greater than 5000
    `;
        }

        if (pent.floorDepth
            && (pent.floorDepth < 100
                || pent.floorDepth > 20000)
        ) {

            alertText += `floorDepth is less than 100 or greater than 20000
    `;
        }

        if (pent.frontHeight
            && (pent.frontHeight < 100
                || pent.frontHeight > 4000)
        ) {

            alertText += `frontHeight is less than 100 or greater than 4000
    `;
        }

        if (pent.backHeight
            && (pent.backHeight < 100
                || pent.backHeight > 4000)
        ) {

            alertText += `backHeight is less than 100 or greater than 4000
    `;
        }

        if (pent.framingWidth < 10
            || pent.framingWidth > 300) {

            alertText += `framingWidth is less than 10 or greater than 300
    `;
        }

        if (pent.framingDepth < 10
            || pent.framingDepth > 300) {

            alertText += `framingDepth is less than 10 or greater than 300
    `;
        }

        if (pent.roofRailWidth < 10
            || pent.roofRailWidth > 300) {

            alertText += `roofRailWidth is less than 10 or greater than 300
    `;
        }

        if (pent.roofRailDepth < 10
            || pent.roofRailDepth > 300) {

            alertText += `roofRailDepth is less than 10 or greater than 300
    `;
        }

        if (pent.sideCount < 1
            || pent.sideCount > 2) {

            alertText += `sideCount is less than 1 or greater than 2
    `;
        }

        if (pent.shiplapBottomOverhang < 1
            || pent.shiplapBottomOverhang > 100) {

            alertText += `shiplapBottomOverhang is less than 1 or greater than 100
    `;
        }

        if (pent.shiplapButtingWidth < 10
            || pent.shiplapButtingWidth > 1000) {

            alertText += `shiplapButtingWidth is less than 10 or greater than 1000
    `;
        }

        if (pent.shiplapDepth < 10
            || pent.shiplapDepth > 1000) {

            alertText += `shiplapDepth is less than 10 or greater than 1000
    `;
        }

        if (alertText
            && alertText.length > 0) {

            alert(alertText);
        }
    }
};

export default pentSideValidationCode;

