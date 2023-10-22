sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/library",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, DragInfo, DropInfo, coreLibrary, MessageBox) {
	"use strict";

	// shortcut for sap.ui.core.dnd.DropLayout
	var DropLayout = coreLibrary.dnd.DropLayout;
	// shortcut for sap.ui.core.dnd.DropPosition
	var DropPosition = coreLibrary.dnd.DropPosition;
	var SectionNo = 1;

	return Controller.extend("com.sap.dynamicform1.controller.View1", {
		onInit: function () {
			var sPath = jQuery.sap.getModulePath("com.sap.dynamicform1.model", "/fieldControl.json");
			var oModel = new JSONModel(sPath);         //size="{sizes>/pane2}"
			this.getView().setModel(oModel, "templateModel");
			this.attachDragAndDrop("Section_1");
			this._wizard = this.byId("CreateTemplateWizard");
			this._oNavContainer = this.byId("wizardNavContainer");
			this._oWizardContentPage = this.byId("wizardContentPage");

			// this.model.setProperty("/productType", "Mobile");
			// this.model.setProperty("/availabilityType", "In Store");
			// this.model.setProperty("/navApiEnabled", true);
			// this.model.setProperty("/productVAT", false);
			// this.model.setProperty("/measurement", "");
			// this._setEmptyValue("/productManufacturer");
			// this._setEmptyValue("/productDescription");
			// this._setEmptyValue("/size");
			// this._setEmptyValue("/productPrice");
			// this._setEmptyValue("/manufacturingDate");
			// this._setEmptyValue("/discountGroup");

		},

		// setProductTypeFromSegmented: function (evt) {
		// 	var productType = evt.getParameters().item.getText();
		// 	this.model.setProperty("/productType", productType);
		// 	this._wizard.validateStep(this.byId("ProductTypeStep"));
		// },

		additionalInfoValidation: function () {
			var name = this.byId("TemplateName").getValue();
			if (name.length < 6) {
				this._wizard.setCurrentStep(this.byId("TemplateInfoStep"));
				this.getView().getModel("templateModel").setProperty("/templateNameState", "Error");
			} else {
				this.getView().getModel("templateModel").setProperty("/templateNameState", "None");
			}

			if (name.length < 6) {
				this._wizard.invalidateStep(this.byId("TemplateInfoStep"));
			} else {
				this._wizard.validateStep(this.byId("TemplateInfoStep"));
			}
		},

		formDesignerStepActivation: function () {
			MessageToast.show(
				'Form Designer Enabled.'
			);
		},

		formDesignerStepCompletion: function () {
			this.getView().getModel("templateModel").setProperty("/navApiEnabled", false);
			MessageToast.show(
				'This event is fired on complete of Step3. You can use it to gather the information, and lock the input data.'
			);
		},

		scrollFrom4to2: function () {
			this._wizard.goToStep(this.byId("ProductInfoStep"));
		},

		goFrom4to3: function () {
			if (this._wizard.getProgressStep() === this.byId("PricingStep")) {
				this._wizard.previousStep();
			}
		},

		goFrom4to5: function () {
			if (this._wizard.getProgressStep() === this.byId("PricingStep")) {
				this._wizard.nextStep();
			}
		},

		wizardCompletedHandler: function () {
			this._oNavContainer.to(this.byId("wizardReviewPage"));
		},

		backToWizardContent: function () {
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},

		editStepOne: function () {
			this._handleNavigationToStep(0);
		},

		editStepTwo: function () {
			this._handleNavigationToStep(1);
		},

		editStepThree: function () {
			this._handleNavigationToStep(2);
		},

		editStepFour: function () {
			this._handleNavigationToStep(3);
		},

		_handleNavigationToStep: function (iStepNumber) {
			var fnAfterNavigate = function () {
				this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
				this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}.bind(this);

			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this.backToWizardContent();
		},

		_handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this._handleNavigationToStep(0);
						this._wizard.discardProgress(this._wizard.getSteps()[0]);
					}
				}.bind(this)
			});
		},

		_setEmptyValue: function (sPath) {
			this.model.setProperty(sPath, "n/a");
		},

		handleWizardCancel: function () {
			this._handleMessageBoxOpen("Are you sure you want to cancel your report?", "warning");
		},

		handleWizardSubmit: function () {
			this._handleMessageBoxOpen("Are you sure you want to submit your report?", "confirm");
		},

		productWeighStateFormatter: function (val) {
			return isNaN(val) ? "Error" : "None";
		},

		discardProgress: function () {
			this._wizard.discardProgress(this.byId("ProductTypeStep"));

			var clearContent = function (content) {
				for (var i = 0; i < content.length; i++) {
					if (content[i].setValue) {
						content[i].setValue("");
					}

					if (content[i].getContent) {
						clearContent(content[i].getContent());
					}
				}
			};

			this.model.setProperty("/productWeightState", "Error");
			this.model.setProperty("/productNameState", "Error");
			clearContent(this._wizard.getSteps());
		},

		onDropFormArea: function (oEvent) {
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContextPath = oDraggedItem.getBindingContextPath();
			var controlID = oDraggedItemContextPath + "/ControlId";
			var controlValue = this.getView().getModel("templateModel").getProperty(controlID);
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

		attachDragAndDrop: function (sectionID) {
			var oForm = this.getView().byId(sectionID);
			oForm.addDragDropConfig(new DropInfo({
				groupName: "list2customList",
				dropEffect: coreLibrary.dnd.DropEffect.Copy,
				dropPosition: DropPosition.OnOrBetween,
				drop: this.onDropFormArea.bind(this),
				dropLayout: DropLayout.Horizontal
			}));
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
		},

		OnFormSave: function(oEvent)
		{
			this._wizard.validateStep(this.byId("FormDesignerInfoStep"));
		},

		OnOrderTypeSelection: function(oEvent)
		{
			var selectedItem = this.getView().getModel("templateModel").getProperty("/templateOrderMap");
			if (selectedItem) {
				this.getView().getModel("templateModel").setProperty("/templateOrderMapState", "None");
				this._wizard.validateStep(this.byId("TemplateMapStep"));
			} else {
				this.getView().getModel("templateModel").setProperty("/templateOrderMapState", "Error");
				this._wizard.invalidateStep(this.byId("TemplateMapStep"));
			}
		}
	});
});
