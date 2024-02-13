import React, { useState, useRef } from "react";
import { Tooltip } from "../common/InfoTooltip";
import { currentUrl } from "./HeaderProject";

type TabKey = "group" | "sequence" | "arrange";

const ShareLink: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTabKey, setSelectedTabKey] = useState<TabKey>("group"); // Default to 'group'
  const urlInputRef = useRef<HTMLInputElement>(null);
  const iframeInputRef = useRef<HTMLInputElement>(null);

  const tabs: Record<string, TabKey> = {
    "Dump & Task Grouper": "group",
    "Task Group Sequencer": "sequence",
    "Task Group Arranger": "arrange",
  };

  const getTabUrl = (tabKey: string): string => {
    return `${currentUrl()}?p=${encodeURIComponent(tabKey)}`;
  };

  const getEmbedCode = (tabKey: TabKey): string => {
    return `<iframe src="${getTabUrl(
      tabKey,
    )}" style="min-width: 1024px; width: 100%; min-height: 800px;" frameborder="0"></iframe>`;
  };

  const copyToClipboard = async (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      try {
        await navigator.clipboard.writeText(ref.current.value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  };

  const selectText = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.select();
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
      <div className="mb-2">
        <label htmlFor="tab-select">Choose what tab to share / embed:</label>
        <select
          id="tab-select"
          className="p-2 ml-2 border rounded-md cursor-pointer"
          onChange={(e) => setSelectedTabKey(tabs[e.target.value])}
          value={Object.keys(tabs).find((key) => tabs[key] === selectedTabKey)}
        >
          {Object.keys(tabs).map((tabName) => (
            <option key={tabName} value={tabName}>
              {tabName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-2 ">
        <label htmlFor="url-input">URL:</label>
        <Tooltip info="Click to copy">
          <input
            ref={urlInputRef}
            readOnly
            className="w-full p-2 mt-2 border rounded-md cursor-pointer border-slate-300"
            value={getTabUrl(selectedTabKey)}
            onClick={() => {
              copyToClipboard(urlInputRef);
              selectText(urlInputRef);
            }}
            onFocus={() => selectText(urlInputRef)}
          />
        </Tooltip>
      </div>
      <div className="mb-2">
        <label htmlFor="iframe-input">iFrame Embed Code:</label>
        <Tooltip info="Click to copy">
          <input
            ref={iframeInputRef}
            readOnly
            className="w-full p-2 mt-2 border rounded-md cursor-pointer border-slate-300"
            value={getEmbedCode(selectedTabKey)}
            onClick={() => {
              copyToClipboard(iframeInputRef);
              selectText(iframeInputRef);
            }}
            onFocus={() => selectText(iframeInputRef)}
          />
        </Tooltip>
      </div>

      <p>
        Embedding via iFrame is great for platforms like Notion, Confluence, and
        other tools that support iFrame. It allows you to integrate interactive
        content directly into your documentation or collaboration space.
      </p>
      <p
        className={`font-bold text-right ${
          isCopied ? "opacity-100" : "opacity-0"
        }`}
      >
        Copied!
      </p>
    </>
  );
};

export default ShareLink;
