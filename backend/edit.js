import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import { fromUint8Array, toUint8Array } from 'js-base64'

const IP = "twice.cse356.compas.cs.stonybrook.edu"

Quill.register('modules/cursors', QuillCursors);

window.addEventListener('load', () => {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('quill');

    const editor = new Quill('#editor', {
        modules: {
            cursors: true,
            toolbar: [
                ['bold', 'italic', 'underline'],
                ['image', 'code-block']
            ],
            history: {
                userOnly: true
            }
        },
        placeholder: 'Start collaborating...',
        theme: 'snow'
    });
    const cursors = editor.getModule('cursors');

    const binding = new QuillBinding(ytext, editor);

    let docID = document.getElementById('docID').innerText;
    // console.log("DOCID FOR EDITOR", docID);
    let clientID = undefined;

    // every update to document made
    ydoc.on('update', (update, origin, doc, tr) => {
        // console.log("update happening", update);
        // // console.log("the update", fromUint8Array(update));
        fetch("http://" + IP + "/api/op/" + docID, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({clientID: clientID, id: docID, data: fromUint8Array(update)})
        });
    });

    editor.on('selection-change', function(range, oldRange, source) {
        fetch("http://" + IP + "/api/presence/" + docID, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                index: range === null ? null : range.index, 
                length: range === null ? null : range.length, 
                clientID: clientID})
        });
    });

    // create web-event connection to document
    let eventStream = new EventSource("http://" + IP + "/api/connect/" + docID);
    eventStream.addEventListener('sync', function(event) {
        // let eventData = JSON.parse(event.data);
        // // console.log("Sync event caught!", event);
        // editor.setText("");
        // editor.updateContents(eventData.update);
        clientID = event.lastEventId;
        Y.applyUpdate(ydoc, toUint8Array(event.data), clientID);
    });
    eventStream.addEventListener('update', function(event) {
        // // console.log("UPDATE EVENT LISTENER",event);
        // let eventData = JSON.parse(event.data);
        // // console.log("Update event caught!", eventData);
        // Y.applyUpdate(ydoc, toUint8Array(eventData.update), clientID);
        Y.applyUpdate(ydoc, toUint8Array(event.data), event.lastEventId);
        // // console.log("FINISHED APPLYING UPDATES");
    });
    eventStream.addEventListener('presence', function(event) {
        let eventData = JSON.parse(event.data);
        // // console.log("Presence event caught!", eventData);

        // create if name not in cursor list [Not recreated if it exists]
        cursors.createCursor(eventData.name, eventData.name, "#" + Math.floor(8388607 + Math.random()*4194303).toString(16));
        
        if (eventData.cursor) { // update if name in cursor list and remote cursor is { index, length }
            cursors.moveCursor(eventData.name, eventData.cursor);
        } else { // delete if name in cursor list but remote cursor is {}
            cursors.removeCursor(eventData.name);
        }
    }); 

    // The keyword "globalThis" allows variables to be "global"
    // JS in quill.html calls these variables by: <variable>
    globalThis.yjs = { ydoc, ytext, binding, Y }
    // globalThis.doc = { getDocument }
})