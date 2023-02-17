import Command from '@ckeditor/ckeditor5-core/src/command';

export default class TemplateVariableCommand extends Command {
	execute( name ) {
		this.editor.model.change( writer => {
			this.editor.model.insertContent(
				writer.createElement( 'templateVariable', { name } )
			);
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(
			selection.getFirstPosition(),
			'templateVariable'
		);

		this.isEnabled = allowedIn !== null;
	}
}
