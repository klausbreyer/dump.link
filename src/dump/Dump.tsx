import React from 'react';

interface DumpProps {
  [key: string]: any;
}

const Dump: React.FC<DumpProps> = (props) => {
  return (
    <pre>
      {JSON.stringify(props, null, 2)}
    </pre>
  );
};

export default Dump;
