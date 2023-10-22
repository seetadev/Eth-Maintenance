sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/library",
	"com/sap/dynamicform1/model/UtilLibrary",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, DragInfo, DropInfo, coreLibrary, UtilLibrary, Fragment) {
	"use strict";
	// shortcut for sap.ui.core.dnd.DropLayout
	var DropLayout = coreLibrary.dnd.DropLayout;

	// shortcut for sap.ui.core.dnd.DropPosition
	var DropPosition = coreLibrary.dnd.DropPosition;

	var SectionNo = 1;

	return Controller.extend("com.sap.dynamicform1.controller.View1", {
		onInit: function () {
			var sPath = jQuery.sap.getModulePath("com.sap.dynamicform1.model", "/fieldControl.json");
			this.attachDragAndDrop("Section_1");
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sPath);         //size="{sizes>/pane2}"
			this.getView().setModel(oModel, "controlModel");

			// var oModelSizes = new JSONModel({
			//     pane1: "auto",
			//     pane2: "auto",
			//     pane3: "auto"
			// });

			// this.getView().setModel(oModelSizes, "sizes");
		},

		onDropControls: function (oEvent) {
			alert("drag");
			// var oDraggedItem = oEvent.getParameter("draggedControl");
			// var oDraggedItemContext = oDraggedItem.getBindingContext();
			// if (!oDraggedItemContext) {
			// 	return;
			// }

			// // reset the rank property and update the model to refresh the bindings
			// var oAvailableProductsTable = Utils.getAvailableProductsTable(this);
			// var oProductsModel = oAvailableProductsTable.getModel();
			// oProductsModel.setProperty("Rank", Utils.ranking.Initial, oDraggedItemContext);
		},

		onDropFormArea: function (oEvent) {
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContextPath = oDraggedItem.getBindingContextPath();
			var controlID = oDraggedItemContextPath + "/ControlId";
			var controlValue = this.getView().getModel("controlModel").getProperty(controlID);
			var that = this;
			//UtilLibrary.addControlToForm(controlValue,oView, that, SectionNo);
			switch (controlValue) {
				case "inputtext":
					var inputField = new sap.m.HBox({
						width: "100%",
						alignItems: "Center",
						renderType: "Bare",
						items: [
							new sap.m.Label({ text: "Field Label", textAlign: "Left", width: "40%" }),
							new sap.m.Input({ class: "sapUiSmallMarginBottom" }),
							new sap.ui.core.Icon({
								src: "sap-icon://edit",
								color: "#0000FF",
								width: "20%",
								press: this.onControlEditPress.bind(this)
							}),
							new sap.ui.core.Icon({
								src: "sap-icon://delete",
								color: "#FF0000",
								width: "20%",
								press: this.onControlDeletePress.bind(that)
							})
						]
					});
					var dropID = oEvent.getSource().getParent().getId();
					this.getView().byId(dropID).addContent(inputField);
					break;
				case "datepicker":
					var datepicker = new sap.m.HBox({
						width: "100%",
						renderType: "Bare",
						alignItems: "Center",
						items: [
							new sap.m.Label({ text: "Field Label", textAlign: "Left", width: "40%" }),
							new sap.m.DatePicker({ class: "sapUiSmallMarginBottom" }),
							new sap.ui.core.Icon({
								src: "sap-icon://edit",
								color: "#0000FF",
								width: "20%",
								press: this.onControlEditPress.bind(this)
							}),
							new sap.ui.core.Icon({
								src: "sap-icon://delete",
								color: "#FF0000",
								width: "20%",
								press: this.onControlDeletePress.bind(that)
							})

						]
					});
					var dropID = oEvent.getSource().getParent().getId();
					this.getView().byId(dropID).addContent(datepicker);
					break;
				case "note":
					break;
				case "section":
					SectionNo = SectionNo + 1;
					var sectionID = "Section_" + SectionNo;
					var sectionControl = new sap.ui.layout.VerticalLayout({
						class: "sapUiContentPadding",
						id: this.createId(sectionID),
						width: "100%"
					});
					this.getView().byId("fieldControlDrop").addContent(sectionControl);
					var sectionFields = new sap.m.HBox({
						renderType: "Bare",
						alignItems: "Center",
						items: [
							new sap.m.Title({
								text: "New Section",
								width: "70%"
							}),
							new sap.m.HBox({
								width: "100%",
								renderType: "Bare",
								justifyContent: "End",
								items: [
									new sap.ui.core.Icon({
										src: "sap-icon://edit",
										color: "#0000FF",
										width: "20%",
										press: this.onControlEditPress.bind(this)
									}),
									new sap.ui.core.Icon({
										src: "sap-icon://delete",
										color: "#FF0000",
										width: "20%",
										press: this.onControlDeletePress.bind(that)
									})
								]
							})
						]

					});
					this.getView().byId(sectionID).addContent(sectionFields);
					this.attachDragAndDrop(sectionID);
					break;
				default:
					alert("unknown");
			}
		},

		onDropIndicatorSize: function (oEvent) {
			alert("yes");
		},

		attachDragAndDrop: function (sectionID) {
			var oForm = this.getView().byId(sectionID);
			oForm.addDragDropConfig(new DropInfo({
				groupName: "list2customList",
				dropEffect: coreLibrary.dnd.DropEffect.Copy,
				dropPosition: DropPosition.OnOrBetween,
				drop: this.onDropFormArea.bind(this),
				dropIndicatorSize: this.onDropIndicatorSize.bind(this),
				dropLayout: DropLayout.Horizontal
			}));
		},

		handleCloseButton: function (oEvent) {
			this.byId("editControl").close();
		},

		onControlDeletePress: function (oEvent) {
			alert("Pressed Delete");
		},

		onControlEditPress: function (oEvent) {
			var oButton = oEvent.getSource();
			var that = this;
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: this.getView().getId(),
					name: "com.sap.dynamicform1.view.ControlEdit",
					controller: this
				}).then(function (oPopover) {
					that.getView().addDependent(oPopover);
					return oPopover;
				});
			}
			this._pPopover.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		}
	});
});
