var jsonEditorObj = (function() {
    var container;
    var options;
    var editor;
    var json;
    return {
        init: () => {
            container = document.getElementById("jsoneditor");
            options = {
                
            };
            editor = new JSONEditor(container, options);
        },
        createJsonEditor: (contractName, elements, parties) => {
            parties.sort((a,b) => {return (a.partyName.toLowerCase() > b.partyName.toLowerCase()) ? 1 : ((b.partyName.toLowerCase() > a.partyName.toLowerCase()) ? -1 : 0);} );
            editor.setMode('view');
            elements = elements || [];
            parties = parties || [];
            // set json
            json = [{"agreementName":contractName || "","elements":elements, "parties":parties}];
            editor.set(json);
            editor.expandAll();
        },
        getJson: () => {
            return JSON.stringify(editor.get(), null, "     ");
        },
        destroy: () => {
            editor.set([{}]);
            editor.destroy();
        }
    };
})(jsonEditorObj)