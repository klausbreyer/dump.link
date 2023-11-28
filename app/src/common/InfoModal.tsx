import React, { ReactNode, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InfoButton from "./InfoButton";
import Title from "./Title";

interface InfoModalProps {
  icon: ReactNode;
  title: string;
  children: ReactNode; // ReactNode to accept any kind of react content
  buttonText: string;
  open?: boolean;
}

const InfoModal: React.FC<InfoModalProps> = ({
  icon,
  title,
  open,
  children,
  buttonText,
}) => {
  let [isOpen, setIsOpen] = useState(open || false);

  return (
    <>
      <span onClick={() => setIsOpen(!isOpen)}>{icon}</span>

      <Transition show={isOpen} as={Fragment}>
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 flex items-center justify-center p-6">
              <Dialog.Panel className="flex flex-col w-full max-w-md gap-2 p-4 bg-white shadow-xl items-left rounded-2xl">
                {title.length > 0 && <Title>{title}</Title>}

                {/* Here, we use the children prop to render the modal content */}
                <div className="text-sm text-slate-500">{children}</div>

                <div>
                  <InfoButton onClick={() => setIsOpen(false)}>
                    {buttonText}
                  </InfoButton>
                </div>
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

export default InfoModal;
