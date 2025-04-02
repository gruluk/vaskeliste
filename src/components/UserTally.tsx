import React from 'react';

type Props = {
  userName: string;
  tallyCount: number;
  highlight?: boolean;
};

export default function UserTally({ userName, tallyCount, highlight }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center border border-black p-2 rounded text-center ${
        highlight ? 'border-yellow-500' : ''
      }`}
    >
      <span className="font-semibold text-black">
        {userName} {highlight && '👑'}
      </span>
      <span className="text-lg font-mono text-black">{tallyCount}</span>
    </div>
  );
}
