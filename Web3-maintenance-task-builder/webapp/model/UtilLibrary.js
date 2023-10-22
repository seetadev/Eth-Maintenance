sap.ui.define([
    "sap/ui/core/Fragment"
], function (Fragment) {
    "use strict";

    return {

        addControlToForm: function (controlValue, oView, that, SectionNo) {
            switch (controlValue) {
                case "inputtext":
                    var inputField = new sap.m.HBox({
                        width: "100%",
                        items: [
                            new sap.m.Label({ text: "Input Field Label", width: "30%" }),
                            new sap.m.Input({ class: "sapUiSmallMarginBottom", width: "50%" }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://edit",
                                color: "#0000FF",
                                width: "20%",
                                press: this.onControlEditPress.bind(that, oView)
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://delete",
                                color: "#FF0000",
                                width: "20%",
                                press: this.onControlDeletePress.bind(that)
                            })
                        ]
                    });
                    oView.byId("Section_1").addContent(inputField);
                    break;
                case "datepicker":
                    var datepicker = new sap.m.HBox({
                        width: "100%",
                        items: [
                            new sap.m.Label({ text: "Date Label", width: "30%" }),
                            new sap.m.DatePicker({ class: "sapUiSmallMarginBottom", width: "50%" }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://edit",
                                color: "#0000FF",
                                width: "20%",
                                press: this.onControlEditPress.bind(that, oView)
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://delete",
                                color: "#FF0000",
                                width: "20%",
                                press: this.onControlDeletePress.bind(that)
                            })
                        ]
                    });
                    oView.byId("Section_1").addContent(datepicker);
                    break;
                case "note":
                    break;
                case "section":
                    SectionNo = SectionNo + 1;
                    var sectionID = "Section_" + SectionNo;
                    var sectionControl = new sap.ui.layout.VerticalLayout ({
                        class:"sapUiContentPadding",
                        id:sectionID,
                        width:"100%",
                        content: [
                            new sap.m.Title({
                                text: "Add Content",
                                wrapping: true
                            }),
                        ]
                    });
                    oView.byId("fieldControlDrop").addContent(sectionControl);
                    var sectionFields = new sap.m.HBox({
                        items: [
                            new sap.m.Title({
                                text: "New Section",
                                wrapping: true
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://edit",
                                color: "#0000FF",
                                width: "20%",
                                press: this.onControlEditPress.bind(that, oView)
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://delete",
                                color: "#FF0000",
                                width: "20%",
                                press: this.onControlDeletePress.bind(that)
                            })
                        ]

                    });
                    oView.byId(sectionID).addContent(sectionFields);
                    //oView.getController().attachDragAndDrop
                    break;
                default:
                    alert("unknown");
            }
        },

        onControlDeletePress: function (oEvent) {
            alert("Pressed Delete");
        },

        onControlEditPress: function (oView, oEvent) {
            var oButton = oEvent.getSource();

            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.sap.dynamicform1.view.ControlEdit",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
        }

    };
});