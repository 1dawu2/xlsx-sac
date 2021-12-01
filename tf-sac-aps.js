(function () {
    let template = document.createElement("template");
    template.innerHTML = `
    <form id="form">
    <fieldset>
    <legend>Colored Box Properties</legend>
    <table>
    <tr>
    <td>Dimensions</td>
    <td><input id="builder_dimensions" type="text" size="5"
   maxlength="5"></td>
    </tr>  
    </table>    
    </fieldset>
    </form>
    <style>
    </style>
    `;
    class TensorflowBuilder extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._shadowRoot.getElementById("form").addEventListener("submit",
                this._submit.bind(this));
        }
        _submit(e) {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        dimensions: this.dimensions
                    }
                }
            }));
        }
        get dimensions() {
            return this._shadowRoot.getElementById("builder_dimensions").value;
        }

        set dimensions(newDimensions) {
            this._shadowRoot.getElementById("builder_dimensions").value =
                newDimensions;
        }
    }
    customElements.define("com-tf-sac-aps",TensorflowBuilder);
})();