import { Dialog } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import InfoButton from "./InfoButton";

interface InfoModal {
  title: string;
  info: string;
}

const InfoModal: React.FC<InfoModal> = ({ title, info }) => {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <InformationCircleIcon
        className="w-5 h-5 cursor-pointer text-slate-500"
        onClick={() => setIsOpen(!isOpen)}
      />
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Dialog.Panel className="flex flex-col w-full max-w-md gap-2 p-4 bg-white shadow-xl items-left rounded-2xl">
            <Dialog.Title
              className={"text-lg font-medium leading-6 text-gray-900"}
            >
              {title}
            </Dialog.Title>
            {info.split("\n").map((line, i) => (
              <Dialog.Description key={i} className={"text-slate-500 text-sm"}>
                {line}
              </Dialog.Description>
            ))}

            <div>
              <InfoButton onClick={() => setIsOpen(false)}>
                Got it, thanks!
              </InfoButton>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default InfoModal;
