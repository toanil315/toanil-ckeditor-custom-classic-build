import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
	toWidget,
	viewToModelPositionOutsideModelElement,
} from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import TemplateVariableCommand from "./TemplateVariableCommand";

export default class ProductPreviewEditing extends Plugin {
	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add(
			"insertTemplateVariable",
			new TemplateVariableCommand(this.editor)
		);

		this.editor.editing.mapper.on(
			"viewToModelPosition",
			viewToModelPositionOutsideModelElement(
				this.editor.model,
				(viewElement) => viewElement.hasClass("template-variable")
			)
		);
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register("templateVariable", {
			inheritAllFrom: "$inlineObject",
			allowAttributes: ["name"],
			allowWhere: "$text",
		});
	}

	_defineConverters() {
		const editor = this.editor;
		const conversion = editor.conversion;

		// <productPreview> converters ((data) view → model)
		conversion.for("upcast").elementToElement({
			view: {
				name: "span",
				classes: ["template-variable"],
			},
			model: (viewElement, modelWriter) => {
				const name = viewElement.getChild(0).data;

				return modelWriter.createElement("templateVariable", {
					name,
				});
			},
		});

		// <templateVariable> converters (model → data view)
		conversion.for("dataDowncast").elementToElement({
			model: "templateVariable",
			view: (modelElement, viewWriter) => {
				return createTemplateVariableView(modelElement, viewWriter);
			},
		});

		// <templateVariable> converters (model → editing view)
		conversion.for("editingDowncast").elementToElement({
			model: "templateVariable",
			view: (modelElement, viewWriter) => {
				const widgetElement = createTemplateVariableView(
					modelElement,
					viewWriter
				);

				// Enable widget handling on a placeholder element inside the editing view.
				return toWidget(widgetElement, viewWriter);
			},
		});

		// Helper method for both downcast converters.
		function createTemplateVariableView(modelElement, viewWriter) {
			const name = modelElement.getAttribute("name");

			const templateVariableView = viewWriter.createContainerElement(
				"span",
				{
					class: "template-variable",
				}
			);

			// Insert the placeholder name (as a text).
			const innerText = viewWriter.createText(name);
			viewWriter.insert(
				viewWriter.createPositionAt(templateVariableView, 0),
				innerText
			);

			return templateVariableView;
		}
	}
}
