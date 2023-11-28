import React, { useState, useRef } from "react";
import { Tooltip } from "./common/InfoTooltip";
import { currentUrl } from "./HeaderProject";

const ShareLink: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const selectText = () => {
    urlInputRef.current?.select();
  };

  return (
    <>
      <p className="mb-2">
        Share this link with your team to enable real-time collaboration. Each
        member can access and interact with the board instantly.
      </p>
      <p className="mb-2">
        Remember, it's crucial to save this link. As we currently don't support
        user logins, this link is the only way to access your board. Bookmarking
        it or keeping it in a safe place is highly recommended.
      </p>
      <div className="flex items-baseline justify-between mb-2">
        <Tooltip info="Click to copy">
          <input
            ref={urlInputRef}
            readOnly
            className="p-2 mt-2 border rounded-md cursor-pointer w-80 border-slate-300"
            value={currentUrl()}
            onClick={() => {
              copyToClipboard();
              selectText();
            }}
            onFocus={selectText}
          />
        </Tooltip>
        <p className={`font-bold ${isCopied ? "opacity-100" : "opacity-0"}`}>
          Copied!
        </p>
      </div>
    </>
  );
};

export default ShareLink;
