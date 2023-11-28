import React, { ReactNode, useState, ElementType } from "react";
import { Dialog } from "@headlessui/react";
import InfoButton from "./InfoButton";

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

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Dialog.Panel className="flex flex-col w-full max-w-md gap-2 p-4 bg-white shadow-xl items-left rounded-2xl">
            {title.length > 0 && <InfoTitle>{title}</InfoTitle>}

            {/* Here, we use the children prop to render the modal content */}
            <div className="text-sm text-slate-500">{children}</div>

            <div>
              <InfoButton onClick={() => setIsOpen(false)}>
                {buttonText}
              </InfoButton>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default InfoModal;

export function InfoTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Title
      className={`text-lg font-medium leading-6 text-gray-900 ${className}`}
    >
      {children}
    </Dialog.Title>
  );
}
