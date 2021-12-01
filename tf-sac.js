(function () {
    let _shadowRoot;
    let _id;
    let _password;
    let _jsonData;

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
        <style>
        </style>
        <div id="ui5_content" name="ui5_content">
         <slot name="content"></slot>
        </div>
        <script id="oView" name="oView" type="sapui5/xmlview">
            <mvc:View
            controllerName="myView.Template"
                xmlns:html="http://www.w3.org/1999/xhtml"
                xmlns:mvc="sap.ui.core.mvc"
                displayBlock="true"
                xmlns="sap.m"
                xmlns:viz="sap.viz.ui5.controls"
                xmlns:layout="sap.ui.layout"
                xmlns:viz.feeds="sap.viz.ui5.controls.common.feeds"
                xmlns:viz.data="sap.viz.ui5.data"
            >
				<l:VerticalLayout
					class="sapUiContentPadding"
					width="100%">
					<l:content>
						<Input
							id="passwordInput"
							type="Password"
							placeholder="Enter password ..." liveChange="onButtonPress"/>
					</l:content>
				</l:VerticalLayout>
                <viz:VizFrame id="vizFrame" title="Column Chart" uiConfig="{applicationSet:'fiori'}" height='20rem' width="100%" vizType='column'>
                <viz:dataset>
                    <viz.data:FlattenedDataset data="{ColumnChartData>/data}">
                        <viz.data:dimensions>
                            <viz.data:DimensionDefinition name="Dates" value="{chartData>dates}"/>
                        </viz.data:dimensions>
                        <viz.data:measures>
                            <viz.data:MeasureDefinition name="Actuals" value="{chartData>measure}"/>
                        </viz.data:measures>
                    </viz.data:FlattenedDataset>
                </viz:dataset>
                <viz:feeds>
                    <viz.feeds:FeedItem uid="valueAxis" type="Measure" values="measure"/>
                    <viz.feeds:FeedItem uid="categoryAxis" type="Dimension" values="dates"/>
                </viz:feeds>
            </viz:VizFrame>
			</mvc:View>
        </script>        
    `;

    class Tensorflow extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            _shadowRoot.querySelector("#oView").id = _id + "_oView";

            _jsonData = {};


            this._export_settings = {};
            this._export_settings.password = "";

            this.addEventListener("click", event => {
                console.log('click');
            });
        }

        async renderData(resultSet) {

            const MEASURE_DIMENSION = 'Account'
            const dates = []
            const values = []
            const dataSet = []

            var tmpData = {}
            resultSet.forEach(dp => {
                const { rawValue, description } = dp[MEASURE_DIMENSION]
                const date = dp.Date.description

                tmpData = {
                    "dates": date,
                    "measure": rawValue
                }

                dataSet.push(tmpData);

                if (dates.indexOf(date) === -1) {
                    dates.push(date);

                }
                if (description === 'Volume') {
                    values.push(rawValue);
                }

            })
            _jsonData = dataSet


        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) { }
        }

        disconnectedCallback() {
            if (this._subscription) {
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            loadthis(this);
        }

        _firePropertiesChanged() {
            this.password = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        password: this.password
                    }
                }
            }));
        }

        // SETTINGS
        get password() {
            return this._export_settings.password;
        }
        set password(value) {
            value = _password;
            this._export_settings.password = value;
        }

        static get observedAttributes() {
            return [
                "password"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("com-tf-sac", Tensorflow);

    // UTILS
    function loadthis(that) {
        var that_ = that;

        let content = document.createElement('div');
        content.slot = "content";
        that_.appendChild(content);

        sap.ui.getCore().attachInit(function () {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "sap/m/MessageToast",
                "jquery.sap.global",
                "sap/ui/core/mvc/Controller"
            ], function (jQuery, Controller) {
                "use strict";

                return Controller.extend("myView.Template", {
                    onInit: function () {
                        var oJsonModel = new sap.ui.model.json.JSONModel(_jsonData);
                        this.getView().setModel(oJsonModel, "ColumnChartData");
                        var oVizFrame = this.getView().byId("vizFrame");
                        oVizFrame.setModel(oJsonModel, "ColumnChartData");
                        oVizFrame.setVizType("column");

                        var vizProperties = {
                            interaction: {
                                zoom: {
                                    enablement: "disabled"
                                },
                                selectability: {
                                    mode: "EXCLUSIVE"
                                }
                            },
                            valueAxis: {
                                title: {
                                    visible: false
                                },
                                visible: true,
                                axisLine: {
                                    visible: false
                                },
                                label: {
                                    linesOfWrap: 2,
                                    visible: false,
                                    style: {
                                        fontSize: "10px"
                                    }
                                }
                            },
                            categoryAxis: {
                                title: {
                                    visible: false
                                },
                                label: {
                                    linesOfWrap: 2,
                                    rotation: "fixed",
                                    angle: 0,
                                    style: {
                                        fontSize: "12px"
                                    }
                                },
                                axisTick: {
                                    shortTickVisible: false
                                }
                            },
                            title: {
                                text: "Example Column Chart with IBCS style semantics",
                                visible: true
                            },
                            legend: {
                                visible: false
                            },
                            plotArea: {
                                colorPalette: ["#007181"],
                                gridline: {
                                    visible: false
                                },
                                dataLabel: {
                                    visible: true,
                                    style: {
                                        fontWeight: 'bold'
                                    },
                                    hideWhenOverlap: false
                                },
                                seriesStyle: {
                                    "rules": [{
                                        "dataContext": {
                                            "Budget": '*'
                                        },
                                        "properties": {
                                            "dataPoint": {
                                                "pattern": "noFill"
                                            }
                                        }
                                    }]
                                },
                                dataPointStyleMode: "update"
                            }
                        };

                        oVizFrame.setVizProperties(vizProperties);
                        oVizFrame.setModel(oJsonModel, "chartData");
                        var oPopover = new sap.viz.ui5.controls.Popover({});
                        oPopover.connect(oVizFrame.getVizUid());
                        console.log(_jsonData);
                    },
                    onAfterRendering: function () {
                    },
                    onButtonPress: function (oEvent) {
                        _password = oView.byId("passwordInput").getValue();
                        that._firePropertiesChanged();
                        console.log(_password);

                        this.settings = {};
                        this.settings.password = "";

                        that.dispatchEvent(new CustomEvent("onStart", {
                            detail: {
                                settings: this.settings
                            }
                        }));
                        //console.log(_jsonData);
                    }
                });
            });

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView = sap.ui.xmlview({
                viewContent: jQuery(_shadowRoot.getElementById(_id + "_oView")).html(),
            });
            oView.placeAt(content);


            if (that_._designMode) {
                oView.byId("passwordInput").setEnabled(false);
            }
        });
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
})();