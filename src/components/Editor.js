import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript"; // to enable javascript
// addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null); // TO store/capture the editor
  useEffect(() => {
    async function init() {
      // initialization function to be run only 1 time
      editorRef.current = Codemirror.fromTextArea(
        // method to convert textarea with 2 main options
        document.getElementById("realtimeEditor"), // first option to specify which textarea to modify
        {
          mode: { name: "javascript", json: true }, // to use javascript with json enabled
          theme: "dracula", // editor theme
          autoCloseTags: true, // automatically close tags
          autoCloseBrackets: true, // automatically close brackets
          lineNumbers: true, // line numbers
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        // event listener on editorRef, to capture change. We get the instance and changed in the callback.
        const { origin } = changes; // origin gives us the info about test written(for ex: cut, copy, paste, +input: inicates that there is some input)

        // to dynamically add text, or some pre written text, we can use setValue() method with useref
        const code = instance.getValue(); // all the content inside the editor
        onCodeChange(code); // code sync function
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            // emits the code change event using socket Ref
            roomId,
            code,
          });
        }
      });
    }
    init(); // called once
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      // if socketRef.current is not null
      // listening on soketRef as we need to send in socket
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          // if there is some code
          editorRef.current.setValue(code); // the set the same code in all of the other clients's editors using editorRef
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return <textarea id="realtimeEditor"></textarea>; // basic textarea
};

export default Editor;
