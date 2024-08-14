import { VNode } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";
import IState from "../../../interfaces/IState";


const inputViews = {

    buildNumberView: (
        id: string,
        value: number | null,
        required: boolean,
        // rangeMin: number,
        // rangeMax: number,
        label: string,
        placeholder: string,
        error: string | null,
        action: (state: IState, element: HTMLInputElement) => IState
    ): VNode => {

        const view: VNode =

            h("div", { class: "nft-i-numeric" }, [
                h("h4", {}, `${label}`),

                h("div", { class: "input-wrapper" }, [
                    h("div", { class: "title-table" }, [
                        h("div", { class: "title-row" }, [
                            h("div", { class: "title-cell" }, [
                                h("div", { class: "error" }, `${error ?? ''}`),
                            ])
                        ])
                    ]),
                    h("input",
                        {
                            id: `${id}`,
                            value: `${value ?? 0}`,
                            required: required === true,
                            tabindex: 0, // if this is not set it is not focusable
                            // min: rangeMin,
                            // max: rangeMax,
                            type: "text",
                            placeholder: `${placeholder}`,
                            onInput: [
                                action,
                                (event: any) => {
                                    return event.target;
                                }
                            ]
                        },
                        ""
                    ),
                ])
            ]);

        return view;
    },

    buildSelectView: (
        selectedValue: string,
        label: string,
        placeholder: string,
        optionValues: Array<string>,
        action: (state: IState, element: HTMLSelectElement) => IState
    ): VNode => {

        let selectClasses: string = "nft-i-select";
        let selected = false;
        let selectionMade = false;

        const optionViews: VNode[] = [

            h("option",
                {
                    class: "select-default",
                    value: ""
                },
                `--select ${placeholder}--`
            )
        ];

        optionValues.forEach((choice: string) => {

            if (choice === selectedValue) {

                selected = true;
                selectionMade = true;
            }
            else {
                selected = false;
            }

            optionViews.push(
                
                h("option",
                    {
                        value: `${choice}`,
                        selected: selected
                    },
                    `${choice}`
                )
            );
        });

        if (selectionMade) {

            selectClasses = `${selectClasses} selected`;
        }

        const view: VNode =

            h("div",
                {
                    class: `${selectClasses}`,
                    onChange: [
                        action,
                        (event: any) => {
                            return event.target;
                        }
                    ]
                },
                [
                    h("h4", {}, `${label}`),
                    h("select", {}, optionViews)
                ]
            );

        return view;
    }

};

export default inputViews;

