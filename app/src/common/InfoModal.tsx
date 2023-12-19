import React, { ReactNode, useState } from "react";
import InfoButton from "./InfoButton";
import Modal from "./Modal";
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6 ">
          {title.length > 0 && <Title>{title}</Title>}

          {/* Here, we use the children prop to render the modal content */}
          <div className="text-sm text-slate-500">{children}</div>

          <div>
            <InfoButton onClick={() => setIsOpen(false)}>
              {buttonText}
            </InfoButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InfoModal;
