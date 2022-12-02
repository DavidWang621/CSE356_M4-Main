import * as Y from 'yjs'
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'
import { fromUint8Array, toUint8Array } from 'js-base64'

class CRDTFormat {
  public bold?: Boolean = false;
  public italic?: Boolean = false;
  public underline?: Boolean = false;
};

exports.CRDT = class {
  ydoc: any
  ytext: any
  id: any
  cb: Function

  constructor(cb: (update: string, isLocal: Boolean) => void) {
    this.ydoc = new Y.Doc();
    this.ytext = this.ydoc.getText('quill');
    this.cb = cb;
    this.id = this.ydoc.clientID;
    ['update', 'insert', 'delete', 'insertImage', 'toHTML'].forEach(f => (this as any)[f] = (this as any)[f].bind(this));

    let tempID = this.id;
    this.ydoc.on('update', function(updateMessage:any) {
      // var string = new TextDecoder().decode(updateMessage);
      let jsonBody = {
        data: fromUint8Array(updateMessage),
        // u8int: updateMessage,
        // data: string,
        id: tempID
      }
      cb(JSON.stringify(jsonBody), true);
    });
  }

  update(update: string) {
    // var uint8array = new TextEncoder().encode(update);
    // Y.applyUpdate(this.ydoc, uint8array);
    Y.applyUpdate(this.ydoc, toUint8Array(update));
    let jsonBody = {
      data: update,
      id: this.id
    }
    this.cb(JSON.stringify(jsonBody), false);
  }

  insert(index: number, content: string, format: CRDTFormat) {
    this.ytext.insert(index, content, format);
  }

  delete(index: number, length: number) {
    this.ytext.delete(index, length);
  }

  insertImage(index: number, url: string) {
    let ops = [{ retain: index }, {insert: {image: url}}]
    this.ytext.applyDelta(ops);
  }

  toHTML() {
    let converter = new QuillDeltaToHtmlConverter(this.ytext.toDelta());
    return converter.convert();
  }
};
