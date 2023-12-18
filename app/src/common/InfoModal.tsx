import React, { ReactNode, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InfoButton from "./InfoButton";
import Title from "./Title";
import Modal from "./Modal";

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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {title.length > 0 && <Title>{title}</Title>}

        {/* Here, we use the children prop to render the modal content */}
        <div className="text-sm text-slate-500">{children}</div>

        <div>
          <InfoButton onClick={() => setIsOpen(false)}>{buttonText}</InfoButton>
        </div>
      </Modal>
    </>
  );
};

export default InfoModal;
